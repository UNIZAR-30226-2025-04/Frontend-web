<script lang="ts">
    import { apiBaseStore, wsBaseStore } from "$lib/paths";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import type { SvelteComponent } from "svelte";
    import { get } from "svelte/store";
    
    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    let domainText:string = get(apiBaseStore);

    function onExit(){
        modalStore.close();
    }

    function onChange(){
        apiBaseStore.set(domainText);
        wsBaseStore.set(domainText);
        modalStore.close();
    }

    function onPreset1(){
        domainText = "https://nogler.ddns.net/";
    }

</script>


<div class="modal-form card p-6 w-[15vw] shadow-xl space-y-4">
    <!--Title-->
    <h1 style="text-align: center; font-size:150%">Change domain to</h1>

    <input
        class="input"
        type="text"
        bind:value={domainText}
        placeholder="Backend url ..."
    />
    <button style="font-size:112%"class="block btn {parent.buttonNeutral} w-full" on:click={onPreset1}>nogler.ddns.net</button>
    
    <!--Button section-->
    <div class="flex gap-6 justify-stretch">
        <button style="font-size:112%"class="block btn {parent.buttonNeutral} w-full" on:click={onChange}>Change</button>
        <button style="font-size:112%" class="block btn {parent.buttonPositive} w-full" on:click={onExit}>Cancel</button>
    </div>
</div>
    
