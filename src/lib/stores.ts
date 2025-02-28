import { writable } from 'svelte/store';
import type { UserData } from '$lib/interfaces';

let userDataInitial: UserData = {
    username: "Name",
    email: "",
    password: "",
    icon: 1,
    token: 0
}

export let userDataStore = writable(userDataInitial)

