import type { userItem } from "$lib/interfaces";
import { deleteFriendPath, friendsPath, sendFriendshipRequestPath, sentRequestsPath, deleteSentRequestPath } from "$lib/paths";
import { userDataStore } from "$lib/stores";
import { loadingStore } from "$lib/stores/loadingStore";
import { get } from "svelte/store";


/**
 * Gets the list of friends of the user
 * @param savedFriends list to output to
 * @async
 */
export async function fetchFriends(savedFriends:userItem[]) {
    try {
        loadingStore.startLoading('Loading friends...');
        const response = await fetch(friendsPath, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error getting friends list");
        }

        const data: { username: string; icon: number }[] = await response.json();
        savedFriends.splice(0, savedFriends.length, // Deletes previous items and adds the new ones
            ...data.map((friend: { username: string; icon: number }, index: number) => ({
                key: index,
                username: friend.username,
                icon: friend.icon
            }))
        );
        console.log("API response (friend list):", data);
    } catch (err:any) {
        console.log("API error (friend list):", err);
    } finally {
        loadingStore.stopLoading();
    }
}

/**
 * Gets the list of sent friendship requests of the user
 * @param pendingRequests list to output to
 * @async
 */
export async function fetchSentRequests(pendingRequests:userItem[]) {
    try {
        loadingStore.startLoading('Loading recieved requests...');
        const response = await fetch(sentRequestsPath, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error getting friend sent request list");
        }
        const data = await response.json();
        if (data.sent_friendship_requests) {
            pendingRequests.splice(0, pendingRequests.length, // Deletes previous items and adds the new ones
                ...data.sent_friendship_requests.map((request: { username: string; icon: number }, index: number) => ({
                    key: index,
                    username: request.username,
                    icon: request.icon
                }))
            );
        } else{
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
 * Sends a friendship request from the user to the 'username'
 * @param username to send the request to
 */
export async function fetchSendFriendshipRequest(username:string): Promise<boolean> {
    try {
        loadingStore.startLoading('Sending friend request...');
        const formData = new FormData();
        formData.append('friendUsername', username);

        const response = await fetch(sendFriendshipRequestPath, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error("Error sendig a friendship request");
        }

        const data = await response.json();
        console.log("API response (send a friendship request):", data);
        return true;
    } catch (err:any) {
        console.log("API error (send a friendship request):", err);
        return false;
    } finally {
        loadingStore.stopLoading();
    }
}

/**
 * Deletes a friendship request sent by the user to the 'username'
 * @param username to delete from the request list
 */
export async function fetchDeleteSentFriendRequest(username:string): Promise<boolean> {
    try {
        loadingStore.startLoading('Removing friend request...');
        const response = await fetch(deleteSentRequestPath + username, {
            method: 'DELETE',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error removing friend request:");
        }
        const data = await response.json();
        console.log("API response (delete friend request):", data);
        return true;
    } catch (err:any) {
        console.log("API error (delete friend request):", err);
        return false;
    } finally {
        loadingStore.stopLoading();
    }
}

/**
 * Deletes a friend that goes by the 'username'
 * @param username to delete 
 */
export async function fetchDeleteFriend(username:string): Promise<boolean> {
    try {
        loadingStore.startLoading('Removing friend...');
        const response = await fetch(deleteFriendPath + username, {
            method: 'DELETE',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer ' + get(userDataStore).token,
            }
        });

        if (!response.ok) {
            throw new Error("Error removing friend from list:");
        }
        const data = await response.json();
        console.log("API response (delete friend):", data);
        return true;
    } catch (err:any) {
        console.log("API error (delete friend):", err);
        return false;
    } finally {
        loadingStore.stopLoading();
    }
}