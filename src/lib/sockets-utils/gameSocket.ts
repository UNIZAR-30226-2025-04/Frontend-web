import { HandTypesBase, voucherDirectory } from "$lib/cardDirectory";
import type { Card, CardItem, GameState } from "$lib/interfaces";
import { gameStore, lobbyStore, socketStore, userDataStore } from "$lib/stores";
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


// -----------------------
// CONSUMABLE PHASE FUNCS
// -----------------------