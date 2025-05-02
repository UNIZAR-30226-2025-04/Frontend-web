import type { inviteItem, LobbyInfo, LobbyDisplay } from "$lib/interfaces";
import { allLobbiesPath, createLobbyPath, deleteSentLobbyInvitationsPath, exitLobbyPath, joinLobbyPath, sendLobbyInvitationsPath, sentLobbyInvitationsPath, receivedGameInvitations, deleteReceivedInvitationPath, isUserInLobbyPath } from "$lib/paths";
import { lobbyStore, userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import { fetchDeleteGameInvitation } from "$lib/fetch/inboxFetch";
import { loadingStore } from '$lib/stores/loadingStore';

/**
 * Sends a POST request to the server to create a lobby
 * @param isPublic Define if the lobby is public or not
 * @async
 */
export async function createLobbyFetch(mode: number = 0): Promise<boolean> {
    try {
        const formData = new URLSearchParams();
        formData.append('public', mode.toString());

        const response = await fetch(createLobbyPath, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            },
            body: formData
        });

        if (!response.ok) {
            console.error(`Error creating lobby: ${response.status} ${response.statusText}`);
            throw new Error("Error creating a lobby");
        }

        const data = await response.json();
        console.log("API response (create a lobby):", data);
        const lobbyCode = data.lobby_id;

        lobbyStore.set({
            code: lobbyCode,
            host: true,
            players: [],
            isPublic: mode === 1
        });
        
        return await joinLobbyFetch(lobbyCode);
    } catch (err: any) {
        console.log("API error (create a lobby):", err);
        return false;
    }
}

/**
 * Sends a POST request to the server to insert a user into a lobby
 * and cleans up any pending invitations for that lobby
 * @async
 */
export async function joinLobbyFetch(lobbyCode: string): Promise<boolean> {
    try {
        // Start the loading with a specific message
        loadingStore.startLoading('Joining lobby...');
        
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
        
        lobbyStore.update(lobby => ({
            ...lobby,
            code: lobbyCode,
            // Keep the host property
            players: []
        }));
        
        // After successfully joining, check for pending invitations to this lobby
        try {
            loadingStore.startLoading('Cleaning pending invitations...');
            
            // Get all received invitations
            const invitationsResponse = await fetch(receivedGameInvitations, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + get(userDataStore).token,
                }
            });
            
            if (invitationsResponse.ok) {
                const invitationsData = await invitationsResponse.json();
                
                // Check if there's an invitation for this lobby
                if (invitationsData.received_game_lobby_invitations) {
                    for (const invitation of invitationsData.received_game_lobby_invitations) {
                        if (invitation.lobby_id === lobbyCode) {
                            // Found an invitation for this lobby, delete it
                            console.log("Found pending invitation for joined lobby, deleting it");
                            await fetchDeleteGameInvitation(lobbyCode, invitation.username);
                        }
                    }
                }
            }
        } catch (error) {
            // Just log the error but don't fail the join operation
            console.error("Error cleaning up invitations:", error);
        } finally {
            // Ensure to stop the loading even if there's an error
            loadingStore.stopLoading();
        }
        
        return true;
    } catch (err: any) {
        console.log("API error (insert the user into the lobby):", err);
        return false;
    } finally {
        // Ensure to stop the loading even if there's an error
        loadingStore.stopLoading();
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

        lobbyStore.update(() => ({
            code: "0000",
            host: false,
            players:[]
        }));

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

/**
 * Fetches the information of a lobby, including the list of current players.
 * @param lobbyId - The ID of the lobby.
 * @returns an object containing the lobby info (with property players) or null on error.
 * @async
 */
export async function fetchLobbyInfo(lobbyId: string): Promise<any> {
    try {
        console.log(`Trying to get lobby info: ${lobbyId}`);
        
        const response = await fetch(`https://nogler.ddns.net:443/auth/lobbyInfo/${lobbyId}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });
        
        if (!response.ok) {
            console.error(`Error fetchLobbyInfo: ${response.status} ${response.statusText}`);
            throw new Error(`Error fetchLobbyInfo: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Show the full response
        console.log("%c Complete response from API:", "background: #222; color: #bada55; font-size: 16px");
        console.log(JSON.stringify(data, null, 2));
        console.dir(data); // Shows the object interatively
        
        // If the response doesn't contain players, add an empty array
        if (!data.players) {
            console.warn("The API didn't return a player array, using empty array");
            data.players = [];
        }
        
        return data;
    } catch (err: any) {
        console.error("Error grave en fetchLobbyInfo:", err);
        return null;
    }
}

/**
 * Deletes a lobby invitation after accepting or rejecting it
 * @param lobbyId ID of the lobby
 * @param senderUsername Username of the user who sent the invitation
 * @returns True if successful, false otherwise
 */
export async function deleteReceivedInvitation(lobbyId: string, senderUsername: string): Promise<boolean> {
    try {
        const response = await fetch(deleteReceivedInvitationPath + lobbyId + "/" + senderUsername, {
            method: 'DELETE',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token
            }
        });

        if (!response.ok) {
            console.error("Error deleting invitation:", await response.text());
            return false;
        }

        console.log("Invitation successfully deleted");
        return true;
    } catch (error) {
        console.error("Exception deleting invitation:", error);
        return false;
    }
}

/**
 * Checks wherever the user is already in a lobby, if true then returns the code
 * @returns lobby code if no errors or "" if an error occurs
 */
export async function isUserInLobby(): Promise<string> {
    try {
        const response = await fetch(isUserInLobbyPath, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token
            }
        });

        if (!response.ok) {
            console.error("Error getting user lobby info:", await response.text());
            return "";
        }

        const data = await response.json();
        console.log("User lobby info got:",data);

        if(data.in_lobby){
            return data.lobby_id;
        }else{
            return "";
        }
    } catch (error) {
        console.error("Exception getting user lobby info:", error);
        return "";
    }
}
