import type { GameState } from "$lib/interfaces";
import { getNextKey } from "$lib/keyGenerator";
import { animationSpeedStore, gameStore } from "$lib/stores";
import { get } from "svelte/store";

/**
 * Draws 8 cards from deckLeft and adds them to the state.handCards
 */
export function draw8FromDeck(){
    let state:GameState = get(gameStore);
    for(let i = 0; i<8; i++){
        setTimeout(
            () => {
                const randIndex = Math.floor(Math.random() * state.deckLeft.length);
                state.handCards.push({
                    id: getNextKey(),
                    card: state.deckLeft[randIndex],
                    picked: false,
                });
                state.deckLeft.splice(randIndex,1);
                state.handCards = [...state.handCards];
            },
            get(animationSpeedStore) * (i+2),
        );
    }
}