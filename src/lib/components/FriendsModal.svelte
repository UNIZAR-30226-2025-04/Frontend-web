<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { userDataStore } from '$lib/stores';
    import  AvatarDisplay  from "./AvatarDisplay.svelte";
    import { avatarDirectory } from "$lib/avatarsDirectory";
	import { flip } from 'svelte/animate';
    import { apiBase, friendsPath, sentRequestsPath, deleteFriendPath, deleteSentRequestPath, sendFriendshipRequestPath, userInfoPath } from '$lib/paths';
    import { get } from 'svelte/store';

    // Style classes for the error message and the containers that hold it
    const errorContainer = 'alert variant-ghost-error p-2';
    const errorMessage = 'alert-message text-left'

    let sendRequestError = false;

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    interface listItem {
        key: number
        username: string
        icon: number
    }

    // Value of the username search bar
    let usernameSearch: string;
    // Array of saved users, only icon and username
    let savedFriends: listItem[] = [];
    // Array of pending user requests, only icon and username
    let pendingRequests: listItem[] = [];
    // Text of the Add button, used to change it to "..." while it process
    let AddText: string = "Add";

    let error= '';

    let token = get(userDataStore).token;

    // Fetches the list of friends from the server using a GET request
    async function fetchFriends() {
        try {
            const response = await fetch(friendsPath, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });

            if (!response.ok) {
                throw new Error("Error getting friends list");
            }

            const data: { username: string; icon: number }[] = await response.json();
            savedFriends = data.map((friend, index) => ({
                key: index,
                username: friend.username,
                icon: friend.icon
            }));
            console.log("API response (friend list):", data);
        } catch (err:any) {
            error = err.message;
            console.log("API error (friend list):", error);
        }
    }

    // Fetches the list of sent pending friend requests from the server using a GET request
    async function fetchRequests() {
        try {
            const response = await fetch(sentRequestsPath, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });

            if (!response.ok) {
                throw new Error("Error getting friend sent request list");
            }
            const data = await response.json();
            if (data.sent_friendship_requests) {
                pendingRequests = data.sent_friendship_requests.map((request: { username: string; icon: number }, index: number) => ({
                    key: index,
                    username: request.username,
                    icon: request.icon
                }));
            } else{
                pendingRequests = [];
            }
            console.log("API response (friend request list):", data);
        } catch (err:any) {
            error = err.message;
            console.log("API error (friend request list):", error);
        }
    }

    // Loads both the friends list and the pending friend requests in parallel
    async function loadData() {
        await Promise.all([fetchFriends(), fetchRequests()]);
    }

    loadData();

    /**
     * Removes from the savedFriends list the index that has the key
     * @param index
     * @param key
     * @async
     */
    async function removeFriend(index:number, key:number){
        let auxUsername:string = savedFriends[index].username;
        savedFriends[index].username = "Removing..."
        savedFriends=savedFriends;
        await sleep(2000);
        savedFriends = savedFriends.filter(request => request.key !== key);
        savedFriends = savedFriends;
    }

    // Sends a DELETE request to the server to remove a friend, then updates the local friend list if successful
    async function fetchDeleteFriend(index:number, key:number) {
        try {
            const response = await fetch(deleteFriendPath + savedFriends[index].username, {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });

            if (!response.ok) {
                throw new Error("Error removing friend from list:");
            }
            removeFriend(index, key);
            const data = await response.json();
            console.log("API response (delete friend):", data);
        } catch (err:any) {
            error = err.message;
        }
    }

    /**
     * Removes from the pending list the index
     * @param index
     * @param key
     * @async
     */
    async function removeRequest(index:number, key:number){
        let auxUsername:string = pendingRequests[index].username;
        pendingRequests[index].username = "Removing..."
        pendingRequests=pendingRequests;
        await sleep(2000);
        pendingRequests = pendingRequests.filter(request => request.key !== key);
        pendingRequests = pendingRequests;
    }

    // Sends a DELETE request to the server to remove a friend request, then updates the local friend list if successful
    async function fetchDeleteFriendRequest(index:number, key:number) {
        try {
            const response = await fetch(deleteSentRequestPath + pendingRequests[index].username, {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });

            if (!response.ok) {
                throw new Error("Error removing friend from request list:");
            }
            removeRequest(index, key);
            const data = await response.json();
            console.log("API response (delete friend from request list):", data);
        } catch (err:any) {
            error = err.message;
        }
    }

    /**
     * Adds the username on the search bar to the pendingRequests list
     * @async
     */
    async function clickOnAdd() {
        AddText = "...";
        await sleep(2000);
        fetchUserInfo()
        AddText = "Add";
    }

    // Fetches the user info from the server using a GET request
    async function fetchUserInfo() {
        try {
            const response = await fetch(userInfoPath + usernameSearch, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });

            if (!response.ok) {
                throw new Error("Error getting user info");
            }
            const data: { username: string; icon: number } = await response.json();
            let newFriendRequest: listItem = {username:usernameSearch,icon:data.icon,key:pendingRequests.length + 1};
            pendingRequests = [...pendingRequests, newFriendRequest];
            console.log("API response (user info):", data);
        } catch (err:any) {
            error = err.message;
            console.log("API error (user info):", error);
        }
    }

    // Sends a POST request to the server to send a friendship request
    async function fetchSendFriendshipRequest() {
        try {
            const formData = new FormData();
            formData.append('friendUsername', usernameSearch);

			const response = await fetch(sendFriendshipRequestPath, {
				method: 'POST',
				headers: {
					'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
				},
				body: formData
			});

			if (!response.ok) {
				throw new Error("Error sendig a friendship request");
			}
            
            clickOnAdd();
			const data = await response.json();
            sendRequestError = false;
			console.log("API response (send a friendship request):", data);
		} catch (err:any) {
			error = err.message;
            console.log("API error (send a friendship request):", error);
            sendRequestError = true;
		}
    }

    /**
     * Dummy function to sleep ms while we wait or backend to have the API ready
     * @param ms
     */
     function sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Test data while we wait for endpoints
    //savedFriends = [
    //    {username:"Victor",icon:1,key:0},
    //    {username:"Emilliano",icon:2,key:1},
    //    {username:"Jogue",icon:3,key:2},
    //    {username:"Ruben",icon:4,key:3},
    //    {username:"Jota",icon:1,key:4},
    //    {username:"Josemi",icon:2,key:5},
    //    {username:"Yago",icon:3,key:6},
    //    {username:"Nicolas",icon:4,key:7},
    //
    //]
    //pendingRequests = [
    //    {username:"Solana",icon:5,key:0},
    //    {username:"Diego",icon:6,key:1},
    //    {username:"Elias",icon:7,key:2},
    //    {username:"Zanos",icon:8,key:3},
    //    {username:"Raul",icon:5,key:4},
    //    {username:"Tristan",icon:9,key:5},
    //]
    

