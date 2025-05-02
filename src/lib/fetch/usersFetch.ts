import { mePath, updatePath, userInfoPath } from "$lib/paths";
import { userDataStore } from "$lib/stores";
import { get } from "svelte/store";

/**
 * Attemps to get information about a loged in user, if succesfull saves it on the userDataStore, if not throws error
 * @param token 
 * @async
 */
export async function meFetch(token:string) {
    const response = await fetch(mePath, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    });

    if (!response.ok) {
        throw new Error("Error on get personal information");
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

/**
 * Attemps to update the user information, if succesfull saves it on the userDataStore, if not throws error
 * @param email of the user
 * @param passwd of the user
 * @param remember = true if it wants to be auto loged in every time the user gets to /
 * @async
 * @returns true if successfully changed info
 */
export async function updateFetch(username:string, passwd:string, icon:number): Promise<boolean> {
    try{
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

        return true;
    } catch (err:any) {
        console.log("API error (info change):", err);
        return false;
    }
}

/**
 * Fetches the public info of the username and puts it in responseData
 * @param username of the user to search
 * @async
 */
export async function fetchUserInfo(username:string) {
    try {
        const response = await fetch(userInfoPath + username, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error getting user info");
        }
        const data: { username: string; icon: number } = await response.json();
        console.log("API response (user info):", data);
        return data;
    } catch (err:any) {
        console.log("API error (user info):", err);
        return null;
    }
}