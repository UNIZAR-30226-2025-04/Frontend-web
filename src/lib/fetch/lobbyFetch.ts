import type { inviteItem } from "$lib/interfaces";
import { createLobbyPath, exitLobbyPath, joinLobbyPath, sentLobbyInvitationsPath } from "$lib/paths";
import { lobbyStore, userDataStore } from "$lib/stores";
import { get } from "svelte/store";


/**
 * Sends a POST request to the server to create a lobby
 * @async
 */
export async function createLobbyFetch(): Promise<boolean> {
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
        console.log("API response (create a lobby):", data);
        return await joinLobbyFetch(lobbyCode);
    } catch (err:any) {
        console.log("API error (create a lobby):", err);
        return false;
    }
}

/**
 * Sends a POST request to the server to insert a user into a lobby
 * @async
 */
export async function joinLobbyFetch(lobbyCode : string): Promise<boolean> {
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
        return true;
    } catch (err:any) {
        console.log("API error (insert the user into the lobby):", err);
        return false;
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
 * Gets the lobby invitations sent by the user to the lobby from it's requesting
 * @param invitation list where to save the invitations
 * @async
 */
export async function fetchSentInvitations(invitation:inviteItem[]) {
    try{
        const response = await fetch(sentLobbyInvitationsPath, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            },
        });

        if (!response.ok) {
            throw new Error("Error leaving the lobby");
        }

        const data = await response.json();
        console.log("API response (sent invitations):", data);

        let lobbyID:string = get(lobbyStore).code;
        // Filter off the invites that are not from the lobby the user is in
        data.sent_game_lobby_invitations = data.sent_game_lobby_invitations.filter((inv: { lobby_id: string }) => inv.lobby_id === lobbyID);
        invitation.splice(0, invitation.length, // Deletes previous items and adds the new ones
            ...data.sent_game_lobby_invitations.map((inv: { username: string; icon: number }, index: number) => ({
                key: index,
                username: inv.username,
                icon: inv.icon,
                sent: true
            }))
        );

    } catch (err:any) {
        console.log("API error (sent invitations):", err);
    }
}