import { HandTypesBase, voucherDirectory, packageDirectory } from "$lib/cardDirectory";
import type { Card, CardItem, GameState, VoucherItem, JokerItem, PackageItem, Package } from "$lib/interfaces";
import { gameStore, lobbyStore, packageStore, socketStore, userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import { timePerPhase } from "$lib/gameDirectory";
import { logFullState, setPhaseTo } from "$lib/game-utils/phaseManager";
import { getNextKey } from "$lib/keyGenerator";
import { addToHand, playAnimation } from "$lib/game-utils/playPhaseManager";

// -----------------------
// ALL PHASE FUNCS
// -----------------------

/**
 * Starts the game (only available for the host)
 */
export function startGame() {
	console.log("<- start_game:", get(lobbyStore).code);
	get(socketStore).emit("start_game", get(lobbyStore).code);
}

/**
 * Request all the player info to the server to do a full update
 */
export function requestGamePhasePlayerInfo(){
	console.log("<- request_game_phase_player_info:", get(lobbyStore).code);
	get(socketStore).emit("request_game_phase_player_info", get(lobbyStore).code);
}

/**
 * Updates the gameStore to the current info on server
 * @param args info on server about the player
 */
export function fullStateUpdate(args:any){
	try{
		const newPhase:number = stringToPhase(args.phase);
		let timeLeft = 99999;
		if(newPhase >= 0 && newPhase < timePerPhase.length){
			timeLeft = timePerPhase[newPhase] - secondsSince(args.timeout);

			gameStore.update((state: GameState) => ({
				...state,
				timeLeft: timeLeft,
				phase: newPhase,
				minScore: args.current_base_blind - args.player_data.total_points,
				pot: args.current_pot,
				maxRounds: args.max_rounds,
				round: args.current_round,
				handCards: [],
				discards: args.player_data.discards_left,
				hands: args.player_data.hand_plays_left,
				deckSize: args.player_data.unplayed_cards + args.player_data.played_cards,
				deckLeft: args.player_data.unplayed_cards,
				money: args.player_data.players_money,
				jokers: [],
				vouchers: []
			}));

			addToHand(argsToCards(args.player_data.current_hand));

			// Change later when full state getter is done
			if(newPhase === 1 && get(gameStore).handCards.length === 0){
				getFullHand()
			}
		}else{
			// If state is none, try again in 500ms
			setTimeout(() => {requestGamePhasePlayerInfo();},500,);
		}
	}catch(err:any){
		console.error("Error on fullStateUpdate:",err)
	}
}

/**
 * Turns the phase from a string given by the server to the number
 * @param phase 
 */
function stringToPhase(phase:string):number{
	switch(phase){
		case "none": return -1;
		case "blind": return 0;
		case "play_round": return 1;
		case "shop": return 2;
		case "vouchers": return 3;
		case "announce_winner": return 4;
	}
	return -2;
}

/**
 * Turns a date given from the server to the seconds that have passed since
 * @param time Date on format 2025-04-19T13:12:43.589464205+02:00
 * @returns Seconds since that date
 */
function secondsSince(time: string): number {
    const parsedTime = new Date(time);
    const now = new Date();
    const diffInSeconds = (now.getTime() - parsedTime.getTime()) / 1000;
    return Math.floor(diffInSeconds);
}

/**
 * Turns the string array given by te server to a Card[]
 * @param deck
 * @returns 
 */
function argsToCards(deck:{Rank:string, Suit:string, Enhancement:number}[]): Card[]{
	let ret:Card[] = [];
	for(let i=0; i<deck.length; i++){
		let newCard:Card = {
			rank: deck[i].Rank,
			suit: deck[i].Suit,
			faceUp: true,
			overlay: deck[i].Enhancement
		}
		ret.push(newCard);
	}
	return ret;
}

/**
 * Converts a :Card to a format the server understands
 * @param card To convert
 * @returns Converted card
 */
function cardToArgs(card:Card):{rank:string, suit:string, Enhancement:number}{
	return {rank:card.rank, suit: card.suit, Enhancement:card.overlay};
}



// -----------------------
// BLIND PHASE FUNCS
// -----------------------

/**
 * Propose to the blind phase the number of score to beat
 * @param blind score to propose
 */
export function proposeBlind(blind:number){
	console.log("<- propose_blind:", blind, get(lobbyStore).code);
	get(socketStore).emit("propose_blind", blind, get(lobbyStore).code);
}

/**
 * Function called on 'starting_next_blind' event
 * @param args given by the server
 */
export function blindPhaseSetup(args:any){
	// Update base blind (minScore)
	gameStore.update((state: GameState) => ({
		...state,
		minScore: args.base_blind,
		proposedBlind: args.base_blind,
		timeLeft: timePerPhase[0] - secondsSince(args.timeout_start_date)
	}));
	
	// Update phase
	setPhaseTo(0);	
}

/**
 * Callback after getting the 'blind_updated' event
 * @param args of the response from server
 */
export function updateMinimunScore(args:any) {
	if(args.proposed_by === get(userDataStore).username){
		gameStore.update((state: GameState) => ({
			...state,
			minScore: args.new_blind
		}));
	}
}



// -----------------------
// PLAY PHASE FUNCS
// -----------------------


/**
 * Emits a play_hand with the current state.playedCards and state.jokers
 */
export function playHand(){
	const state:GameState = get(gameStore);

	let hand:any[] = [];
	state.playedCards.forEach(card => {
		hand.push(cardToArgs(card.card));
	});

	let juglares:number[] = [0,0,0,0,0];
	for(let i=0; i<state.jokers.length; i++){
		juglares[i] = state.jokers[i].jokerId;
	}

	const handData = {
		cards: hand,
		jokers: {
			juglares: juglares,
		},
		gold: state.money,
	};

	console.log("<- play_hand", handData);
	get(socketStore).emit("play_hand", handData);
}

/**
 * Discards via websocket all cards in state.handCards that have picked === true
 */
export function discardHand(){
	const state:GameState = get(gameStore);

	const discartedCards:CardItem[] = state.handCards.filter(
		(cardItem) => cardItem.picked,
	);

	const args:any = [];
	discartedCards.forEach(element => {
		args.push(cardToArgs(element.card))
	});

	console.log("<- discard_cards", args);
	get(socketStore).emit("discard_cards", args);
}

/**
 * Requests the complete deck information
 */
export function getFullDeck() {
	console.log("<- get_full_deck", get(lobbyStore).code);
	get(socketStore).emit("get_full_deck", get(lobbyStore).code);
} 

/**
 * Requests the current hand of player
 */
export function getFullHand() {
	console.log("<- get_cards");
	get(socketStore).emit("get_cards");
} 

/**
 * Function called on 'got_cards' event
 * Gets the cards in args and adds them in th state.handCards
 * @param args given by the server
 */
export function updateHand(args:any){
	gameStore.update((state: GameState) => ({
		...state,
		handCards:[],
	}));

	addToHand(argsToCards(args.current_hand));
}

/**
 * Function called on 'played_hand' event
 * Updates score and plays animations
 * @param args given by the server
 */
export function playedHand(args:any){
	const newHand:Card[] = argsToCards(args.new_cards);
	addToHand(newHand);

	gameStore.update((state: GameState) => ({
		...state,
		hands: args.left_plays,
		money: args.gold,
		deckLeft: args.unplayed_cards,
		animVariables:{
			...state.animVariables,
			activatedJokers:args.jokersTriggered,
			scoreCards:argsToCards(args.scored_cards)
		}
	}));

	playAnimation(args.hand_type-1, args.blue_score, args.red_score, args.total_score);
}

/**
 * Function called on 'discarded_cards' event
 * Updates state.handcards to get the new card after discard
 * @param args given by the server
 */
export function discardedCards(args:any){
	const state:GameState = get(gameStore);

	const newHand:CardItem[] = state.handCards.filter(
		(cardItem) => !cardItem.picked,
	);

	gameStore.update((state: GameState) => ({
		...state,
		handCards: newHand,
		discards:args.left_discards,
		deckLeft:args.unplayed_cards,
	}));

	addToHand(argsToCards(args.new_cards));

}

/**
 * Function called on 'full_deck' event
 * Updates the current game state to update the deckLeft
 * @param args given by the server
 */
export function updateDeck(args:any) {
	console.error("updateDeck function not implemented");
}

/**
 * Function called on 'starting_round' event
 * @param args given by the server
 */
export function playPhaseSetup(args:any){
	// Update base blind (minScore), and round
	gameStore.update((state: GameState) => ({
		...state,
		minScore: args.blind,
		round: args.round_number,
		timeLeft: timePerPhase[1] - secondsSince(args.timeout_start_date),
		deckSize: args.current_deck_size,
		pot: args.current_pot,
		hands: args.total_hand_plays,
		discards: args.total_discards
	}));

	// Update phase
	setPhaseTo(1);	

	// Get cards
	getFullHand();
}




// -----------------------
// SHOP PHASE FUNCS
// -----------------------


/**
 * Handles the shop phase setup
 * @param args given by the server
 */
export function shopPhaseSetup(args: any) {
    
    gameStore.update((state: GameState) => {
        // Initialize empty shop arrays
        state.shop.jokerRow = [];
        state.shop.voucherRow = [];
        state.shop.packageRow = [];
        
        // Process rerollable items (jokers)
        if (args.shop && args.shop.rerollable_items && Array.isArray(args.shop.rerollable_items)) {
            args.shop.rerollable_items.forEach((item: any) => {
                if (item.type === 'joker') {
                    state.shop.jokerRow.push({
                        id: item.id,
                        jokerId: item.joker_id,
                        edition: item.edition || 0,
                        sellAmount: item.price || 0,
                        picked: false
                    });
                }
            });
        } else if (args.rerollable_items && Array.isArray(args.rerollable_items)) {
            args.rerollable_items.forEach((item: any) => {
                if (item.type === 'joker') {
                    state.shop.jokerRow.push({
                        id: item.id,
                        jokerId: item.joker_id,
                        edition: item.edition || 0,
                        sellAmount: item.price || 0,
                        picked: false
                    });
                }
            });
        }
        
        // Process vouchers and modifiers (combining both as vouchers)
        if (args.shop && args.shop.rerollable_items && Array.isArray(args.shop.rerollable_items)) {
            args.shop.rerollable_items.forEach((item: any) => {
                if (item.type === 'voucher' || item.type === 'modifier') {
                    state.shop.voucherRow.push({
                        id: item.id,
                        voucherId: item.voucher_id || item.modifier_id,
                        sellAmount: item.price || 0,
                        picked: false
                    });
                }
            });
        } else if (args.rerollable_items && Array.isArray(args.rerollable_items)) {
            args.rerollable_items.forEach((item: any) => {
                if (item.type === 'voucher' || item.type === 'modifier') {
                    state.shop.voucherRow.push({
                        id: item.id,
                        voucherId: item.voucher_id || item.modifier_id,
                        sellAmount: item.price || 0,
                        picked: false
                    });
                }
            });
        }
        
        // Add fixed modifiers to voucher row
        if (args.shop && args.shop.fixed_modifiers && Array.isArray(args.shop.fixed_modifiers)) {
            args.shop.fixed_modifiers.forEach((mod: any) => {
                state.shop.voucherRow.push({
                    id: mod.id,
                    voucherId: mod.modifier_id,
                    sellAmount: mod.price || 0,
                    picked: false
                });
            });
        } else if (args.fixed_modifiers && Array.isArray(args.fixed_modifiers)) {
            args.fixed_modifiers.forEach((mod: any) => {
                state.shop.voucherRow.push({
                    id: mod.id,
                    voucherId: mod.modifier_id,
                    sellAmount: mod.price || 0,
                    picked: false
                });
            });
        }
        
        // Process fixed packs
        if (args.shop && args.shop.fixed_packs && Array.isArray(args.shop.fixed_packs)) {
            args.shop.fixed_packs.forEach((pack: any) => {
                state.shop.packageRow.push({
                    id: pack.id,
                    packageId: pack.pack_seed % 3, // Using pack_seed to determine packageId
                    sellAmount: pack.price || 0,
                    contents: [] // Empty contents array for type requirement
                });
            });
        } else if (args.fixed_packs && Array.isArray(args.fixed_packs)) {
            args.fixed_packs.forEach((pack: any) => {
                state.shop.packageRow.push({
                    id: pack.id,
                    packageId: pack.pack_seed % 3, // Using pack_seed to determine packageId
                    sellAmount: pack.price || 0,
                    contents: [] // Empty contents array for type requirement
                });
            });
        }
        
        // Set reroll amount based on reroll_count
        if (args.shop && args.shop.reroll_count !== undefined) {
            state.rerollAmount = Math.max(2, args.shop.reroll_count + 2); // Base cost + count
        } else if (args.reroll_count !== undefined) {
            state.rerollAmount = Math.max(2, args.reroll_count + 2); // Base cost + count
        } else {
            state.rerollAmount = 2;
        }
        
        // Update money if provided
        if (args.money !== undefined) {
            state.money = args.money;
        }
        
        // CRITICAL: Update phase to shop phase (2)
        state.phase = 2;
        state.actionBlocked = false;
        
        // Set timeLeft for the shop phase
        if (args.timeout && args.timeout_start_date) {
            state.timeLeft = args.timeout - secondsSince(args.timeout_start_date);
        } else if (args.shop && args.shop.timeout && args.shop.timeout_start_date) {
            state.timeLeft = args.shop.timeout - secondsSince(args.shop.timeout_start_date);
        }
        
        // Debug logging
        console.log("Shop phase setup complete:", {
            jokers: state.shop.jokerRow.length,
            vouchers: state.shop.voucherRow.length,
            packages: state.shop.packageRow.length,
            money: state.money,
            phase: state.phase,
            actionBlocked: state.actionBlocked
        });
        
        return state;
    });
    
    // Ensure phase is fully updated in UI
    setPhaseTo(2);
}


/**
 * Emits a buy_joker event to purchase a joker from the shop
 * @param jokerId ID of the joker to buy
 * @param price Price of the joker
 */
export function buyJoker(jokerId: number, price: number) {
    console.log("<- buy_joker:", jokerId, price);
    get(socketStore).emit("buy_joker", jokerId, price);
}

/**
 * Emits a buy_voucher event to purchase a voucher from the shop
 * @param voucherId ID of the voucher to buy
 * @param price Price of the voucher
 */
export function buyVoucher(voucherId: number, price: number) {
    console.log("<- buy_voucher:", voucherId, price);
    get(socketStore).emit("buy_voucher", voucherId, price);
}




/**
 * Adds money to the player's balance (for testing purposes)
 * @param amount Amount of money to add
 */
export function addMoney(amount: number = 10000) {
    console.log(`Adding ${amount} money for testing`);
    gameStore.update((state: GameState) => ({
        ...state,
        money: state.money + amount
    }));
}

/**
 * Emits a buy_pack event to buy a pack from the shop
 * @param packId ID of the pack to buy
 * @param price Price of the pack
 */
export function buyPackage(packId: number, price: number) {
	console.log("<- buy_pack:", packId, price);
	get(socketStore).emit("buy_pack", packId, price);
}

/**
 * Emits a sell_joker event to sell a joker from the inventory
 * @param jokerId ID of the joker to sell
 */
export function sellJoker(jokerId: number) {
	console.log("<- sell_joker:", jokerId);
	get(socketStore).emit("sell_joker", jokerId);
}

/**
 * Emits a reroll_shop event to refresh the shop items
 */
export function rerollShop() {
	console.log("<- reroll_shop");
	get(socketStore).emit("reroll_shop");
}

/**
 * Emits a pack_selection event to select items from an opened pack
 * @param packId ID of the pack
 * @param selectedCard Selected card
 * @param selectedJokerId ID of the selected joker
 */
export function selectPackItems(packId: number, selectedCard: any, selectedJokerId: number) {
	console.log("<- pack_selection:", packId, selectedCard, selectedJokerId);
	get(socketStore).emit("pack_selection", packId, selectedCard, selectedJokerId);
}

export function continueShop(){
    console.log("<- continue_to_vouchers");
    get(socketStore).emit("continue_to_vouchers");
    gameStore.update((state: GameState) => ({
        ...state,
        actionBlocked: true
    }));
}

/**
 * Updates the shop with new items
 * @param args given by the server
 */
export function updateShop(args: any) {
    console.log("Updating shop with data:", args);
    
    gameStore.update((state: GameState) => {
        // Update joker row if provided
        if (args.jokers && Array.isArray(args.jokers)) {
            state.shop.jokerRow = args.jokers.map((joker: any) => ({
                id: joker.id,
                jokerId: joker.joker_id,
                edition: joker.edition || 0,
                sellAmount: joker.price || 0,
                picked: false
            }));
        }
        
        // Update voucher row if provided
        if (args.vouchers && Array.isArray(args.vouchers)) {
            state.shop.voucherRow = args.vouchers.map((voucher: any) => ({
                id: voucher.id,
                voucherId: voucher.voucher_id,
                sellAmount: voucher.price || 0,
                picked: false
            }));
        }
        
        // Update package row if provided
        if (args.packages && Array.isArray(args.packages)) {
            state.shop.packageRow = args.packages.map((pack: any) => ({
                id: pack.id,
                packageId: pack.package_id,
                sellAmount: pack.price || 0,
                contents: [] // Adding required contents property
            }));
        }
        
        // Update reroll amount if provided
        if (args.reroll_price !== undefined) {
            state.rerollAmount = args.reroll_price;
        }
        
        return state;
    });
}

/**
 * Handles the joker sold event from server
 * @param args given by the server
 */
export function jokerSold(args: any) {
    
    gameStore.update((state: GameState) => {
        // Remove the sold joker from player's collection
        state.jokers = state.jokers.filter(
            joker => joker.jokerId !== args.joker_id
        );
        
        // Update player's money
        state.money = args.remaining_money;
        
        return state;
    });
}

/**
 * Handles the joker purchase response from server
 * @param args given by the server
 */
export function jokerPurchased(args: any) {
    
    gameStore.update((state: GameState) => {
        // Remove the purchased joker from the shop
        state.shop.jokerRow = state.shop.jokerRow.filter(
            joker => joker.id !== args.item_id
        );
        
        // Add the joker to player's collection
        const newJoker: JokerItem = {
            id: args.item_id,
            jokerId: args.joker_id,
            edition: args.edition || 0,
            sellAmount: args.sell_price,
            picked: false
        };
        
        state.jokers.push(newJoker);
        
        // Update player's money
        state.money = args.remaining_money;
        
        return state;
    });
}



/**
 * Handles the voucher purchase response from server
 * @param args given by the server
 */
export function voucherPurchased(args: any) {
    
    gameStore.update((state: GameState) => {
        // Remove the purchased voucher from the shop
        state.shop.voucherRow = state.shop.voucherRow.filter(
            voucher => voucher.id !== args.item_id
        );
        
        // Add the voucher to player's collection
        const newVoucher: VoucherItem = {
            id: getNextKey(),
            voucherId: args.voucher_id,
            sellAmount: 0,
            picked: false
        };
        
        state.vouchers.push(newVoucher);
        
        // Update player's money
        state.money = args.remaining_money;
        
        return state;
    });
}

/**
 * Handles the pack purchase response from server
 * @param args given by the server
 */
export function packPurchased(args: any) {
    
    gameStore.update((state: GameState) => {
        // Remove the purchased pack from the shop
        let packItem:any = state.shop.packageRow.find(
            pack => pack.id === args.item_id
        );

        if(packItem){
            if(args.cards){
                packItem.contents = args.cards;
            }else if(args.jokers){
                packItem.contents = args.jokers;
            }else{
                console.error("Pack contents are empty")
            }
        }else{
            console.error("Pack id not recognized");
        }
        
        // Update player's money
        state.money = args.remaining_money;

        state.shop.packageRow = state.shop.packageRow.filter(
            pack => pack.id !== args.item_id
        );

        packageStore.set(packItem);
        console.log("PackPurchased:",packItem);
        
        return state;
    });
}

// Helper function to handle displaying pack contents modal
function displayPackContentsModal(contents: any, packId: number) {
    // This passes data directly to modal system without using GameState
    // Implementation depends on your modal system
    
    // Using a global event dispatch approach
    const event = new CustomEvent('openPackModal', { 
        detail: { contents, packId } 
    });
    window.dispatchEvent(event);
}