</script>

<!-- @component Friends modal to send/eliminate friend requests and show/eliminate saved friends -->
<div class="modal-form card p-4 w-[450px] shadow-xl space-y-4 text-left">
    <!--Top row, title and cross button-->
    <div class="flex justify-between">
        <div class="content-center text-[22px]">Add friend</div>
        <button class="block btn-icon-sm rounded-md font-bold variant-filled text-[18px]" on:click={parent.onClose}>X</button>
    </div>
    <!--Search box and Add button-->
    <div class="flex gap-[15px] justify-between">
        <input class="input" type="text" placeholder="Type username here" bind:value={usernameSearch}/>
        <button class="btn variant-filled" on:click={fetchSendFriendshipRequest}>{AddText}</button>
    </div>
    {#if sendRequestError}
        <aside class="{errorContainer}">
            <div class="{errorMessage}">
                User doesn't exist
            </div>
        </aside>
    {/if}
    <!--Title and vertical scroll for saved friends-->
    <div class="content-center text-[18px]">Saved friends</div>
    <div class="h-52 overflow-y-auto p-2">
        {#each savedFriends as friend, index (friend.key)}
            <div animate:flip class="flex mb-2 gap-3">
                <!--on:click funtions need to be anonimus so a landa function is necesary-->
                <button class="btn-icon-sm rounded-md font-bold variant-filled text-[15px]" on:click={() => {fetchDeleteFriend(index, friend.key)}}>X</button>
                <div class="content-center"><AvatarDisplay icon={friend.icon} width={35}/></div>
                <div class="content-center text-[22px]">{friend.username}</div>
            </div>
        {/each}
    </div>
    <!--Title and vertical scroll for pending friend requests-->
    <div class="content-center text-[18px]">Pending friend requests</div>
    <div class="h-52 overflow-y-auto p-2">
        {#each pendingRequests as request, index (request.key)}
            <div animate:flip class="flex mb-2 gap-3">
                <!--on:click funtions need to be anonimus so a landa function is necesary-->
                <button class="btn-icon-sm rounded-md font-bold variant-filled text-[15px]" on:click={() => {fetchDeleteFriendRequest(index, request.key)}}>X</button>
                <div class="content-center"><AvatarDisplay icon={request.icon} width={35}/></div>
                <div class="content-center text-[22px]">{request.username}</div>
            </div>
        {/each}
    </div>
</div>