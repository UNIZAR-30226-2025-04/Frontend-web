import { HandTypesBase, voucherDirectory } from "$lib/cardDirectory";
import type { Card, GameState } from "$lib/interfaces";
import { gameStore, lobbyStore, socketStore, userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import { timePerPhase } from "$lib/gameDirectory";
import { logFullState, setPhaseTo } from "$lib/game-utils/phaseManager";



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
				jokers: [],
				activeVouchers: [],
				vouchers: [],
				shop: { jokerRow: [], voucherRow: [], packageRow: [] },
				round: args.current_round,
				phase: stringToPhase(args.phase),
				hands: args.player_data.hand_plays_left,
				discards: args.player_data.discards_left,
				money: args.player_data.players_money,
				deckLeft: argsToCards(args.player_data.current_deck.total_cards),
				deckPlayed: argsToCards(args.player_data.current_deck.played_cards),
				timeLeft: timeLeft,
			}));
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
			overlay: 0
		}
		ret.push(newCard);
	}
	return ret;
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
		timeLeft: args.timeout
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
 * Calls server to draw cards from the deck to put in the hand 
 * @param isDiscard true only if ths function is called by the discard button
 */
export function drawCards(cards:Card[],isDiscard:boolean){

	const state:GameState = get(gameStore);
	const handData = {
		cards: cards,
		jokers: {
			juglares: state.jokers,
		},
		gold: state.money,
	};
	
	console.log("<- draw_cards", handData, isDiscard);
	get(socketStore).emit("draw_cards",
		handData
		,isDiscard
	);
}

/**
 * Requests the complete deck information
 */
export function getFullDeck() {
	console.log("<- get_full_deck", get(lobbyStore).code);
	get(socketStore).emit("get_full_deck", get(lobbyStore).code);
} 

/**
 * Function called on 'drawed_cards' event
 * Gtes the cards in args and adds them in th state.handCards
 * @param args given by the server
 */
export function updateHand(args:any){

}

/**
 * Function called on 'full_deck' event
 * Updates the current game state to update the deckLeft and deckPlayed
 * @param args given by the server
 */
export function updateDeck(args:any) {
	gameStore.update((state: GameState) => ({
		...state,
		deckLeft: argsToCards(args.total_cards),
		deckPlayed: argsToCards(args.played_cards),
	}));
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
		timeLeft: args.timeout
	}));

	// Update phase
	setPhaseTo(1);	
}


// -----------------------
// SHOP PHASE FUNCS
// -----------------------


// -----------------------
// CONSUMABLE PHASE FUNCS
// -----------------------