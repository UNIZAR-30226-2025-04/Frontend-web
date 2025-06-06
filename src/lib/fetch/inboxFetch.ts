import { addFriendPath, apiBaseStore, deleteReceivedInvitationPath, deleteReceivedRequestsPath, receivedFriendshipRequestsPath, receivedGameInvitations } from "$lib/paths";
import { userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import type { invitation, request } from '$lib/interfaces'
import { loadingStore } from "$lib/stores/loadingStore";

/**
 * Gets all the friendship invitations sent to the user
 * @pendingRequests List of the friend requests to update 
 * @async
 */
export async function fetchReceivedFriendshipRequests(pendingRequests:request[]) {
    try {
        loadingStore.startLoading('Loading requests...');
        const response = await fetch(get(apiBaseStore) + receivedFriendshipRequestsPath, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error getting friends list");
        }

        const data = await response.json();
        if (data.received_friendship_requests) {
            pendingRequests.splice(0, pendingRequests.length, // Deletes previous items and adds the new ones
                ...data.received_friendship_requests.map((request: { username: string }, index: number) => ({
                    key: index,
                    username: request.username,
                }))
            );
        
            console.log("API");
            console.log(pendingRequests)
        } else {
            pendingRequests = [];
        }
        console.log("API response (friend request list):", data);
    } catch (err:any) {
        console.log("API error (friend request list):", err);
    } finally {
        loadingStore.stopLoading();
    }
}

/**
 * Deletes the friend request sent to the user by another user with the username 'posibleFriend'
 * @posibleFriend Username of the user who sent the friend invitation
 * @async
 */
export async function fetchDeleteFriendRequest(posibleFriend:string): Promise<boolean> {
    try {
        const response = await fetch(get(apiBaseStore) + deleteReceivedRequestsPath + posibleFriend, {
            method: 'DELETE',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error removing friend from request list:");
        }
        const data = await response.json();
        console.log("API response (delete friend from request list):", data);
        return true;
    } catch (err:any) {
        console.log("API error (delete friend from request list):", err.message);
        return false;
    }
}

/**
 * Accepts the friend request sent to the user by another user with the username 'posibleFriend'
 * @posibleFriend Username of the user who sent the friend invitation
 * @async
 */
export async function fetchAcceptFriendshipRequest(posibleFriend:string): Promise<boolean> {
    try {
        loadingStore.startLoading('Accepting request...');
        const formData = new FormData();
        formData.append('friendUsername', posibleFriend);

        const response = await fetch(get(apiBaseStore) + addFriendPath, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error("Error accepting the friendship request");
        }
        
        const data = await response.json();
        console.log("API response (accept a friendship request):", data);
        return true;
    } catch (err:any) {
        console.log("API error (accept a friendship request):", err.message);
        return false;
    } finally {
        loadingStore.stopLoading();
    }
}

/**
 * Gets all the game invitations sent to the user
 * @invitations List of the game invitations to update 
 * @async
 */
export async function fetchReceivedGameInvitations(invitations:invitation[]) {
    try {
        loadingStore.startLoading('Loading invitations...');
        const response = await fetch(get(apiBaseStore) + receivedGameInvitations, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error getting friends list");
        }

        const data = await response.json();

        if (data.received_game_lobby_invitations) {
            invitations.splice(0, invitations.length, // Deletes previous items and adds the new ones
                ...data.received_game_lobby_invitations.map((inv:{icon:number, lobby_id:number, player_count:number, username:string}, index: number) => ({
                    key: index,
                    username: inv.username,
                    code: inv.lobby_id,
                    players: inv.player_count,
                }))
            );
        
            console.log("API");
            console.log(invitations)
        } else {
            invitations = [];
        }


        console.log("API response (recieved invitations list):", data);
    } catch (err:any) {
        console.log("API error (recieved invitations list):", err);
    } finally {
        loadingStore.stopLoading();
    }
}

/**
 * Deletes a recieved invitation to a lobby from a username
 * @param username of the user that sent the invitation
 * @returns true if success
 * @async
 */
export async function fetchDeleteGameInvitation(code:string, username: string): Promise<boolean> {
    try {

        const response = await fetch(get(apiBaseStore) + deleteReceivedInvitationPath + code + "/" + username, {
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