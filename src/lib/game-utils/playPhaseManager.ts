import { getHierarchyFromRank, getValueFromRank, getValueFromSuit } from "$lib/cardDirectory";
import type { Card, CardItem, GameState, HandType } from "$lib/interfaces";
import { getNextKey } from "$lib/keyGenerator";
import { animationSpeedStore, gameStore } from "$lib/stores";
import { get } from "svelte/store";

/**
 * Adds cards to hand with a nice animation, sorted woth rank
 * @param cards to add
 */
export function addToHand(cards:Card[]){
    cards = cards.sort(
        (cardA, cardB: Card) =>
            getHierarchyFromRank(cardA.rank) -
            getHierarchyFromRank(cardB.rank),
    );
    const drawDelay:number = get(animationSpeedStore)*3;

    for(let i=0; i<cards.length; i++){
        setTimeout(() => {
            gameStore.update((state: GameState) => ({
                ...state,
                handCards: state.handCards.concat([{
                    id:getNextKey(),
                    card:cards[i],
                    picked:false
                }])
            }));
        },drawDelay*i);
    }

}

/**
 * Handles the animations of the play button
 * If state.minScore <= 0 block further actions as the player has already beaten the blind
 * @param handType Type of hand that has been played. Must be in [0,state.handLevels.length)
 * @param blueScore Final token count
 * @param redScore Final multi count
 * @param totalScore Final socre to subtract
 */
export function playAnimation(handType:number, blueScore:number, redScore:number, totalScore: number){
    let state:GameState = get(gameStore);
    const animationSpeed:number = get(animationSpeedStore);

    const initialDelay:number = 1.5; // Betwen pressing the calling the function and the animation playing, doesn't aply to hand type 
    const playCardSpeed:number = 5; // Delay with the plus score on top of the card
    const jokerPlaySpeed:number = 3; // Delay with the Activated below the joker

    let nScoredCards = 0; // Aux variable to count the number of scored cards
    let nActivatedJokers = 0; // Aux variable to count the number of activated jokers

    if(handType >= 0 && handType < state.handLevels.length){
        const handTypeObject:HandType = state.handLevels[handType];
        gameStore.update((state: GameState) => ({
            ...state,
            blueScore : state.blueScore + handTypeObject.baseBlue,
            redScore : state.redScore + handTypeObject.baseRed,
            handType: handType,
        }));
    }else{
        console.error(handType," is not recognized aborting play animation");
        return;
    }

    // Played cards
    for (let i = 0; i < state.playedCards.length; i++) {
        if(state.animVariables.scoreCards.findIndex(card => 
            card.rank === state.playedCards[i].card.rank &&
            card.suit === state.playedCards[i].card.suit
        ) !== -1){
            setTimeout(
                () => {
                    gameStore.update((state: GameState) => ({
                        ...state,
                        blueScore : state.blueScore + getValueFromRank(state.playedCards[i].card.rank),
                        animVariables :{
                            ...state.animVariables,
                            cardIndexToPlayAnim: i,
                            scorePlayAnim: getValueFromRank(state.playedCards[i].card.rank),
                        }
                    }));
                },
                animationSpeed * (playCardSpeed*nScoredCards + initialDelay),
            );
            nScoredCards++;
        }
    }

    // Jokers
    for (let i = 0; i < state.animVariables.activatedJokers.length; i++) {
        if(state.animVariables.activatedJokers[i]){
            setTimeout(
                () => {
                    gameStore.update((state: GameState) => ({
                        ...state,
                        blueScore : blueScore,
                        redScore : redScore,
                        animVariables :{
                            ...state.animVariables,
                            cardIndexToPlayAnim: -1,
                            jokerIndexToPlayAnim: i,
                        }
                    }));
                },
                animationSpeed * (playCardSpeed*nScoredCards + initialDelay + jokerPlaySpeed*nActivatedJokers),
            );
            nActivatedJokers++;
            
        }
    }

    // Score
    setTimeout(() => {
        gameStore.update((state: GameState) => ({
            ...state,
            playedCards: [],
            minScore: state.minScore - totalScore,
            actionBlocked: state.minScore - totalScore < 0,
            animVariables :{
                ...state.animVariables,
                cardIndexToPlayAnim: -1,
                jokerIndexToPlayAnim: -1,
            }
        }));
    }, animationSpeed * (playCardSpeed*nScoredCards + initialDelay + jokerPlaySpeed*nActivatedJokers));

    // Blue and red score reset
    setTimeout(
        () => {
            gameStore.update((state: GameState) => ({
                ...state,
                blueScore : 0,
                redScore : 0,
            }));
        },animationSpeed * (playCardSpeed*(nScoredCards+1) + initialDelay + jokerPlaySpeed*nActivatedJokers),
    );
        
}