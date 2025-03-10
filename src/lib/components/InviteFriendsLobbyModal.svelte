<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { userDataStore } from '$lib/stores';
    import  AvatarDisplay  from "./AvatarDisplay.svelte";
    import { avatarDirectory } from "$lib/avatarsDirectory";
	import { flip } from 'svelte/animate';
    import { apiBase, friendsPath, sentLobbyInvitationsPath, deleteSentLobbyInvitationsPath, sendFriendshipRequestPath } from '$lib/paths';
    import { get } from 'svelte/store';


    let sendRequestError = false;

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    interface listItem {
        key: number
        username: string
        icon: number
    }

    interface listInvitations{
        key: number
        username: string
    }

    // Value of the username search bar
    let usernameSearch: string;
    // Array of saved users, only icon and username
    let savedFriends: listItem[] = [];
    // Array of sent invitations
    let sentInvitations: listInvitations[] = [];
    // Text of the Add button, used to change it to "..." while it process
    let AddText: string = "Add";

    let error= '';

    let token = get(userDataStore).token;

    let invite= 'Invite'
    let cancel= 'Cancel'

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

    // Fetches the list of sent invitations from the server using a GET request
    async function fetchSentInvitations() {
        try {
            const response = await fetch(sentLobbyInvitationsPath, {
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
            if (data.sent_invitations) {
                sentInvitations = data.sent_invitations.map((request: { username: string }, index: number) => ({
                    key: index,
                    username: request.username,
                }));
            } else{
                sentInvitations = [];
            }
            console.log("API response (friend request list):", data);
        } catch (err:any) {
            error = err.message;
            console.log("API error (friend request list):", error);
        }
    }

    // Loads both the friends list and the sent invitations in parallel
    //async function loadData() {
    //    await Promise.all([fetchFriends(), fetchSentInvitations()]);
    //}
//
    //loadData();

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

    // Sends a DELETE request to the server to remove a invitation
    //async function fetchDeleteFriend(index:number, key:number) {
    //    try {
    //        const response = await fetch(deleteFriendPath + savedFriends[index].username, {
    //            method: 'DELETE',
    //            headers: {
    //                'accept': 'application/json',
    //                'Authorization': 'Bearer ' + token,
    //            }
    //        });
//
    //        if (!response.ok) {
    //            throw new Error("Error removing friend from list:");
    //        }
    //        removeFriend(index, key);
    //        const data = await response.json();
    //        console.log("API response (delete friend):", data);
    //    } catch (err:any) {
    //        error = err.message;
    //    }
    //}


    /**
     * Adds the username on the search bar to the pendingRequests list
     * @async
     */
    async function clickOnAdd() {
        AddText = "...";
        await sleep(2000);
        let newFriendRequest: listItem = {username:usernameSearch,icon:1,key:sentInvitations.length + 1};
        sentInvitations = [...sentInvitations, newFriendRequest];
        AddText = "Add";
    }

    // Sends a POST request to the server to send a lobby invitation
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
    savedFriends = [
        {username:"Victor",icon:1,key:0},
        {username:"Emilliano",icon:2,key:1},
        {username:"Jogue",icon:3,key:2},
        {username:"Ruben",icon:4,key:3},
        {username:"Jota",icon:1,key:4},
        {username:"Josemi",icon:2,key:5},
        {username:"Yago",icon:3,key:6},
        {username:"Nicolas",icon:4,key:7},
        {username:"Jota",icon:1,key:8},
        {username:"Josemi",icon:2,key:9},
        {username:"Yago",icon:3,key:10},
        {username:"Nicolas",icon:4,key:11},
        {username:"Josemi",icon:2,key:12},
        {username:"Yago",icon:3,key:13},
        {username:"Nicolas",icon:4,key:14},
    
    ]

    sentInvitations = [
        {username:"Victor",key:0},
        {username:"Emilliano",key:1},
        {username:"Jogue",key:2},
        {username:"Ruben",key:3},
        {username:"Jota",key:4},
    ]
    
    function onCancel(){
        cancel = cancel === 'Cancel' ? 'Invite' : 'Cancel';
    }

    function onInvite(){
        invite = invite === 'Invite' ? 'Cancel' : 'Invite';
    }
    

</script>

<!-- @component Friends modal to send/eliminate friend requests and show/eliminate saved friends -->
<div class="modal-form card p-4 w-[450px] h-[650px] shadow-xl space-y-4 text-left">
    <!--Top row, title and cross button-->
    <div class="flex justify-between">
        <div class="content-center text-[22px]">Friends</div>
        <button class="block btn-icon-sm rounded-md font-bold variant-filled text-[18px]" on:click={parent.onClose}>X</button>
    </div>
    <!--Search box and Add button-->
    <div class="flex gap-[15px] justify-between">
        <input class="input" type="text" placeholder="Type username here" bind:value={usernameSearch}/>
        <button class="btn variant-filled" on:click={fetchSendFriendshipRequest}>
            <svg class="w-6 h-6 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8m18 0-8.029-4.46a2 2 0 0 0-1.942 0L3 8m18 0-9 6.5L3 8"/>
            </svg>
          </button>
    </div>
    <!--Title and vertical scroll for saved friends-->
    <div class="max-h-[490px] overflow-y-auto p-2">
        {#each savedFriends as friend, index (friend.key)}
            <div animate:flip class="flex mb-2 gap-3">
                <div class="content-center"><AvatarDisplay icon={friend.icon} width={35}/></div>
                <div class="content-center text-[22px]">{friend.username}</div>
                {#if sentInvitations.find(invite => invite.username === friend.username)}
                    <button class="btn rounded-md font-bold variant-filled  w-20 h-10 ml-auto mr-[2vmin]" on:click={onCancel}>
                        {cancel}
                    </button>
                {:else}
                    <button class="btn rounded-md font-bold variant-filled  w-20 h-10 ml-auto mr-[2vmin]" on:click={onInvite}>
                        {invite}
                    </button>
                {/if}
            </div>
        {/each}
    </div>
</div>