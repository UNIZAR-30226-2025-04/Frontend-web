<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { getModalStore, getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
    import { SlideToggle } from '@skeletonlabs/skeleton';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { createLobbyPath, joinLobbyPath } from '$lib/paths';
    import { get } from 'svelte/store';
    import { userDataStore, lobbyStore } from '$lib/stores';
    import { loadingStore } from '$lib/stores/loadingStore';
    import { createLobbyFetch } from "$lib/fetch/lobbyFetch";
    

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    const toastStore = getToastStore();

    const createError:ToastSettings = {
        message: 'Error creating lobby',
        background: 'variant-filled-error',
        timeout: 3500,
        classes: 'gap-[0px]'
    };

    let isPublic = false;
    let isLoading = false;    
    let publicValue = true;

    /**
     * Function to create a lobby, takes into account the isPublic variable
     * @async
     */
    async function onCreateLobby() {
        loadingStore.startLoading('Creating lobby...');
        const result = await createLobbyFetch(isPublic? 1:0);
        
        if (result) {
            parent.onClose();
            goto(base + "/lobby");
        } else {
            console.error("Error when creating lobby");
            loadingStore.stopLoading();
            toastStore.trigger(createError);
        }
    }

    /**
     * Creates a lobby againsts a bot
     * @async
     */
    async function onCreateBotLobby() {
        loadingStore.startLoading('Creating lobby...');
        const result = await createLobbyFetch(2);
        
        if (result) {
            parent.onClose();
            goto(base + "/lobby");
        } else {
            // Manejar el error
            console.error("Error when creating lobby");
            loadingStore.stopLoading();
            toastStore.trigger(createError);
        }
    }

    


</script>

<!-- @component This creates a form with built-in function to create a lobby. -->

{#if $modalStore[0]}
    <div class="modal-form card p-4 w-400 shadow-xl space-y-4">
        <h1 style="text-align: center; font-size:150%">Create game lobby</h1>

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
			<button style="font-size:112%"class="block btn {parent.buttonNeutral} w-full" on:click={onCreateBotLobby}>Vs AI</button>
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
