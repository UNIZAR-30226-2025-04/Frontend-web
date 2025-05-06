<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { getModalStore, getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
    import { fetchMatchMaking } from "$lib/fetch/lobbyFetch";
    import { goto } from "$app/navigation";
    import { base } from '$app/paths';

    // Props
    export let parent: SvelteComponent;
    
    const modalStore = getModalStore();
    const toastStore = getToastStore();
    
    let isSearching = false;
    
    const errorToast: ToastSettings = {
        message: 'Could not find a match',
        background: 'variant-filled-error',
        timeout: 3500
    };
    
    // Start searching immediately when modal opens
    startMatchmaking();
    
    async function startMatchmaking() {
        isSearching = true;
        
        if (await fetchMatchMaking()) {
            // Success - will redirect automatically via joinLobbyFetch
            parent.onClose();
            goto(base + "/lobby");
        } else {
            // Show error and allow the user to try again
            isSearching = false;
            toastStore.trigger(errorToast);
        }
    }
</script>

{#if $modalStore[0]}
    <div class="modal-form card p-4 shadow-xl">
        <h1 class="text-center text-[5vmin] font-bold p-5">MATCHMAKING</h1>
        
        <!-- Loader -->
        <div class="flex justify-center items-center mt-[7%]">
            {#if isSearching}
                <div class="loader"></div>
            {:else}
                <div class="flex flex-col items-center">
                    <p class="mb-4">No match found. Try again?</p>
                    <button class="btn variant-filled-primary" on:click={startMatchmaking}>
                        Retry
                    </button>
                </div>
            {/if}
        </div>

        <!-- Cancel button -->
        <div class="mt-[14%]">
            <button class="block btn {parent.buttonPositive} w-full text-lg" on:click={parent.onClose}>
                Cancel
            </button>
        </div>
    </div>
{/if}

<style>
    .loader {
        color: #ffffff;
        width: 4px;
        aspect-ratio: 1;
        border-radius: 50%;
        box-shadow: 19px 0 0 7px, 38px 0 0 3px, 57px 0 0 0;
        transform: translateX(-38px);
        animation: l21 .5s infinite alternate linear;
    }

    @keyframes l21 {
        50%  {box-shadow: 19px 0 0 3px, 38px 0 0 7px, 57px 0 0 3px}
        100% {box-shadow: 19px 0 0 0  , 38px 0 0 3px, 57px 0 0 7px}
    }
</style>