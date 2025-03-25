import type { inviteItem } from "$lib/interfaces";
import { allLobbiesPath, createLobbyPath, deleteSentLobbyInvitationsPath, exitLobbyPath, joinLobbyPath, sendLobbyInvitationsPath, sentLobbyInvitationsPath } from "$lib/paths";
import { lobbyStore, userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import type { LobbyInfo, LobbyDisplay } from "$lib/interfaces";


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
    } catch (err: any) {
        console.log("API error (create a lobby):", err);
        return false;
    }
}

/**
 * Sends a POST request to the server to insert a user into a lobby
 * @async
 */
export async function joinLobbyFetch(lobbyCode: string): Promise<boolean> {
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
    } catch (err: any) {
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

        const response = await fetch(exitLobbyPath + get(lobbyStore).code, {
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
    } catch (err: any) {
        console.log("API error (leave the lobby):", err);
    }
}

/**
 * Gets the lobby invitations sent by the user to the lobby from it's requesting
 * @param invitation list where to save the invitations
 * @async
 */
export async function fetchSentInvitations(invitation: inviteItem[]) {
    try {

        const response = await fetch(sentLobbyInvitationsPath, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            },
        });

        if (!response.ok) {
            throw new Error("Error fetching the sent invitations");
        }

        const data = await response.json();
        console.log("API response (sent invitations):", data);

        let lobbyID: string = get(lobbyStore).code;
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

    } catch (err: any) {
        console.log("API error (sent invitations):", err);
    }
}

/**
 * Sends an invitation to the current lobby
 * @param username of the user to send the invitation to
 * @returns true if success
 * @async
 */
export async function fetchSendInvitation(username: string): Promise<boolean> {
    try {

        const formData = new URLSearchParams();
        formData.append("lobby_id", get(lobbyStore).code);
        formData.append("friendUsername", username);

        const response = await fetch(sendLobbyInvitationsPath, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            },
            body: formData.toString()
        });

        if (!response.ok) {
            throw new Error("Error sending invitation");
        }

        const data = await response.json();
        console.log("API response (send invitation):", data);

        return true;
    } catch (err: any) {
        console.log("API error (send invitation):", err);
        return false;
    }
}

/**
 * Deletes a sent invitation to the current lobby
 * @param username of the user that was sent the invitation to
 * @returns true if success
 * @async
 */
export async function fetchDeleteSentInvitation(username: string): Promise<boolean> {
    try {

        const response = await fetch(deleteSentLobbyInvitationsPath + get(lobbyStore).code + "/" + username, {
            method: 'DELETE',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            },
        });

        if (!response.ok) {
            throw new Error("Error deleting invitation");
        }

        const data = await response.json();
        console.log("API response (delete invitation):", data);

        return true;
    } catch (err: any) {
        console.log("API error (delete invitation):", err);
        return false;
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