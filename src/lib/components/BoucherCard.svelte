<script lang="ts">
    import { boucherDirectory, errorBoucher } from "$lib/cardDirectory";
    import type { Boucher } from "$lib/interfaces";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import { onDestroy, onMount } from "svelte";
    import { cardAnimation } from "$lib/components/animator";

    export let boucherId: number;
    export let width: string = "w-full";
    export let ratio: number = 0.714285;
    export let animateCard: boolean = false;

    let boucher: Boucher;
    // Necesary for avoiding animation errors
    let salt:number = Math.floor(Math.random() * (100000));
    // Animation variables
    let stopAnimation: () => void;
    let boucherImage: HTMLImageElement;

    if (boucherId < 0 || boucherId >= boucherDirectory.length) {
        boucher = errorBoucher;
    } else {
        boucher = boucherDirectory[boucherId];
    }

    const popupHover: PopupSettings = {
        event: "hover",
        target: boucher.name+salt,
        placement: "bottom",
    };

    onMount(() => {
        if(animateCard){
            stopAnimation = cardAnimation({elem1:boucherImage});
        }
	});

    onDestroy(() => {
		if (animateCard && stopAnimation) {
			stopAnimation();
		}
	});

</script>

<div class="{width} min-w-[70px] relative">

    <div class="card p-4 variant-filled-surface w-[200%] border-2 " data-popup={boucher.name+salt}>
        <p>{boucher.name}: {boucher.tooltip}</p>
    </div>

    <img
        bind:this={boucherImage}
        src={boucher.image}
        alt={boucher.name}
        class="{width} min-w-[70px] rounded-[5.46875%] shadow-[5px_15px_10px_rgba(0,0,0,0.5)]"
        style="aspect-ratio: {ratio}; transform-style: preserve-3d;"
        use:popup={popupHover}
    />
</div>