import { HandTypesBase, voucherDirectory, packageDirectory } from "$lib/cardDirectory";
import type { Card, CardItem, GameState, VoucherItem, JokerItem, PackageItem, Package } from "$lib/interfaces";
import { gameStore, lobbyStore, socketStore, userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import { timePerPhase } from "$lib/gameDirectory";
import { logFullState, setPhaseTo } from "$lib/game-utils/phaseManager";
import { getNextKey } from "$lib/keyGenerator";
import { addToHand, playAnimation } from "$lib/game-utils/playPhaseManager";
import type { ModalSettings } from "@skeletonlabs/skeleton";

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
 * Turns the phase from a string given vy the server to the number
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
 * @param deck Array of {Rank:string, Suit:string}
 * @returns 
 */
function argsToCards(deck:any): Card[]{
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
 * Handles the click event on the joker card.
 * If on shop phase it sells the joker
 * @param index of the joker card that was clicked.
 */
function onClickJoker(index: number) {
    if (get(gameStore).actionBlocked) return;

    if (get(gameStore).phase === 2) {
        // Usar la función del socket en lugar de modificar el estado directamente
        sellJoker(get(gameStore).jokers[index].jokerId);
    }
}

/**
 * Buys the joker at 'index' from the shop if the user has the aviable money and space
 * @param index
 */
function onBuyJoker(index: number) {
    if (
        get(gameStore).jokers.length < 5 &&
        get(gameStore).shop.jokerRow[index].sellAmount <= get(gameStore).money
    ) {
        // Usar la función del socket en lugar de modificar el estado directamente
        buyJoker(get(gameStore).shop.jokerRow[index].id, get(gameStore).shop.jokerRow[index].sellAmount);
    }
}

/**
 * Buys the voucher at 'index' from the shop if the user has the aviable money
 * @param index
 */
function onBuyVoucher(index: number) {
    if (get(gameStore).shop.voucherRow[index].sellAmount <= get(gameStore).money) {
        // Usar la función del socket en lugar de modificar el estado directamente
        buyVoucher(get(gameStore).shop.voucherRow[index].id, get(gameStore).shop.voucherRow[index].sellAmount);
    }
}

/**
 * Buys the package at 'index' from the shop if the user has the aviable money
 * If the pack contains joker it doesn't open if the user has already 5/5 jokers
 * @param index
 */
function onBuyPack(index: number) {
    let packItem: PackageItem = get(gameStore).shop.packageRow[index];
    if (get(gameStore).shop.packageRow[index].sellAmount <= get(gameStore).money) {
        if (
            packItem.packageId >= 0 &&
            packItem.packageId < packageDirectory.length
        ) {
            let pack: Package = packageDirectory[packItem.packageId];
            if (pack.contentType !== 1 || get(gameStore).jokers.length < 5) {
                // Usar la función del socket en lugar de modificar el estado directamente
                buyPackage(packItem.id, packItem.sellAmount);
                
                const openPackModal: ModalSettings = {
                    type: "component",
                    meta: {
                        state: get(gameStore),
                        packItem: get(gameStore).shop.packageRow[index],
                        animationSpeed: animationSpeed,
                    },
                    component: "openPackModal",
                };
                
                modalStore.trigger(openPackModal);
            }
        }
    }
}

/**
 * If the user has enough money it rerolls the joker row from the shop
 */
function onReroll() {
    if (
        get(gameStore).money >= get(gameStore).rerollAmount &&
        get(gameStore).shop.jokerRow.length > 0
    ) {
        // Usar la función del socket en lugar de modificar el estado directamente
        rerollShop();
    }
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
 * Emits a purchase_pack event to buy a pack from the shop
 * @param packId ID of the pack to buy
 * @param price Price of the pack
 */
export function buyPackage(packId: number, price: number) {
	console.log("<- purchase_pack:", packId, price);
	get(socketStore).emit("purchase_pack", packId, price);
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

/**
 * Function called on 'shop_phase_setup' event
 * Sets up the shop phase with initial items and player state
 * @param args given by the server
 */
export function shopPhaseSetup(args: any) {
	console.log("Shop phase setup with data:", args);
	
	// Update phase to shop phase (2)
	setPhaseTo(2);
	
	gameStore.update((state: GameState) => ({
		...state,
		timeLeft: timePerPhase[2] - secondsSince(args.timeout_start_date),
		money: args.gold,
		rerollAmount: args.reroll_cost || state.rerollAmount,
		shop: {
			jokerRow: [],
			voucherRow: [],
			packageRow: []
		}
	}));
	
	// Process shop items with debugging
	if (args.jokers && Array.isArray(args.jokers)) {
		console.log("Processing shop jokers:", args.jokers);
		updateShopJokers(args.jokers);
	} else {
		console.log("No jokers in shop or invalid format");
	}
	
	if (args.vouchers && Array.isArray(args.vouchers)) {
		console.log("Processing shop vouchers:", args.vouchers);
		updateShopVouchers(args.vouchers);
	} else {
		console.log("No vouchers in shop or invalid format");
	}
	
	if (args.packages && Array.isArray(args.packages)) {
		console.log("Processing shop packages:", args.packages);
		updateShopPackages(args.packages);
	} else {
		console.log("No packages in shop or invalid format");
	}
}

/**
 * Updates the shop with new items
 * @param args given by the server
 */
export function updateShop(args: any) {
	console.log("Updating shop with data:", args);
	
	if (args.jokers && Array.isArray(args.jokers)) {
		console.log("Updating jokers:", args.jokers);
		updateShopJokers(args.jokers);
	}
	
	if (args.vouchers && Array.isArray(args.vouchers)) {
		console.log("Updating vouchers:", args.vouchers);
		updateShopVouchers(args.vouchers);
	}
	
	if (args.packages && Array.isArray(args.packages)) {
		console.log("Updating packages:", args.packages);
		updateShopPackages(args.packages);
	}
	
	// Update money if provided
	if (args.gold !== undefined) {
		console.log("Updating money:", args.gold);
		gameStore.update(state => ({
			...state,
			money: args.gold
		}));
	}
	
	// Update reroll cost if provided
	if (args.reroll_cost !== undefined) {
		console.log("Updating reroll cost:", args.reroll_cost);
		gameStore.update(state => ({
			...state,
			rerollAmount: args.reroll_cost
		}));
	}
}

/**
 * Updates the joker section of the shop
 * @param jokers Array of jokers from server
 */
function updateShopJokers(jokers: any[]) {
	gameStore.update((state: GameState) => {
		const jokerRow = jokers.map(joker => ({
			id: getNextKey(),
			jokerId: joker.joker_id,
			edition: joker.edition || 0,
			sellAmount: joker.price,
			picked: false
		}));
		
		return {
			...state,
			shop: {
				...state.shop,
				jokerRow: jokerRow
			}
		};
	});
}

/**
 * Updates the voucher section of the shop
 * @param vouchers Array of vouchers from server
 */
function updateShopVouchers(vouchers: any[]) {
	gameStore.update((state: GameState) => {
		const voucherRow = vouchers.map(voucher => ({
			id: getNextKey(),
			voucherId: voucher.voucher_id,
			sellAmount: voucher.price,
			picked: false
		}));
		
		return {
			...state,
			shop: {
				...state.shop,
				voucherRow: voucherRow
			}
		};
	});
}

/**
 * Updates the package section of the shop
 * @param packages Array of packages from server
 */
function updateShopPackages(packages: any[]) {
	gameStore.update((state: GameState) => {
		const packageRow = packages.map(pack => ({
			id: getNextKey(),
			packageId: pack.package_id,
			sellAmount: pack.price,
			contents: []
		}));
		
		return {
			...state,
			shop: {
				...state.shop,
				packageRow: packageRow
			}
		};
	});
}

/**
 * Handles the joker purchase response from server
 * @param args given by the server
 */
export function jokerPurchased(args: any) {
	console.log("Joker purchased with data:", args);
	
	gameStore.update((state: GameState) => {
		// Remove the purchased joker from the shop
		const updatedJokerRow = state.shop.jokerRow.filter(
			joker => joker.id !== args.item_id
		);
		console.log(`Removed joker ID ${args.item_id} from shop, remaining: ${updatedJokerRow.length}`);
		
		// Create a new joker for the player's collection with all required properties
		const newJoker: JokerItem = {
			id: getNextKey(),
			jokerId: args.joker_id,
			sellAmount: args.sell_amount || 0,
			picked: false,
			edition: args.edition || 0  // Add the missing edition property
		};
		console.log("Adding new joker to collection:", newJoker);
		
		return {
			...state,
			money: args.remaining_money,
			shop: {
				...state.shop,
				jokerRow: updatedJokerRow
			},
			jokers: [...state.jokers, newJoker]
		};
	});
}

/**
 * Handles the voucher purchase response from server
 * @param args given by the server
 */
export function voucherPurchased(args: any) {
	console.log("Voucher purchased with data:", args);
	
	gameStore.update((state: GameState) => {
		// Remove the purchased voucher from the shop
		const updatedVoucherRow = state.shop.voucherRow.filter(
			voucher => voucher.id !== args.item_id
		);
		console.log(`Removed voucher ID ${args.item_id} from shop, remaining: ${updatedVoucherRow.length}`);
		
		// Add the voucher to player's collection
		const newVoucher: VoucherItem = {
			id: getNextKey(),
			voucherId: args.voucher_id,
			sellAmount: 0, // Vouchers can't be sold
			picked: false
		};
		console.log("Adding new voucher to collection:", newVoucher);
		
		return {
			...state,
			money: args.remaining_money,
			shop: {
				...state.shop,
				voucherRow: updatedVoucherRow
			},
			vouchers: [...state.vouchers, newVoucher]
		};
	});
}

/**
 * Handles the pack purchase response from server
 * @param args given by the server
 */
export function packPurchased(args: any) {
	console.log("Pack purchased with data:", args);
	
	gameStore.update((state: GameState) => {
		// Remove the purchased pack from the shop
		const updatedPackageRow = state.shop.packageRow.filter(
			pack => pack.id !== args.item_id
		);
		console.log(`Removed pack ID ${args.item_id} from shop, remaining: ${updatedPackageRow.length}`);
		
		// Update money
		return {
			...state,
			money: args.remaining_money,
			shop: {
				...state.shop,
				packageRow: updatedPackageRow
			},
			// Store the pack contents for selection
			packSelection: {
				packId: args.item_id,
				cards: args.cards || [],
				jokers: args.jokers || []
			}
		};
	});
}

/**
 * Handles the joker sold response from server
 * @param args given by the server
 */
export function jokerSold(args: any) {
	console.log("Joker sold with data:", args);
	
	gameStore.update((state: GameState) => {
		// Remove the sold joker from player's collection
		const updatedJokers = state.jokers.filter(joker => joker.jokerId !== args.joker_id);
		console.log(`Removed joker ID ${args.joker_id} from collection, remaining: ${updatedJokers.length}`);
		
		return {
			...state,
			money: args.remaining_money,
			jokers: updatedJokers
		};
	});
}

// -----------------------
// CONSUMABLE PHASE FUNCS
// -----------------------