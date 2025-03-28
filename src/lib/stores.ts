import { writable } from 'svelte/store';
import type { UserData, Lobby, ChatBuble } from '$lib/interfaces';
import { persisted } from 'svelte-persisted-store'
import { Socket } from 'socket.io-client';

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
    host: false
}

export const lobbyStore = writable<Lobby>(lobbyInitial)

const chatInitial: ChatBuble[] = []

export const chatStore = writable<ChatBuble[]>(chatInitial)

export const socketStore = writable<Socket>()