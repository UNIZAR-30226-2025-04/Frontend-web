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
    async function onCreateLobby(){
        if(await createLobbyFetch()){
            goto(base+"/lobby");
        }
        modalStore.close();
    }

    


</script>

<!-- @component This creates a form with built-in function to create a lobby. -->

{#if $modalStore[0]}
    <div class="modal-form card p-4 w-400 shadow-xl space-y-4">
        <h1 style="text-align: center; font-size:150%">Create game lobby</h1>
        <p style="font-size:108%">Lorem ipsum dolor sit amet, consectetur adipiscing elit, <br>sed do
            eiusmod tempor incididunt ut</p>

        <div class='publicLobby' style="display: flex; align-items: center; gap: 3%;">
            <p style="font-size:120%">Public lobby</p>
            <SlideToggle name="slider-large" bind:value={publicValue} on:click={onSwitchPublic} active="bg-primary-500 block h-[32px]" checked/>
        </div>
        
        <!--Button section-->
        <div class="flex gap-6 justify-stretch">
			<button style="font-size:112%"class="block btn {parent.buttonNeutral} w-full" on:click={parent.onClose}>Vs AI</button>
			<button style="font-size:112%" class="block btn {parent.buttonPositive} w-full" on:click={parent.onClose}>Cancel</button>
        </div>
        <button style="font-size:112%" class="block btn {parent.buttonNeutral} w-full" type="button" on:click={onCreateLobby}>Create</button>
    </div>
    
{/if}
