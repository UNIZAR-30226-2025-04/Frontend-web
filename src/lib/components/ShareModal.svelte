<script lang="ts">
    import { onMount, type SvelteComponent } from "svelte";
    import AvatarDisplay from "./AvatarDisplay.svelte";
    import { flip } from 'svelte/animate';
    import type { inviteItem, userItem } from '$lib/interfaces'
    import { fetchDeleteSentInvitation, fetchLobbyInfo, fetchSendInvitation, fetchSentInvitations } from "$lib/fetch/lobbyFetch";
    import { fetchFriends } from "$lib/fetch/friendsFetch";
    import { get } from "svelte/store";
    import { lobbyStore } from "$lib/stores";
    import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    const toastStore = getToastStore();

    const errorShareToast:ToastSettings = {
        message: 'Could not send invitation',
        background: 'variant-filled-error',
        timeout: 3500,
        classes: 'gap-[0px]'
    };

    const errorUnShareToast:ToastSettings = {
        message: 'Could not unsend invitation',
        background: 'variant-filled-error',
        timeout: 3500,
        classes: 'gap-[0px]'
    };

    // Array of invitations, names and players in the lobby
    let invitations: inviteItem[] = [];
    let isLoading = true;
    let errorMsg = "";
    let lobbyPlayers: string[] = [];

    // Loads both sent invitations and friends and combines them into a single list
    async function loadData() {
        try {
            isLoading = true;
            errorMsg = "";
            invitations = []; // Reset invitations array
            
            // Get current lobby ID
            const lobbyId = get(lobbyStore).code;
            console.log("Loading data for lobby:", lobbyId);
            
            if (!lobbyId) {
                console.error("Lobby ID not found");
                errorMsg = "Could not find lobby ID";
                return;
            }
            
            // Get lobby information including the list of players
            const lobbyInfo = await fetchLobbyInfo(lobbyId);
            console.log("Lobby information:", lobbyInfo);
            
            if (!lobbyInfo) {
                console.error("Could not get lobby information");
                errorMsg = "Could not get lobby information";
                return;
            }
            
            // Save the list of players already in the lobby
            lobbyPlayers = lobbyInfo.players || [];
            console.log("Players currently in the lobby:", lobbyPlayers);
            
            // Get already sent invitations (in a separate array)
            let sentInvs: inviteItem[] = [];
            let friends: userItem[] = [];
            
            // Get invitations and friends using Promise.all
            await fetchSentInvitations(sentInvs);
            await fetchFriends(friends);
            
            console.log("Sent invitations (unfiltered):", sentInvs);
            console.log("Friends list (unfiltered):", friends);
            
            if (friends.length === 0) {
                console.warn("No friends found");
                return;
            }
            
            // IMPORTANT: Filter sent invitations to remove users already in the lobby
            const filteredSentInvs = sentInvs.filter(inv => 
                !lobbyPlayers.some(player => player.toLowerCase() === inv.username.toLowerCase())
            );
            console.log("Filtered invitations (excluding users in lobby):", filteredSentInvs);
            
            // Add filtered invitations to the final array
            invitations = [...filteredSentInvs];
            
            // Filter friends who are already in the lobby
            const availableFriends = friends.filter(friend => 
                !lobbyPlayers.some(player => player.toLowerCase() === friend.username.toLowerCase())
            );
            console.log("Available friends (not in lobby):", availableFriends);
            
            // Filter friends who already have invitations sent
            const friendsToAdd = availableFriends.filter(friend => 
                !filteredSentInvs.some(inv => inv.username.toLowerCase() === friend.username.toLowerCase())
            );
            console.log("Friends that can be invited:", friendsToAdd);
            
            // Add these friends to the invitation list (with sent=false)
            friendsToAdd.forEach(friend => {
                invitations.push({
                    key: invitations.length,
                    username: friend.username,
                    icon: friend.icon,
                    sent: false
                });
            });
            
            console.log("Final invitation list:", invitations);
            
        } catch (error) {
            console.error("Error loading data:", error);
            errorMsg = "Error loading data";
        } finally {
            isLoading = false;
        }
    }

    // Load data when component mounts
    onMount(() => {
        loadData();
    });

    async function onClick(index: number) {
        let success: boolean = false;
        if (invitations[index].sent) {
            success = await fetchDeleteSentInvitation(invitations[index].username);
            if(!success){
                toastStore.trigger(errorUnShareToast);
            }
        } else {
            success = await fetchSendInvitation(invitations[index].username);
            if(!success){
                toastStore.trigger(errorShareToast);
            }
        }

        if (success) {
            invitations[index].sent = !invitations[index].sent;
            invitations = [...invitations]; // Force reactive update
        }
    }
</script>

<!-- @component Modal to invite friends to the lobby -->
<div class="modal-form card p-4 w-[450px] shadow-xl space-y-4 text-left">
    <!--Top row, title and cross button-->
    <div class="flex justify-between">
        <div class="content-center text-[22px]">Invite friends</div>
        <button class="block btn-icon-sm rounded-md font-bold variant-filled text-[18px]" on:click={parent.onClose}>X</button>
    </div>
    
    <div class="overflow-y-auto p-2 h-72">
        {#if isLoading}
            <div class="text-center p-4">Cargando...</div>
        {:else if errorMsg}
            <div class="text-center p-4 text-error-500">{errorMsg}</div>
        {:else if invitations.length === 0}
            <div class="text-center p-4 text-gray-500">No hay amigos disponibles para invitar</div>
        {:else}
            {#each invitations as inv, index (inv.key)}
                <div animate:flip class="flex mb-2 gap-3 justify-between content-center">
                    <div class="h-[38px] flex content-center gap-3">
                        <div class="content-center"><AvatarDisplay icon={inv.icon} width={35}/></div>
                        <div class="content-center text-[22px]">{inv.username}</div>
                    </div>
                    {#if inv.sent}
                        <button class="btn bg-error-500 text-[16px] pt-1 pb-1 mr-[10px]" on:click={() => {onClick(index);}}>SENT</button>
                    {:else}
                        <button class="btn variant-filled text-[16px] pt-1 pb-1 mr-[10px]" on:click={() => {onClick(index);}}>SEND</button>
                    {/if}
                </div>
            {/each}
        {/if}
    </div>
</div>