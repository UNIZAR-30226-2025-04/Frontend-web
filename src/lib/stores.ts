import { writable } from 'svelte/store';
import type { UserData } from '$lib/interfaces';
import { persisted } from 'svelte-persisted-store'

let userDataInitial: UserData = {
    username: "Name",
    email: "",
    password: "",
    icon: 1,
    token: 0
}

export let userDataStore = persisted('userDataNogler',userDataInitial)

