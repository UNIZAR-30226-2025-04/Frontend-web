<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    function onExit(){
        goto(base+"/home");
        modalStore.close();
    }

</script>


{#if $modalStore[0]}
    <div class="modal-form card p-4 w-400 shadow-xl space-y-4">
        <!--Title-->
        <h1 style="text-align: center; font-size:150%">Exit game?</h1>
        
        <!--Button section-->
        <div class="flex gap-6 justify-stretch">
			<button style="font-size:112%"class="block btn {parent.buttonNeutral} w-full" on:click={onExit}>Yes</button>
			<button style="font-size:112%" class="block btn {parent.buttonPositive} w-full" on:click={parent.onClose}>No</button>
        </div>
    </div>
    
{/if}
