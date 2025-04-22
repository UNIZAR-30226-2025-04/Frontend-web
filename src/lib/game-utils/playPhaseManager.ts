import { getValueFromRank } from "$lib/cardDirectory";
import type { GameState, HandType } from "$lib/interfaces";
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

/**
 * Handles the animations of the play button
 * If state.minScore <= 0 block further actions as the player has already beaten the blind
 * @param handType Type of hand that has been played
 * @param blueScore Final token count
 * @param redScore Final multi count
 * @param totalScore Final socre to subtract
 */
export function playAnimation(handType:string, blueScore:number, redScore:number, totalScore: number){
    let state:GameState = get(gameStore);
    const animationSpeed:number = get(animationSpeedStore);

    const initialDelay:number = 1.5; // Betwen pressing the calling the function and the animation playing, doesn't aply to hand type 
    const playCardSpeed:number = 5; // Delay with the plus score on top of the card
    const jokerPlaySpeed:number = 3; // Delay with the Activated below the joker

    let nActivatedJokers = 0; // Auz variable to count the number of activated jokers

    const newHandType = state.handLevels.findIndex((ht:HandType) => ht.name === handType);

    if(newHandType>=0){
        gameStore.update((state: GameState) => ({
            ...state,
            blueScore : state.blueScore + state.handLevels[newHandType].baseBlue,
            redScore : state.redScore + state.handLevels[newHandType].baseRed,
            handType: newHandType,
        }));
    }else{
        console.error(handType," is not recognized aborting play animation");
        return;
    }

    for (let i = 0; i < state.playedCards.length; i++) {
        setTimeout(
            () => {
                gameStore.update((state: GameState) => ({
                    ...state,
                    blueScore : state.blueScore + getValueFromRank(state.playedCards[i].card.rank),
                    animVariables :{
                        cardIndexToPlayAnim: i,
                        jokerIndexToPlayAnim: state.animVariables.jokerIndexToPlayAnim,
                        scorePlayAnim: getValueFromRank(state.playedCards[i].card.rank),
                        activatedJokers: state.animVariables.activatedJokers,
                    }
                }));
            },
            animationSpeed * (playCardSpeed*i + initialDelay),
        );
    }


    for (let i = 0; i < state.animVariables.activatedJokers.length; i++) {
        if(state.animVariables.activatedJokers[i]){
            setTimeout(
                () => {
                    gameStore.update((state: GameState) => ({
                        ...state,
                        blueScore : blueScore,
                        redScore : redScore,
                        animVariables :{
                            cardIndexToPlayAnim: -1,
                            jokerIndexToPlayAnim: i,
                            scorePlayAnim: state.animVariables.scorePlayAnim,
                            activatedJokers: state.animVariables.activatedJokers,
                        }
                    }));
                },
                animationSpeed * (playCardSpeed*state.playedCards.length + initialDelay + jokerPlaySpeed*nActivatedJokers),
            );
            nActivatedJokers++;
            
        }
    }

    setTimeout(() => {
        gameStore.update((state: GameState) => ({
            ...state,
            playedCards: [],
            minScore: state.minScore - totalScore,
            actionBlocked: state.minScore - totalScore < 0,
            animVariables :{
                cardIndexToPlayAnim: -1,
                jokerIndexToPlayAnim: -1,
                scorePlayAnim: state.animVariables.scorePlayAnim,
                activatedJokers: state.animVariables.activatedJokers,
            }
        }));
    }, animationSpeed * (playCardSpeed*state.playedCards.length + initialDelay + jokerPlaySpeed*nActivatedJokers));

    setTimeout(
        () => {
            gameStore.update((state: GameState) => ({
                ...state,
                blueScore : 0,
                redScore : 0,
            }));
        },animationSpeed * (playCardSpeed*(state.playedCards.length+1) + initialDelay + jokerPlaySpeed*nActivatedJokers),
    );
        
}