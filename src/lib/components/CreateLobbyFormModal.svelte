<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { SlideToggle } from '@skeletonlabs/skeleton';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { apiBase, createLobbyPath, joinLobbyPath } from '$lib/paths';
    import { get } from 'svelte/store';
    import { userDataStore, lobbyStore } from '$lib/stores';
    import { createLobbyFetch } from "$lib/fetch/lobbyFetch";
    

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    let isPublic = false;
    let isLoading = false;    
    let publicValue = true;

/**
 * Function to switch the public value
 */
function onSwitchPublic(){
    publicValue = !publicValue;
    console.log(publicValue);
}


    /**
     * Function to create a lobby
     * @async
     */
    async function onCreateLobby() {
        isLoading = true;
        const result = await createLobbyFetch(isPublic);
        isLoading = false;
        
        if (result) {
            parent.onClose();
            goto(base + "/lobby");
        } else {
            // Manejar el error
            console.error("No se pudo crear el lobby");
        }
    }

    


</script>

<!-- @component This creates a form with built-in function to create a lobby. -->

{#if $modalStore[0]}
    <div class="modal-form card p-4 w-400 shadow-xl space-y-4">
        <h1 style="text-align: center; font-size:150%">Create game lobby</h1>
        <p style="font-size:108%">Lorem ipsum dolor sit amet, consectetur adipiscing elit, <br>sed do
            eiusmod tempor incididunt ut</p>

        <div class="form-control">
            <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={isPublic} />
                <p>Public lobby</p>
            </label>
            <p class="text-sm opacity-70">
                Public lobbies will appear in the public list so other players can join directly.
            </p>
        </div>
        
        <!--Button section-->
        <div class="flex gap-6 justify-stretch">
			<button style="font-size:112%"class="block btn {parent.buttonNeutral} w-full" on:click={parent.onClose}>Vs AI</button>
			<button style="font-size:112%" class="block btn {parent.buttonPositive} w-full" on:click={parent.onClose}>Cancel</button>
        </div>
        <button style="font-size:112%" class="block btn {parent.buttonNeutral} w-full" type="button" on:click={onCreateLobby} disabled={isLoading}>
            {#if isLoading}
                Creating...
            {:else}
                Create Lobby
            {/if}
        </button>
    </div>
    
{/if}
