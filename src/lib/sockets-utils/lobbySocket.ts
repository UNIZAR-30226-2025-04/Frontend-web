import { wsBase } from "$lib/paths";
import { lobbyStore, socketStore, userDataStore } from "$lib/stores";
import { io, Socket } from "socket.io-client";
import { get } from "svelte/store";
import { addMessage } from "./chatAddMessage";
import type { Lobby, Player } from "$lib/interfaces";
import { goto } from "$app/navigation";
import { base } from "$app/paths";

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

	// Connection/Default events
	socket.on("connect", () => {
		console.log("-> connect:", socket.id);
		socketStore.set(socket);
	});

	socket.on("disconnect", () => {
		console.log("-> disconnect");
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

	// Lobby events

	// New message in chat
	socket.on("new_lobby_message", (args: any) => {
		console.log("-> new_lobby_message", args);
		addMessage(args.username, args.user_icon, args.message);
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

	// Game events
	socket.on("game_starting", (args: any) => {
		console.log("-> game_starting", args);
		// Redirect to the game screen when the server confirms that the game has started
		goto(base + "/game");
	});

	socket.on("played_hand", (args: any) => {
		console.log("-> played_hand", args);
		// TODO: Once we have a response we will be able to operate
		// Update the score and the game state
		// For example: updatePoints(args.points, args.gold);
	});

	socket.on("drawed_cards", (args: any) => {
		console.log("-> drawed_cards", args);
		// TODO: Once we have a response we will be able to operate
		// Add the new cards to the player's hand
		// For example: addCardsToHand(JSON.parse(args.new_cards));
	});

	socket.on("full_deck", (args: any) => {
		console.log("-> full_deck", args);
		// Update the deck information in the store
		// For example: deckStore.set({ totalCards: args.total_cards, playedCards: args.played_cards });
	});
}

/**
 * Exits the current lobby an empties lobby store
 */
export function exitLobby() {
	// Sending an event to let know the that the user just left the lobby
	console.log("<- exit_lobby:", get(lobbyStore).code);
	get(socketStore).emit("exit_lobby", get(lobbyStore).code);
	goto(base + "/home");
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