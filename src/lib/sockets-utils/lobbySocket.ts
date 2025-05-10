import { goto } from "$app/navigation";
import { base } from "$app/paths";
import type { Lobby, Player } from "$lib/interfaces";
import { wsBase } from "$lib/paths";
import { lobbyStore, socketStore, userDataStore } from "$lib/stores";
import { io, Socket } from "socket.io-client";
import { get } from "svelte/store";
import { addMessage } from "./chatAddMessage";
import { 
	blindPhaseSetup, 
	discardedCards, 
	fullStateUpdate, 
	gameEnd, 
	jokerPurchased,
	jokerSold,
	jokersRerolled,
	packPurchased, 
	packPurchasedComplete, 
	playedHand, 
	playerEliminated, 
	playPhaseSetup, 
	recievedModifiers, 
	shopPhaseSetup,
	updateHand, 
	updateMinimunScore,
	updateVouchers,
	voucherPhaseSetup,
	voucherPurchased
} from "./gameSocket";

/**
   * Adds user to the list in lobbySocket
   * @param username
   * @param icon
   * @param host
   */
function addPlayer(username: string, icon: number, host: boolean) {
	let oldPlayerList: Player[] = get(lobbyStore).players;

	// If it's not on the list
	if (oldPlayerList.find((pla: Player) => pla.username === username) === undefined) {
		let newUser: Player = {
			key: oldPlayerList.length,
			username: username,
			icon: icon,
			host: host,
		};

		let updatedPlayers = [...oldPlayerList, newUser];

		lobbyStore.update((lob: Lobby) => ({
			code: lob.code,
			host: lob.host || (host && username === get(userDataStore).username),
			players: updatedPlayers
		}));
	}
}

/**
   * Removes user to the list in lobbyStore
   * @param username
   */
function removePlayer(username: string) {
	let oldPlayerList: Player[] = get(lobbyStore).players;
	
	let updatedPlayers = oldPlayerList.filter((pla:Player) => pla.username !== username);

	lobbyStore.update((lob: Lobby) => ({
		...lob,
		players: updatedPlayers
	}));
}

/**
 * Clears the list of players in lobbyStore
 */
function clearPlayerList(){
	lobbyStore.update((lob: Lobby) => ({
		...lob,
		players: [],
	}));
}

