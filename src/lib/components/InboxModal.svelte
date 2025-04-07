<script lang="ts">
    import { onMount, type SvelteComponent } from "svelte";
    import { lobbyStore, userDataStore } from '$lib/stores';
    import  AvatarDisplay  from "./AvatarDisplay.svelte";
    import { avatarDirectory } from "$lib/avatarsDirectory";
	import { flip } from 'svelte/animate';
    import { get } from 'svelte/store';
    import type { invitation, request } from '$lib/interfaces'
    import { fetchDeleteFriendRequest, fetchAcceptFriendshipRequest, fetchReceivedFriendshipRequests, fetchReceivedGameInvitations, fetchDeleteGameInvitation } from "$lib/fetch/inboxFetch";
    import { joinLobbyFetch } from "$lib/fetch/lobbyFetch";
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    // Array of invitations, name and players in the lobby
    let invitations: invitation[] = [];
    // Array of pending friend requests, name
    let pendingRequests: request[] = [];


    // Fetches the list of friend requests from the server using a GET request
    

    // Loads both the lobby invitations and the pending friend requests in parallel
    async function loadData() {
        await Promise.all([
            fetchReceivedGameInvitations(invitations),
            fetchReceivedFriendshipRequests(pendingRequests)
        ]);
        pendingRequests = pendingRequests;
        invitations = invitations;
    }

    loadData();

    /**
     * Removes from the invitations list the index that has the key
     * @param index
     * @param key
     * @async
     */
    async function removeInvitation(index:number, key:number){
        let auxUsername:string = invitations[index].username;
        invitations[index].username = "Removing..."
        invitations=invitations;
        if(await fetchDeleteGameInvitation(invitations[index].code,auxUsername)){
            invitations = invitations.filter(request => request.key !== key);
        }else{
            invitations[index].username = auxUsername;
        }
        invitations = invitations;
    }

    /**
     * Accepts the invitation on the list with the index and key. If success auto joins the lobby
     * and removes the invitation from the inbox
     * @param index
     * @param key
     */
    async function acceptInvitation(index:number, key:number) {
        const lobbyCode = invitations[index].code;
        const senderUsername = invitations[index].username;
        
        // First join the lobby
        if (await joinLobbyFetch(lobbyCode)) {
            // After successful join, delete the invitation
            await fetchDeleteGameInvitation(lobbyCode, senderUsername);
            
            // Navigate to lobby and close the modal
            goto(base+"/lobby");
            parent.onClose();
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
        if(await fetchDeleteFriendRequest(auxUsername)){
            pendingRequests = pendingRequests.filter(request => request.key !== key);
        }else{
            pendingRequests[index].username = auxUsername;
        }
        pendingRequests = pendingRequests;
    }

    

    /**
     * Accepts from the pending list the index
     * @param index
     * @param key
     * @async
     */
     async function acceptRequest(index:number, key:number){
        let auxUsername:string = pendingRequests[index].username;

        if(await fetchAcceptFriendshipRequest(auxUsername)){
            pendingRequests[index].username = "Now you are firends!"
            pendingRequests=pendingRequests;
            fetchDeleteFriendRequest(auxUsername);
            pendingRequests = pendingRequests.filter(request => request.key !== key);
        }

        pendingRequests = pendingRequests;
    }

</script>

<!-- @component Inobx  modal to accept/eliminate friend requests and accept/eliminate game invites -->
<div class="modal-form card p-4 w-[450px] shadow-xl space-y-4 text-left">
    <!--Top row, title and cross button-->
    <div class="flex justify-between">
        <div class="content-center text-[22px]">Inbox</div>
        <button class="block btn-icon-sm rounded-md font-bold variant-filled text-[18px]" on:click={parent.onClose}>X</button>
    </div>
    <!--Title and vertical scroll for saved friends-->
    <div class="content-center text-[18px]">Most recent game invitations</div>
    <div class="h-52 overflow-y-auto p-2">
        {#each invitations as inv, index (inv.key)}
            <div animate:flip class="flex mb-2 justify-between">
                <!--on:click funtions need to be anonimus so a landa function is necesary-->
                <div class="flex gap-3">
                    <button class="btn-icon-sm rounded-md font-bold variant-filled text-[15px]" on:click={() => {removeInvitation(index, inv.key)}}>X</button>
                    <div class="content-center text-[22px]">{inv.username}</div>
                </div>
                {#if inv.players<8}
                    <button class="btn variant-filled text-[16px] pt-1 pb-1 mr-[10px]" on:click={() => {acceptInvitation(index, inv.key)}}>JOIN {inv.players}/8</button>
                {:else}
                    <button class="btn bg-error-500 text-[16px] pt-1 pb-1 mr-[10px]">JOIN {inv.players}/8</button>
                {/if}
            </div>
        {/each}
    </div>
    <!--Title and vertical scroll for pending friend requests-->
    <div class="content-center text-[18px]">Most recent friend requests</div>
    <div class="h-52 overflow-y-auto p-2">
        {#each pendingRequests as request, index (request.key)}
            <div animate:flip class="flex mb-2 justify-between">
                <!--on:click funtions need to be anonimus so a landa function is necesary-->
                <div class="flex gap-3">
                    <button class="btn-icon-sm rounded-md font-bold variant-filled text-[15px]" on:click={() => {removeRequest(index, request.key)}}>X</button>
                    <div class="content-center text-[22px]">{request.username}</div>
                </div>
                <button class="btn variant-filled text-[16px] pt-1 pb-1 mr-[10px]" on:click={() => {acceptRequest(index, request.key)}}>Accept</button>
            </div>
        {/each}
    </div>
</div>