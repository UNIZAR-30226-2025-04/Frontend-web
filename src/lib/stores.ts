import { writable } from 'svelte/store';
import { type UserData, type Lobby, type ChatBuble, type GameState, type GameEndInfo, type PackageItem, type Colors } from '$lib/interfaces';
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
    players:[],
    mode:0
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

export const gameEndInit = {
    winner:"",
    points:0,
    userWon:false
}

export const gameEndStore = writable<GameEndInfo>(gameEndInit);

export const packageStore = writable<PackageItem>();

export const unreadMessages = writable(false);

export const colorStore = writable<Colors>({
	color1: [0.1, 0.238, 0.4, 1.0],
	color2: [0.36, 0.1, 0.224, 1.0],
	color3: [0.086, 0.137, 0.145, 1.0],
});

