import { lobbyStore, socketStore, userDataStore } from "$lib/stores";
import type { Hand } from "$lib/interfaces";
import { get } from "svelte/store";

/**
 * Starts the game (only available for the host)
 */
export function startGame(): void {
  console.log("<- start_game:", get(lobbyStore).code);
  get(socketStore).emit("start_game", get(lobbyStore).code);
}

/**
 * Sends a hand to be played and gets its score
 * @param hand Object that represents the hand to play
 */
export function playHand(hand: Hand): void {
  console.log("<- play_hand:", hand);
  get(socketStore).emit("play_hand", hand);
}

/**
 * Requests additional cards to complete the hand
 * @param currentHand The current hand of the player
 */
export function drawCards(currentHand: Hand): void {
  console.log("<- draw_cards:", currentHand);
  get(socketStore).emit("draw_cards", currentHand);
}

/**
 * Requests the complete deck information
 */
export function getFullDeck(): void {
  console.log("<- get_full_deck");
  get(socketStore).emit("get_full_deck");
} 