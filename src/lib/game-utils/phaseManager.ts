import { jokerDirectory, jokerEditionsDirectory, overlayDirectory, packageDirectory, suitDirectory, voucherDirectory } from "$lib/cardDirectory";
import { timePerPhase } from "$lib/gameDirectory";
import type { Card, CardItem, GameState, JokerItem, VoucherItem } from "$lib/interfaces";
import { getNextKey } from "$lib/keyGenerator";
import { gameStore } from "$lib/stores";
import { getModalStore } from "@skeletonlabs/skeleton";
import { get } from "svelte/store";

/**
 * Logs on console the value of gameStore
 */
export function logFullState(){
    console.log("FULL STATE:",get(gameStore));
}

/**
 * Sets the state.phase to 'phase', necesary for jumping betwen phases that are not adjacent
 * @param phase
 */
export function setPhaseTo(phase:number){
    
    let state:GameState = get(gameStore);
    
    // Sets the phase
    state.phase = phase;

    // Closes all active modals
    //modalStore.close();

    // Reset all blocks
    state.actionBlocked = false;

    // Sets the timer
    state.timeLeft = timePerPhase[phase];

    // Phase dependent variable values
    switch(phase){
        case 0:
            
            break;
        case 1:
            //getFullDeck();
            state.handCards = [];
            state.playedCards = []; 
            //drawCards(false);
            break;
        case 2:
            state.activeVouchers = [];
            break;
        case 3:
            break;
    }

    gameStore.set(state);

}

