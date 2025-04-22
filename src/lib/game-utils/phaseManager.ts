import { jokerDirectory, jokerEditionsDirectory, overlayDirectory, packageDirectory, suitDirectory, voucherDirectory } from "$lib/cardDirectory";
import { timePerPhase } from "$lib/gameDirectory";
import type { Card, CardItem, GameState, JokerItem, VoucherItem } from "$lib/interfaces";
import { getNextKey } from "$lib/keyGenerator";
import { actionBlockedStore, gameStore } from "$lib/stores";
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
    actionBlockedStore.set(false);

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
            setupShop();
            state.activeVouchers = [];
            break;
        case 3:
            break;
    }

    gameStore.set(state);

}

/**
 * Configures the shop with new items, MOCKUP change later
 */
function setupShop() {
    let state:GameState = get(gameStore);
    
    state.shop = { jokerRow: [], voucherRow: [], packageRow: [] };

    // Add jokers to the shop
    for (let i = 0; i < 3; i++) {
        const newJoker = Math.floor(Math.random() * jokerDirectory.length);
        const newEdition = Math.floor(
            Math.random() * jokerEditionsDirectory.length,
        );
        state.shop.jokerRow.push({
            id: getNextKey(),
            jokerId: newJoker,
            edition: newEdition,
            sellAmount: Math.floor(Math.random() * 30) + 1,
            picked: false,
        });
    }

    // Add vouchers to the shop
    for (let i = 0; i < 2; i++) {
        const newVoucher = Math.floor(
            Math.random() * voucherDirectory.length,
        );
        // Get voucher info from directory
        const voucherInfo = voucherDirectory[newVoucher];

        state.shop.voucherRow.push({
            id: getNextKey(),
            voucherId: newVoucher,
            sellAmount: Math.floor(Math.random() * 30) + 1,
            picked: false,
        });
    }

    // Add packages to the shop
    for (let i = 0; i < 2; i++) {
        const newPack = Math.floor(Math.random() * packageDirectory.length);
        const pack = packageDirectory[newPack];
        let content: CardItem[] | JokerItem[] | VoucherItem[] = [];

        // Configure content based on package type
        if (pack.contentType === 0) {
            // Card content
            content = <CardItem[]>[];
            for (let j = 0; j < pack.contentSize; j++) {
                content.push({
                    id: getNextKey(),
                    card: generateCard(true, true),
                    picked: false,
                });
            }
        } else if (pack.contentType === 1) {
            // Joker content
            content = <JokerItem[]>[];
            for (let j = 0; j < pack.contentSize; j++) {
                const newJoker = Math.floor(
                    Math.random() * jokerDirectory.length,
                );
                const newEdition = Math.floor(
                    Math.random() * jokerEditionsDirectory.length,
                );
                content.push({
                    id: getNextKey(),
                    jokerId: newJoker,
                    edition: newEdition,
                    sellAmount: Math.floor(Math.random() * 30) + 1,
                    picked: false,
                });
            }
        } else {
            // Voucher content
            content = <VoucherItem[]>[];
            for (let j = 0; j < pack.contentSize; j++) {
                const newVoucher = Math.floor(
                    Math.random() * voucherDirectory.length,
                );
                const voucherInfo = voucherDirectory[newVoucher];
                content.push({
                    id: getNextKey(),
                    voucherId: newVoucher,
                    sellAmount: Math.floor(Math.random() * 30) + 1,
                    picked: false,
                });
            }
        }

        state.shop.packageRow.push({
            id: getNextKey(),
            packageId: newPack,
            sellAmount: Math.floor(Math.random() * 30) + 1,
            contents: content,
        });
    }

    // Update shop to reflect in UI
    state.shop.jokerRow = [...state.shop.jokerRow];
    state.shop.voucherRow = [...state.shop.voucherRow];
    state.shop.packageRow = [...state.shop.packageRow];
}

function generateCard(withOverlay: boolean, faceUp: boolean): Card {
    const ranks: string[] = [
        "A",
        "K",
        "Q",
        "J",
        "10",
        "9",
        "8",
        "7",
        "6",
        "5",
        "4",
        "3",
        "2",
    ];
    return {
        rank: ranks[Math.floor(Math.random() * ranks.length)],
        suit: suitDirectory[
            Math.floor(Math.random() * suitDirectory.length)
        ].name,
        faceUp: faceUp,
        overlay: withOverlay
            ? Math.floor(Math.random() * overlayDirectory.length)
            : 0,
    };
}

