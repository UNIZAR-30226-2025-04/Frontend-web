import { updatePath } from "$lib/paths";
import { userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import { meFetch } from "./meFetch";

/**
 * Attemps to update the user information, if succesfull saves it on the userDataStore, if not throws error
 * @param email of the user
 * @param passwd of the user
 * @param remember = true if it wants to be auto loged in every time the user gets to /
 * @async
 */
export async function updateFetch(username:string, passwd:string, icon:number) {

    console.log("UPDATE FETCH");
    console.log("username: "+username);
    console.log("passwd: "+passwd);
    console.log("icon: "+icon);

    if(typeof username === 'undefined') username = "";
    if(typeof passwd === 'undefined') passwd = "";
    if(typeof icon === 'undefined') icon = 1;

    const formData = new URLSearchParams();
    if(username !== "") formData.append("username", username);
    if(passwd !== "") formData.append("password", passwd);
    if(icon > 0) formData.append("icon", ""+icon);

    console.log("formData: "+formData.toString());

    const response = await fetch(updatePath, {
        method: 'PATCH',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + get(userDataStore).token
        },
        body: formData.toString()
    });
    
    if (!response.ok) {
        throw new Error("Error on authentication");
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    
    const newUsername = username !== "" ? username : get(userDataStore).username;
    const newPassword = passwd !== "" ? passwd : get(userDataStore).password;
    const newIcon = icon > 0 ? icon : get(userDataStore).icon;

    userDataStore.update(user => ({
        ...user,
        username: newUsername,
        password: newPassword,
        icon: newIcon
    }));
}