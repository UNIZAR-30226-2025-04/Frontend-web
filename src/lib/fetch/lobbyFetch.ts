import { createLobbyPath, exitLobbyPath, joinLobbyPath, allLobbiesPath } from "$lib/paths";
import { lobbyStore, userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import type { LobbyInfo, LobbyDisplay } from "$lib/interfaces";


/**
 * Sends a POST request to the server to create a lobby
 * @async
 */
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

/**
 * Sends a POST request to the server to insert a user into a lobby
 * @async
 */
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

/**
 * Sends a POST request to the server to remove the user from the lobby
 * @async
 */
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

/**
 * Obtains all lobbies available
 * @returns List of lobbies
 * @async
 */
export async function getAllLobbiesFetch(): Promise<LobbyDisplay[]> {
    const token = get(userDataStore).token;
    console.log("Token para pruebas:", token);
    
    const response = await fetch(allLobbiesPath, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer ' + token,
      }
    });

    if (!response.ok) {
      throw new Error("Error obteniendo la lista de lobbies");
    }
    
    const data: LobbyInfo[] = await response.json();
    console.log("API response (get all lobbies):", data);
    
    // Convert the data to our display format
    return data.map((lobby: LobbyInfo) => ({
      key: lobby.lobby_id,
      host: lobby.creator_username,
      icon: lobby.host_icon, // All users have an icon, default is 1
      players: 1, // By default we assume at least the creator is in the lobby
      maxPlayers: 8, // Default value
      rounds: lobby.number_rounds,
      points: lobby.total_points
    }));
}