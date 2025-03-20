import { loginPath } from "$lib/paths";
import { userDataStore } from "$lib/stores";
import { meFetch } from "./usersFetch";

/**
 * Attemps to login the user, if succesfull saves it on the userDataStore, if not throws error
 * @param email of the user
 * @param passwd of the user
 * @param remember = true if it wants to be auto loged in every time the user gets to /
 * @async
 */
export async function loginFetch(email:string, passwd:string, remember:boolean) {

    const formData = new URLSearchParams();
		formData.append("email", email);
		formData.append("password", passwd);

    const response = await fetch(loginPath, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });
    
    if (!response.ok) {
        throw new Error("Error on authentication");
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    
    await meFetch(data.token)
    
    userDataStore.update(user => ({
        ...user,
        password:passwd,
        remember:remember
    }));
}