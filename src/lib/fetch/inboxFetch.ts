import { addFriendPath, deleteReceivedRequestsPath, receivedFriendshipRequestsPath, recievedGameInvitations } from "$lib/paths";
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
    }
}

/**
 * Deletes the friend request sent to the user by another user with the username 'posibleFriend'
 * @posibleFriend Username of the user who sent the friend invitation
 * @async
 */
export async function fetchDeleteFriendRequest(posibleFriend:string) {
    try {
        const response = await fetch(deleteReceivedRequestsPath + posibleFriend, {
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
    } catch (err:any) {
        console.log("API error (delete friend from request list):", err.message);
    }
}

/**
 * Accepts the friend request sent to the user by another user with the username 'posibleFriend'
 * @posibleFriend Username of the user who sent the friend invitation
 * @async
 */
export async function fetchAcceptFriendshipRequest(posibleFriend:string) {
    try {
        const formData = new FormData();
        formData.append('friendUsername', posibleFriend);

        const response = await fetch(addFriendPath, {
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
    } catch (err:any) {
        console.log("API error (accept a friendship request):", err.message);
    }
}

/**
 * Gets all the friendship invitations sent to the user
 * @pendingRequests List of the game invitations to update 
 * @async
 */
async function fetchReceivedGameInvitations(invitations:invitation[]) {
    return;
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

    //await fetchReceivedGameInvitations(invitations);
    await fetchReceivedFriendshipRequests(pendingRequests);
    
}


