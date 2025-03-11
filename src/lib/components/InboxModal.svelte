<script lang="ts">
    import { onMount, type SvelteComponent } from "svelte";
    import { userDataStore } from '$lib/stores';
    import  AvatarDisplay  from "./AvatarDisplay.svelte";
    import { avatarDirectory } from "$lib/avatarsDirectory";
	import { flip } from 'svelte/animate';
    import { get } from 'svelte/store';
    import type { invitation, request } from '$lib/interfaces'
    import { getInbox, fetchDeleteFriendRequest, fetchAcceptFriendshipRequest } from "$lib/fetch/inboxFetch";

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    // Array of invitations, name and players in the lobby
    let invitations: invitation[] = [];
    // Array of pending friend requests, name
    let pendingRequests: request[] = [];

    let error= '';


    let token = get(userDataStore).token;


    // Fetches the list of friend requests from the server using a GET request
    

    // Loads both the lobby invitations and the pending friend requests in parallel
    async function loadData() {
        await getInbox(invitations,pendingRequests);
    }

    onMount(() => {
        loadData();
    })

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
        await sleep(2000);
        invitations = invitations.filter(request => request.key !== key);
        invitations = invitations;
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
        await fetchDeleteFriendRequest(pendingRequests[index].username);
        pendingRequests = pendingRequests.filter(request => request.key !== key);
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
        pendingRequests[index].username = "Now you are firends!"
        pendingRequests=pendingRequests;
        await fetchAcceptFriendshipRequest(pendingRequests[index].username);
        await fetchDeleteFriendRequest(pendingRequests[index].username);
        pendingRequests = pendingRequests.filter(request => request.key !== key);
        pendingRequests = pendingRequests;
    }

    



    /**
     * Dummy function to sleep ms while we wait or backend to have the API ready
     * @param ms
     */
     function sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Test data while we wait for endpoints
    invitations = [
        {username:"Victor",key:0,players:1},
        {username:"Emilliano",key:1,players:2},
        {username:"Jogue",key:2,players:3},
        {username:"Ruben",key:3,players:4},
        {username:"Jota",key:4,players:5},
        {username:"Josemi",key:5,players:6},
        {username:"Yago",key:6,players:7},
        {username:"Nicolas",key:7,players:8},
    ]

    //pendingRequests = [
    //    {username:"Solana",key:0},
    //    {username:"Diego",key:1},
    //    {username:"Elias",key:2},
    //    {username:"Zanos",key:3},
    //    {username:"Raul",key:4},
    //    {username:"Tristan",key:5},
    //]
    

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
                    <button class="btn variant-filled text-[16px] pt-1 pb-1 mr-[10px]">JOIN {inv.players}/8</button>
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