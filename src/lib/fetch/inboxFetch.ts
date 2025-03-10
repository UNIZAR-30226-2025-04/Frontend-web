import { receivedFriendshipRequestsPath, recievedGameInvitations } from "$lib/paths";
import { userDataStore } from "$lib/stores";
import { get } from "svelte/store";
import type { invitation, request } from '$lib/interfaces'

/**
 * Gets all the friendship invitations sent to the user
 * @pendingRequests List of the friend requests to update 
 * @async
 */
async function fetchReceivedFriendshipRequests(pendingRequests:request[]) {
    try {
        const response = await fetch(receivedFriendshipRequestsPath, {
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
            pendingRequests = data.received_friendship_requests.map((request: { username: string }, index: number) => ({
                key: index,
                username: request.username,
            }));
        } else {
            pendingRequests = [];
        }
        console.log("API response (friend request list):", data);
    } catch (err:any) {
        console.log("API error (friend request list):", err);
    }
}

/**
 * Gets all the friendship invitations sent to the user
 * @pendingRequests List of the game invitations to update 
 * @async
 */
async function fetchReceivedGameInvitations(invitations:invitation[]) {
    try {
        const response = await fetch(recievedGameInvitations, {
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
            invitations = data.received_friendship_requests.map((request: { username: string }, index: number) => ({
                key: index,
                username: request.username,
            }));
        } else {
            invitations = [];
        }
        console.log("API response (friend request list):", data);
    } catch (err:any) {
        console.log("API error (friend request list):", err);
    }
}

/**
 * Gets infomration for the inbox of the user: friendship requests and game invitations
 * @invitations List of the game invitations to update 
 * @pendingRequests List of the friend requests to update 
 * @async
 */
export async function getInbox(invitations:invitation[], pendingRequests:request[]) {

    await fetchReceivedGameInvitations(invitations);
    await fetchReceivedFriendshipRequests(pendingRequests);
    
}


