import { writable } from 'svelte/store';
import { type UserData, type Lobby, type ChatBuble, type GameState, type GameEndInfo, type PackageItem } from '$lib/interfaces';
import { persisted } from 'svelte-persisted-store'
import { Socket } from 'socket.io-client';
import { HandTypesBase } from './cardDirectory';

const userDataInitial: UserData = {
    username: "Name",
    email: "",
    password: "",
    icon: 1,
    token: "",
    remember: false
}

export const userDataStore = persisted('userDataNogler',userDataInitial)


const lobbyInitial: Lobby = {
    code: "code",
    host: false,
    players:[]
}

export const lobbyStore = writable<Lobby>(lobbyInitial)

export const chatInitial: ChatBuble[] = []

export const chatStore = writable<ChatBuble[]>(chatInitial)
export const chatFeedElem = writable<HTMLElement>()

export const socketStore = writable<Socket>()

export const stateInit: GameState = {
    playedCards: [],
    handCards: [],
    jokers: [],
    activeVouchers: [],
    vouchers: [],
    handLevels: structuredClone(HandTypesBase),
    shop: { jokerRow: [], voucherRow: [], packageRow: [] },
    round: 1,
    maxRounds: 10,
    phase: 0,
    minScore: 0,
    proposedBlind: 0,
    handType: 1,
    blueScore: 0,
    redScore: 0,
    hands: 3,
    discards: 3,
    pot: 5,
    money: 0,
    rerollAmount: 3,
    deckSize: 52,
    deckLeft: 52,
    timeLeft: 300,
    actionBlocked:false,
    animVariables:{
        cardIndexToPlayAnim:-1,
        jokerIndexToPlayAnim:-1,
        scorePlayAnim:0,
        activatedJokers:[false,false,false,false,false],
        scoreCards:[],
    }
    
};

export const gameStore = writable<GameState>(stateInit);

export const animationSpeedStore = writable<number>(100);

export const gameEndStore = writable<GameEndInfo>();

export const packageStore = writable<PackageItem>();