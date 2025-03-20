import { createLobbyPath, exitLobbyPath, joinLobbyPath } from "$lib/paths";
import { lobbyStore, userDataStore } from "$lib/stores";
import { get } from "svelte/store";


// Sends a POST request to the server to create a lobby
export async function createLobbyFetch() {
    try {

        const response = await fetch(createLobbyPath, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error creating a lobby");
        }
        
        const data = await response.json();
        const lobbyCode = data["lobby_id"];
        lobbyStore.update(() => ({
            code: lobbyCode,
            host: true
        }));
        await joinLobbyFetch(lobbyCode);
        console.log("API response (create a lobby):", data);
    } catch (err:any) {
        console.log("API error (create a lobby):", err);
    }
}

// Sends a POST request to the server to insert a user into a lobby
export async function joinLobbyFetch(lobbyCode : string) {
    try {

        const response = await fetch(joinLobbyPath + lobbyCode, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error inserting the user into the lobby");
        }
        
        const data = await response.json();
        console.log("API response (insert the user into the lobby):", data);
    } catch (err:any) {
        console.log("API error (insert the user into the lobby):", err);
    }
}

// Sends a POST request to the server to remove the user from the lobby
export async function fetchExitLobby() {
  try {
    const response = await fetch(exitLobbyPath + get(lobbyStore).code , {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer ' + get(userDataStore).token,
      },
    });

    if (!response.ok) {
      throw new Error("Error leaving the lobby");
    }
          
    const data = await response.json();
    console.log("API response (leave the lobby):", data);
  } catch (err:any) {
      console.log("API error (leave the lobby):", err);
  }
}