export function initializeSocket() {
	let socket: Socket;

	console.log("Trying to connect to ws");
	socket = io(wsBase, {
		auth: {
			username: get(userDataStore).username,
			authorization: "Bearer " + get(userDataStore).token,
		},
		transports: ["websocket"],
	});

	// =========================
	// Connection/Default events
	// =========================

	socket.on("connect", () => {
		console.log("-> connect:", socket.id);
		socketStore.set(socket);
	});

	socket.on("disconnect", (args:any) => {
		console.log("-> disconnect:", args);
	});

	socket.on("connection_success", (args:any) => {
		console.log("-> connection_success",args);
		
		// Starting emits when a user joins the lobby

		// Sending an event to let know the lobby that the user just joined
		console.log("<- join_lobby:", get(lobbyStore).code);
		socket.emit("join_lobby", get(lobbyStore).code);

		// Getting all info on the lobby
		console.log("<- get_lobby_info:", get(lobbyStore).code);
		socket.emit("get_lobby_info", get(lobbyStore).code);
		
	});

	socket.on("connection_error", (args:any) => {
		console.log("-> connection_error",args);
	});

	socket.on("error", function (error: any) {
		console.error("-> Error:", error);
	});

	socket.onAny((event: any, ...args: any) => {
		console.log(`-> Event recieved: ${event}`, args);
	});

	// ===========
	// Lobby events
	// ===========

	// New message in chat
	socket.on("new_lobby_message", (args: any) => {
		console.log("-> new_lobby_message", args);
		addMessage(args.username, args.user_icon, args.message);
	});

	// Users joined the lobby correctly, it request further info on game state
	socket.on("joined_lobby", (args: any) => {
		console.log("-> joined_lobby", args);

		console.log("<- request_game_phase_player_info:", get(lobbyStore).code);
		get(socketStore).emit("request_game_phase_player_info", get(lobbyStore).code);
	});

	// New user joins the lobby
	socket.on("new_user_in_lobby", (args: any) => {
		console.log("-> new_user_in_lobby", args);
		addPlayer(args.username, args.icon, false);
	});

	// When info about the lobby is requested we update the list of players
	socket.on("lobby_info", (args: any) => {
		console.log("-> lobby_info", args);
		clearPlayerList();
		args.players.forEach((player: { username: string; user_icon: number; }) => {
			addPlayer(player.username, player.user_icon, args.creator.username === player.username);
		});
	});

	// When a player voluntarily leaves
	socket.on("player_left", (args: any) => {
		console.log("-> player_left", args);
		removePlayer(args.username);
	});

	// When the host has kicked a player
	socket.on("player_kicked", (args: any) => {
		console.log("-> player_kicked", args);
		removePlayer(args.kicked_user);
	});

	// When user succesfully kicks a player from the lobby
	socket.on("kick_success", (args: any) => {
		console.log("-> kick_success", args);
		removePlayer(args.kicked_user);
	});

	// When the host kick the user from the lobby
	socket.on("you_were_kicked", (args: any) => {
		console.log("-> you_were_kicked", args);
		goto(base + "/home");
	});

	// ===========
	// Game events
	// ===========

	socket.on("starting_next_blind", (args: any) => {
		console.log("-> starting_next_blind", args);
		goto(base + "/game");
		blindPhaseSetup(args);
	});
	
	socket.on("starting_round", (args: any) => {
		console.log("-> starting_round", args);
		playPhaseSetup(args);
	});

	socket.on("game_phase_player_info", (args: any) => {
		console.log("-> game_phase_player_info", args);
		fullStateUpdate(args);
	});

	socket.on("blind_updated", (args: any) => {
		console.log("-> blind_updated", args);
		updateMinimunScore(args);
	});

	socket.on("played_hand", (args: any) => {
		console.log("-> played_hand", args);
		playedHand(args);
	});

	socket.on("discarded_cards", (args: any) => {
		console.log("-> discarded_cards", args);
		discardedCards(args);
	});

	socket.on("got_cards", (args: any) => {
		console.log("-> got_cards", args);
		updateHand(args);
	});

	socket.on("full_deck", (args: any) => {
		console.log("-> full_deck", args);
	});

	socket.on("starting_shop", (args: any) => {
		console.log("-> starting_shop", args);
		shopPhaseSetup(args);
	});

	socket.on("joker_purchased", (args: any) => {
		console.log("-> joker_purchased", args);
		jokerPurchased(args);
	});

	socket.on("voucher_purchased", (args: any) => {
		console.log("-> voucher_purchased", args);
		voucherPurchased(args);
	});

	socket.on("pack_purchased", (args: any) => {
		console.log("-> pack_purchased", args);
		packPurchased(args);
	});

	socket.on("pack_selection_complete", (args: any) => {
		console.log("-> pack_selection_complete", args);
		packPurchasedComplete(args);
	});

	socket.on("joker_sold", (args: any) => {
		console.log("-> joker_sold", args);
		jokerSold(args);
	});

	socket.on("rerolled_jokers", (args: any) => {
		console.log("-> rerolled_jokers", args);
		jokersRerolled(args);
	});

	socket.on("starting_vouchers", (args: any) => {
		console.log("-> starting_vouchers", args);
		voucherPhaseSetup(args);
	});

	socket.on("modifiers_activated", (args: any) => {
		console.log("-> modifiers_activated", args);
		updateVouchers(args);
	});

	socket.on("modifiers_received", (args: any) => {
		console.log("-> modifiers_received", args);
		recievedModifiers(args);
	});

	socket.on("game_end", (args: any) => {
		console.log("-> game_end", args);
		gameEnd(args);
	});

	socket.on("players_eliminated", (args: any) => {
		console.log("-> players_eliminated", args);
		playerEliminated(args);
	});
}

/**
 * Exits the current lobby an empties lobby store
 */
export function exitLobby() {
	// Sending an event to let know the that the user just left the lobby
	console.log("<- exit_lobby:", get(lobbyStore).code);
	get(socketStore).emit("exit_lobby", get(lobbyStore).code);
	setTimeout(() => goto(base + "/home"),500);
}

/**
 * Kicks the player with username from the lobby
 * @param username 
 */
export function kickUser(username:string){
	console.log("<- kick_from_lobby:", get(lobbyStore).code, username);
	get(socketStore).emit("kick_from_lobby", get(lobbyStore).code, username);
}

/**
 * Sends a message to the lobby chat
 * @param message 
 */
export function sendMessage(message:string): void {
	console.log("<- broadcast_to_lobby:", get(lobbyStore).code, message);
	get(socketStore).emit("broadcast_to_lobby", get(lobbyStore).code, message);
}