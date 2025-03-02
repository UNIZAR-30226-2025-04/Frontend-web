<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { userDataStore } from '$lib/stores';
    import  AvatarDisplay  from "./AvatarDisplay.svelte";
    import { avatarDirectory } from "$lib/avatarsDirectory";


    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

</script>

<!-- @component This creates a form with built-in function to change the user data in the bd and in the store. -->
<div class="modal-form card p-4 w-400 shadow-xl space-y-4">
    <p>Frien modal test</p>
</div>