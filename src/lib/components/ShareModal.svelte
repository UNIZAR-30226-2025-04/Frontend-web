<script lang="ts">
    import { onMount, type SvelteComponent } from "svelte";
    import  AvatarDisplay  from "./AvatarDisplay.svelte";
	import { flip } from 'svelte/animate';
    import type { inviteItem, userItem } from '$lib/interfaces'
    import { fetchSentInvitations } from "$lib/fetch/lobbyFetch";
    import { fetchFriends } from "$lib/fetch/friendsFetch";

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    // Array of invitations, name and players in the lobby
    let invitations: inviteItem[] = [];

    // Loads both the sent invitations and friends and merges both in one list
    async function loadData() {
        let friends:userItem[] = [];
        await Promise.all([
            fetchSentInvitations(invitations),
            fetchFriends(friends)
        ]);

        if(invitations.length > 0){
            // Filters off the friends that the user has already sent invitations to
            friends = friends.filter((friend:userItem) => 
                invitations.find((inv:inviteItem) => inv.username === friend.username) === undefined
            );
        }

        // Adds friends still to be sent invitation to
        friends.forEach((friend:userItem) => {
            invitations.push({key:invitations.length, username:friend.username, icon:friend.icon, sent:false})
        });

        invitations = invitations;
    }

    loadData();

    function onClick(index:number){
        invitations[index].sent = !invitations[index].sent;
    }

    

</script>

<!-- @component Inobx  modal to accept/eliminate friend requests and accept/eliminate game invites -->
<div class="modal-form card p-4 w-[450px] shadow-xl space-y-4 text-left">
    <!--Top row, title and cross button-->
    <div class="flex justify-between">
        <div class="content-center text-[22px]">Invite friends</div>
        <button class="block btn-icon-sm rounded-md font-bold variant-filled text-[18px]" on:click={parent.onClose}>X</button>
    </div>
    
        <div class="overflow-y-auto p-2 h-72">
            {#each invitations as inv, index (inv.key)}
                <div animate:flip class="flex mb-2 gap-3 justify-between content-center">
                    <!--on:click funtions need to be anonimus so a landa function is necesary-->
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
        </div>
    
</div>