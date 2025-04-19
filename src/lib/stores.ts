import { writable } from 'svelte/store';
import { type UserData, type Lobby, type ChatBuble, type GameState } from '$lib/interfaces';
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

const chatInitial: ChatBuble[] = []

export const chatStore = writable<ChatBuble[]>(chatInitial)
export const chatFeedElem = writable<HTMLElement>()

export const socketStore = writable<Socket>()

let stateInit: GameState = {
    playedCards: [],
    handCards: [],
    jokers: [],
    activeVouchers: [],
    vouchers: [],
    handLevels: structuredClone(HandTypesBase),
    shop: { jokerRow: [], voucherRow: [], packageRow: [] },
    round: 1,
    phase: 0,
    minScore: 1000,
    proposedBlind: 1000,
    handType: 1,
    blueScore: 0,
    redScore: 0,
    hands: 3,
    discards: 3,
    pot: 5,
    money: 0,
    rerollAmount: 3,
    deckLeft: [],
    deckPlayed: [],
    timeLeft: 300,
};

export const gameStore = writable<GameState>(stateInit);

export const actionBlockedStore = writable<boolean>(false);

export const animationSpeedStore = writable<number>(100);