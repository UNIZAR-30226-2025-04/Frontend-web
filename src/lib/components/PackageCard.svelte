<script lang="ts">
    import { errorPack, packageDirectory } from "$lib/cardDirectory";
    import { cardAnimation } from "$lib/components/animator";
    import type { Package } from "$lib/interfaces";
    import { onDestroy, onMount } from "svelte";
    import tilt from "svelte-tilt";

    export let packageId: number; // Main data to show
    export let width: string = "w-full"; // Width of the card
    export let ratio: number = 0.714285; // Ratio of the card
    export let animateCard: boolean = false; // If the card is animated

    let pack: Package;
    // If boucher exists we extract the data
    if (packageId < 0 || packageId >= packageDirectory.length) {
        pack = errorPack;
    } else {
        pack = packageDirectory[packageId];
    }


</script>

<div class="{width} min-w-[70px] relative">
    <!--Voucher image-->
    {#if animateCard}
        <img
            use:tilt={{ reverse: true }}
            src={pack.image}
            alt={pack.name}
            class="{width} min-w-[70px]"
            style="aspect-ratio: {ratio}; transform-style: preserve-3d;"
        />
    {:else}
        <img
            src={pack.image}
            alt={pack.name}
            class="{width} min-w-[70px]"
            style="aspect-ratio: {ratio}; transform-style: preserve-3d;"
        />
    {/if}
</div>