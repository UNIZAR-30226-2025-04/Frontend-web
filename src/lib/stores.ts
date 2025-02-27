import { writable } from 'svelte/store';
import type { UserData } from '$lib/interfaces';

let userDataInitial: UserData = {
    username: "",
    email: "",
    password: "",
    icon: 0,
    token: 0
}

export let userDataStore = writable(userDataInitial)

