import type { UserData } from '$lib/interfaces';
import { mePath } from '$lib/paths';
import { userDataStore } from '$lib/stores';

export async function meFetch(token:string) {
    const response = await fetch(mePath, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    });

    if (!response.ok) {
        throw new Error("Error en la autenticación");
    }

    const data = await response.json();

    userDataStore.update(user => ({
        ...user,
        email:data.email,
        icon:data.icon,
        username:data.username,
        token:token
    }))

}