<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { getModalStore } from "@skeletonlabs/skeleton";

    // Props
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    

</script>

{#if $modalStore[0]}
    
    <div class="modal-form card p-4 shadow-xl">
        <h1 class="text-center text-[5vmin] font-bold p-5">MATCHMAKING</h1>
        
        <!-- Loader -->
        <div class="flex justify-center items-center mt-[7%]">
            <div class="loader"></div>
        </div>

        <!-- Cancel button -->
        <div class="mt-[14%]">
            <button class="block btn {parent.buttonPositive} w-full text-lg" on:click={parent.onClose}>Cancel</button>
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