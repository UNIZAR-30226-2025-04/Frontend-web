<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { userDataStore } from '$lib/stores';
    import  AvatarDisplay  from "./AvatarDisplay.svelte";
    import { avatarDirectory } from "$lib/avatarsDirectory";
	import { flip } from 'svelte/animate';
    import { get } from 'svelte/store';
    import type { userItem } from "$lib/interfaces";
    import { fetchDeleteFriend, fetchDeleteSentFriendRequest, fetchFriends, fetchSendFriendshipRequest, fetchSentRequests } from "$lib/fetch/friendsFetch";
    import { fetchUserInfo } from "$lib/fetch/usersFetch";

    // Style classes for the error message and the containers that hold it
    const errorContainer = 'alert variant-ghost-error p-2';
    const errorMessage = 'alert-message text-left'

    let sendRequestError = false;

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    

    // Value of the username search bar
    let usernameSearch: string;
    // Array of saved users, only icon and username
    let savedFriends: userItem[] = [];
    // Array of pending user requests, only icon and username
    let pendingRequests: userItem[] = [];
    // Text of the Add button, used to change it to "..." while it process
    let AddText: string = "Add";
    

    // Loads both the friends list and the pending friend requests in parallel
    async function loadData() {
        await Promise.all([
            fetchFriends(savedFriends),
            fetchSentRequests(pendingRequests)
        ]);
        savedFriends = savedFriends;
        pendingRequests = pendingRequests;
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
        
        if(await fetchDeleteFriend(auxUsername)){
            savedFriends = savedFriends.filter(request => request.key !== key);
        }else{
            savedFriends[index].username = auxUsername;
        }
        savedFriends = savedFriends;
    }

    

    /**
     * Removes from the pending list the index
     * @param index
     * @param key
     * @async
     */
     async function removeRequest(index: number, key: number) {
        let auxUsername:string = pendingRequests[index].username;
        pendingRequests[index].username = "Removing..."
        pendingRequests=pendingRequests;
        
        if(await fetchDeleteSentFriendRequest(auxUsername)){
            pendingRequests = pendingRequests.filter(request => request.key !== key);
        }else{
            pendingRequests[index].username = auxUsername;
        }
        pendingRequests = pendingRequests;
    }

    /**
     * Adds the username on the search bar to the pendingRequests list
     * @async
     */
    async function clickOnAdd() {
        AddText = "...";
        
        if(await fetchSendFriendshipRequest(usernameSearch)){
            let response: any;
            response = await fetchUserInfo(usernameSearch);
            if(response !== null && usernameSearch === response.username){
                let newRequest: userItem = {key:pendingRequests.length, username:usernameSearch, icon:response.icon };
                pendingRequests.push(newRequest);
            }
        }
        
        AddText = "Add";
        pendingRequests = pendingRequests;
    }

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
        <button class="btn variant-filled" on:click={clickOnAdd}>{AddText}</button>
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
            <div class="flex mb-2 gap-3">
                <!--on:click funtions need to be anonimus so a landa function is necesary-->
                <button class="btn-icon-sm rounded-md font-bold variant-filled text-[15px]" on:click={() => {removeFriend(index, friend.key)}}>X</button>
                <div class="content-center"><AvatarDisplay icon={friend.icon} width={35}/></div>
                <div class="content-center text-[22px]">{friend.username}</div>
            </div>
        {/each}
    </div>
    <!--Title and vertical scroll for pending friend requests-->
    <div class="content-center text-[18px]">Pending friend requests</div>
    <div class="h-52 overflow-y-auto p-2">
        {#each pendingRequests as req, index (req.key)}
            <div class="flex mb-2 gap-3">
                <!--on:click funtions need to be anonimus so a landa function is necesary-->
                <button class="btn-icon-sm rounded-md font-bold variant-filled text-[15px]" on:click={() => {removeRequest(index, req.key)}}>X</button>
                <div class="content-center"><AvatarDisplay icon={req.icon} width={35}/></div>
                <div class="content-center text-[22px]">{req.username}</div>
            </div>
        {/each}
    </div>
</div>