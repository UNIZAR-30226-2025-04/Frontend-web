import { HandTypesBase, voucherDirectory, packageDirectory } from "$lib/cardDirectory";
import type { Card, CardItem, GameState, VoucherItem, JokerItem, PackageItem, Package, Lobby } from "$lib/interfaces";
import { gameEndStore, gameStore, lobbyStore, packageStore, socketStore, userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import { timePerPhase } from "$lib/gameDirectory";
import { logFullState, setPhaseTo } from "$lib/game-utils/phaseManager";
import { getNextKey } from "$lib/keyGenerator";
import { addToHand, playAnimation } from "$lib/game-utils/playPhaseManager";
import { goto } from "$app/navigation";
import { base } from "$app/paths";

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
		if(newPhase >= 0 && newPhase < timePerPhase.length){
			goto(base + "/game");

			const timeLeft = timePerPhase[newPhase] - secondsSince(args.timeout);

			gameStore.update((state: GameState) => ({
				...state,
				timeLeft: timeLeft,
				phase: newPhase,
				minScore: args.current_base_blind,
				pot: args.current_pot,
				maxRounds: args.max_rounds,
				round: args.current_round,
				discards: args.player_data.discards_left,
				hands: args.player_data.hand_plays_left,
				deckSize: args.player_data.unplayed_cards + args.player_data.played_cards,
				deckLeft: args.player_data.unplayed_cards,
				money: args.player_data.players_money,
				rerollAmount: args.reroll_price,
				handCards: [],
				jokers: [],
				vouchers: [],
				activeVouchers: [],
			}));

			// Update players in lobby
			lobbyStore.update((lobby:Lobby) => {
				lobby.players = [];
				args.players.forEach((user:any) => {
					lobby.players.push({
						key:getNextKey(),
						username:user.username,
						icon:user.icon,
						host:false
					});
				});
				return lobby;
			});

			// Update hand
			if(args.player_data.current_hand)
				addToHand(argsToCards(args.player_data.current_hand));

			// Update jokers, vouchers and activeVouchers
			gameStore.update((state: GameState) => {
				// Jokers
				if(args.player_data.current_jokers){
					args.player_data.current_jokers.forEach((argsJoker:any) => {
						state.jokers.push({
							id:getNextKey(),
							jokerId:argsJoker.id,
							edition:0,
							sellAmount:argsJoker.sell_price,
							picked:false
						})
					});
				}

				// Vouchers
				if(args.player_data.vouchers && args.player_data.vouchers.Modificadores){
					args.player_data.vouchers.Modificadores.forEach((argsVoucher:any) => {
						state.vouchers.push({
							id:getNextKey(),
							voucherId:argsVoucher.value,
							sellAmount:0,
							picked:false
						})
					});
				}
				
				// Active vouchers

				if(args.player_data.received_vouchers && args.player_data.received_vouchers.modifiers){
					args.player_data.received_vouchers.modifiers.forEach((argsVoucher:any) => {
						state.activeVouchers.push({
							id:getNextKey(),
							voucherId:argsVoucher.modifier.value,
							sellAmount:0,
							picked:false
						})
					});
				}

				if(args.player_data.active_vouchers && args.player_data.active_vouchers.Modificadores){
					args.player_data.active_vouchers.Modificadores.forEach((argsVoucher:any) => {
						state.activeVouchers.push({
							id:getNextKey(),
							voucherId:argsVoucher.value,
							sellAmount:0,
							picked:false
						})
					});
				}

				return state;
			});

			// Play phase and empty hand => get cards
			if(newPhase === 1 && get(gameStore).handCards.length === 0){
				getFullHand()
				gameStore.update((state: GameState) => ({
					...state,
					minScore: args.current_base_blind - args.player_data.total_points,
				}));
			}

			// Shop phase => Get shop info
			if(newPhase == 2){
				shopPhaseItemsSetup(args.shop_items);
			}

			// Voucher phase => 
			if(newPhase == 3){
				if(get(gameStore).vouchers.length === 0){
					setTimeout(() => continueVouchers(),500);
				}
			}
		}else{
			goto(base + "/lobby");
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

/**
 * Function called on 'game_end' event, modifies the gameEndStore
 * @param args given by the server
 */
export function gameEnd(args:any){
	const me:string = get(userDataStore).username;
	
	// Check if user won
	args.winners.forEach((winner:any) => {
		if(winner.winner_username === me){
			gameEndStore.update(() => ({
				winner:me,
				points:winner.points,
				userWon:true
			}));
			return;
		}
	});

	// If it hasn't won then it has lost
	if(get(gameEndStore).winner === ""){
		const points:number = get(gameStore).minScore;
		gameEndStore.update(() => ({
			winner:me,
			points:points,
			userWon:false
		}));
	}
}

/**
 * Function called on 'players_eliminated' event, modifies the gameEndStore
 * @param args given by the server
 */
export function playerEliminated(args:any){
	const me:string = get(userDataStore).username;
	args.eliminated_players.forEach((user:any) => {
		if(me === user){
			const points:number = get(gameStore).minScore;
			gameEndStore.update(() => ({
				winner:me,
				points:points,
				userWon:false
			}));
			return;
		}		
	})
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
		money: args.players_money,
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

		// Process shop items
        shopPhaseItemsSetup(args.shop);
        
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

		// Update reroll ammount if provided
		if(args.next_reroll_price !== undefined){
			state.rerollAmount = args.next_reroll_price;
		}

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
 * Handles the shop phase setup for the shop items
 * @param args given by the server
 */
export function shopPhaseItemsSetup(args: any) {
    
    gameStore.update((state: GameState) => {
        // Initialize empty shop arrays
        state.shop.jokerRow = [];
        state.shop.voucherRow = [];
        state.shop.packageRow = [];
        
        // Process rerollable items (jokers)
        if (args.rerolled_items && Array.isArray(args.rerolled_items) &&
		args.rerolled_items[0] && Array.isArray(args.rerolled_items[0].jokers)) {
            args.rerolled_items[0].jokers.forEach((item: any) => {
                if (item.type === 'joker' && item.id > 0) {
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
        if (args.fixed_modifiers && Array.isArray(args.fixed_modifiers)) {
            args.fixed_modifiers.forEach((item: any) => {
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
        
        // Process fixed packs
        if (args.fixed_packs && Array.isArray(args.fixed_packs)) {
            args.fixed_packs.forEach((pack: any) => {
                state.shop.packageRow.push({
                    id: pack.id,
                    packageId: pack.pack_type,
                    sellAmount: pack.price || 0,
                    contents: [],
					chooseAmount: pack.max_selectable
                });
            });
        } 

        return state;
    });
    
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
 * Emits a reroll_shop event to refresh the shop items
 */
export function rerollShop() {
	console.log("<- reroll_shop");
	get(socketStore).emit("reroll_shop");
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
 * Emits a pack_selection event to select items from an opened pack
 * @param packId ID of the pack
 * @param selectedCard Selected cards
 * @param selectedJokers ID of the selected jokers
 * @param selectedVouchers ID of the selected vouchers
 */
export function selectPackItems(packId: number, selectionsMap: any) {
	console.log("<- choose_pack_items:", packId, selectionsMap);
	get(socketStore).emit("choose_pack_items", packId, selectionsMap);
}

/**
 * When the user click 'Next round' button on shop phase 
 */
export function continueShop(){
    console.log("<- continue_to_vouchers");
    get(socketStore).emit("continue_to_vouchers");
    gameStore.update((state: GameState) => ({
        ...state,
        actionBlocked: true
    }));
}

/**
 * Handles the joker sold event from server
 * @param args given by the server
 */
export function jokerSold(args: any) {
    
    gameStore.update((state: GameState) => {
        // Remove the sold joker from player's collection
        const index:number = state.jokers.findIndex(
            (joker:JokerItem) => joker.jokerId === args.joker_id
        );
		if(index !== -1)
			state.jokers.splice(index,1);
		
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
        const index:number = state.shop.jokerRow.findIndex(
            (joker:JokerItem) => joker.jokerId === args.joker_id
        );
		if(index !== -1)
			state.shop.jokerRow.splice(index,1);
        
        // Add the joker to player's collection
        const newJoker: JokerItem = {
            id: getNextKey(),
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
		const index:number = state.shop.voucherRow.findIndex(
            (voucher:VoucherItem) => voucher.id === args.item_id
        );
		if(index !== -1)
			state.shop.voucherRow.splice(index,1);
        
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

        if(packItem && packItem.packageId >= 0 && packItem.packageId < packageDirectory.length){
			const type:number = packageDirectory[packItem.packageId].contentType;
            if(type === 0){
                packItem.contents = toCardItems(args.cards);
            }else if(type === 1){
                packItem.contents = toJokerItems(args.jokers);
            }else if(type === 2){
                packItem.contents = toVoucherItems(args.vouchers);
            }else{
				console.error("Pack type not recognized");
			}
        }else{
            console.error("Pack id not recognized");
        }
        
        // Update player's money
        state.money = args.remaining_money;

		// Remove pack from shop
		const index:number = state.shop.packageRow.findIndex(
            (pack:PackageItem) => pack.id === args.item_id
        );
		if(index !== -1)
			state.shop.packageRow.splice(index,1);

        packageStore.set(packItem);
        console.log("PackPurchased:",packItem);
        
        return state;
    });
}

/**
 * Handles the pack purchase response from server after choosing the contents
 * @param args given by the server
 */
export function packPurchasedComplete(args: any) {

	gameStore.update((state: GameState) => {
        // Update player's money
        state.money = args.remaining_money;

		const packItem:PackageItem = get(packageStore);

		// Include any jokers
		args.selections.selectedJokers.forEach((jokerId: any) => {
			for (const item of packItem.contents) {
				if(item.jokerId === jokerId){
					state.jokers.push({
						id:getNextKey(),
						jokerId:jokerId,
						edition:0,
						sellAmount: item.sellAmount,
						picked:false
					});
					break; // Once we find the matching joker we break
				}
			};
		});

		// Include any vouchers
		args.selections.selectedVouchers.forEach((voucherId: any) => {
			state.vouchers.push({
				id:getNextKey(),
				voucherId: voucherId,
				sellAmount: 0,
				picked:false,
			});
		});

		// Reset contents on completion
		packageStore.update((pack: PackageItem) => ({
			...pack,
			contents: []
		}));
        
        return state;
    });
}

/**
 * Converts args from package purchased to CardItem[]
 * @param items to convert
 * @returns 
 */
function toCardItems(items: unknown[]): CardItem[] {
	let ret:CardItem[] = [];

	items.forEach((item:any) => {
		ret.push({
			id:getNextKey(),
			card:{
				rank:item.Rank,
				suit:item.Suit,
				faceUp:true,
				overlay:item.Enhancement
			},
			picked:false
		});
	});
	
	return ret;
}

/**
 * Converts args from package purchased to JokerItem[]
 * @param items to convert
 * @returns 
 */
function toJokerItems(items: unknown[]): JokerItem[] {
	let ret:JokerItem[] = [];

	items.forEach((item:any) => {
		ret.push({
			id:getNextKey(),
			jokerId:item.Juglares[0].id,
			edition:0,
			sellAmount:item.Juglares[0].sell_price,
			picked:false
		});
	});

	return ret;
}

/**
 * Converts args from package purchased to VoucherItem[]
 * @param items to convert
 * @returns 
 */
function toVoucherItems(items: unknown[]): VoucherItem[] {
	let ret:VoucherItem[] = [];

	items.forEach((item:any) => {
		ret.push({
			id:getNextKey(),
			voucherId:item.value,
			sellAmount:0,
			picked:false
		});
	});

	return ret;
}

/**
 * Handles the reroll event
 * @param args given by the server
 */
export function jokersRerolled(args:any){
	gameStore.update((state: GameState) => {
        // Initialize empty shop arrays
        state.shop.jokerRow = [];
		state.rerollAmount = args.next_reroll_cost;
        
        // Process rerollable items (jokers)
		args.new_jokers.jokers.forEach((item: any) => {
			if (item.type === 'joker') {
				if(item.id > 0){
					state.shop.jokerRow.push({
						id: item.id,
						jokerId: item.joker_id,
						edition: item.edition || 0,
						sellAmount: item.price || 0,
						picked: false
					});
				}
			}
		});
        return state;
    });
}


// -----------------------
// VOUCHER PHASE FUNCS
// -----------------------

/**
 * Activates a voucher by sending an 'activate_modifiers' event
 * @param voucherId to activate
 */
export function activateVoucher(voucherId:number){
	const args = [[voucherId]];
	console.log("<- activate_modifiers",args);
	get(socketStore).emit("activate_modifiers",args);
}

/**
 * Sends a voucher by sending an 'send_modifiers' event to a list of usernames
 * @param voucherId to send
 * @param users to send the voucher to
 */
export function sendVoucher(voucherId:number, users:string[]){
	const args = [[voucherId],users];
	console.log("<- send_modifiers",args);
	get(socketStore).emit("send_modifiers",args);
}

/**
 * When the user click 'Next round' button on vouchers phase 
 */
export function continueVouchers(){
	console.log("<- continue_to_next_blind");
	get(socketStore).emit("continue_to_next_blind");
	gameStore.update((state: GameState) => ({
        ...state,
        actionBlocked: true
    }));
}

/**
 * Hanldes the setup of the voucher phase 
 * when recieving a 'starting_vouchers' event 
 * @param args given by the server
 */
export function voucherPhaseSetup(args:any){
	gameStore.update((state: GameState) => {

        // Set timeLeft for the shop phase
        if (args.timeout && args.timeout_start_date) {
            state.timeLeft = args.timeout - secondsSince(args.timeout_start_date);
        } else if (args.shop && args.shop.timeout && args.shop.timeout_start_date) {
            state.timeLeft = args.shop.timeout - secondsSince(args.shop.timeout_start_date);
        }
        
		// Update round number
		state.round = args.current_round;

		// Update players in lobby
		lobbyStore.update((lobby:Lobby) => {
			lobby.players = [];
			args.users_in_lobby.forEach((user:any) => {
				lobby.players.push({
					key:getNextKey(),
					username:user.username,
					icon:user.icon,
					host:false
				});
			});
			return lobby;
		});

		// Update vouchers
		state.vouchers = [];
		if(args.vouchers && args.vouchers.Modificadores){
			args.vouchers.Modificadores.forEach((voucher:any) => {
				state.vouchers.push({
					id:getNextKey(),
					voucherId:voucher.value,
					sellAmount:0,
					picked:false
				});
			});
		}
        
        return state;
    });
    
    // Ensure phase is fully updated in UI
    setPhaseTo(3);
}

/**
 * Triggers on 'modifiers_activated' event, updates state.vouchers
 * @param args given by the server
 */
export function updateVouchers(args:any){
	if(args.modifiers && args.modifiers.Modificadores){
		gameStore.update((state: GameState) => {
			// Update vouchers
			state.vouchers = [];
			args.modifiers.Modificadores.forEach((voucher:any) => {
				state.vouchers.push({
					id:getNextKey(),
					voucherId:voucher.value,
					sellAmount:0,
					picked:false
				});
			});
			
			return state;
		});
	}

	// If no vouchers remaing auto click Next round
	if(get(gameStore).vouchers.length === 0){
		continueVouchers();
	}
}

/**
 * Triggers on 'modifiers_received' event, updates state.activeVouchers
 * @param args given by the server
 */
export function recievedModifiers(args:any){
	if(args.modifiers && args.modifiers.modifiers){
		gameStore.update((state: GameState) => {
			// Update vouchers with recieved vouchers
			state.activeVouchers = state.activeVouchers.filter((voucher:VoucherItem) => {
				!voucherDirectory[voucher.voucherId].targetType
			});
			args.modifiers.modifiers.forEach((voucher:any) => {
				state.activeVouchers.push({
					id:getNextKey(),
					voucherId:voucher.modifier.value,
					sellAmount:0,
					picked:false
				});
			});
			
			return state;
		});
	}

	// If no vouchers remaing auto click Next round
	if(get(gameStore).vouchers.length === 0){
		continueVouchers();
	}
}



