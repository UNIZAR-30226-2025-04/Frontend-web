<script lang="ts">
    import { errorJoker, jokerDirectory, jokerEditionsDirectory } from "$lib/cardDirectory";
    import type { Joker, JokerEdition } from "$lib/interfaces";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import { onDestroy, onMount } from "svelte";
    import { cardAnimation } from "$lib/components/animator";

    export let jokerId: number;
    export let editionId:number;
    export let width: string = "w-full";
    export let ratio: number = 0.714285;
    export let animateCard: boolean = false;

    let joker: Joker;
    let edition: JokerEdition;
    // Necesary for avoiding animation errors
    let salt:number = Math.floor(Math.random() * (100000));
    // Animation variables
    let stopAnimation: () => void;
    let jokerImage: HTMLImageElement;
    let editionImage:HTMLImageElement;


    if (jokerId < 0 || jokerId >= jokerDirectory.length) {
        joker = errorJoker;
    } else {
        joker = jokerDirectory[jokerId];
    }

    if (editionId < 0 || editionId >= jokerEditionsDirectory.length) {
        edition = jokerEditionsDirectory[0];
        editionId = 0;
    } else {
        edition = jokerEditionsDirectory[editionId];
    }

    const popupHover1: PopupSettings = {
        event: "hover",
        target: joker.name+salt,
        placement: "bottom",
    };

    const popupHover2: PopupSettings = {
        event: "hover",
        target: joker.name+edition.name+salt,
        placement: "bottom",
    };

	onMount(() => {
        if(animateCard){
            stopAnimation = cardAnimation({elem1:jokerImage,elem2:editionImage});
        }
	});

    onDestroy(() => {
		if (animateCard && stopAnimation) {
			stopAnimation();
		}
	});


</script>



<div class="{width} min-w-[70px] relative z-[1]">

    <div class="card p-4 variant-filled-surface w-[200%] border-2" data-popup={joker.name+salt}>
        <p>{joker.name}: {joker.tooltip}</p>
    </div>
    
    <div class="card p-4 variant-filled-surface w-[200%] border-2" data-popup={joker.name+edition.name+salt}>
        <p>{joker.name}: {joker.tooltip}. {edition.name}: {edition.tooltip}</p>
    </div>

    {#if editionId > 0}
		<img
            bind:this={editionImage}
			src={edition.image}
			alt={edition.name}
			class="absolute w-full h-full object-fill top-0 z-[4] rounded-[5.46875%] opacity-50"
            style="transform-style: preserve-3d;"
			use:popup={popupHover2}
		/>
	{/if}
    
    <img
		bind:this={jokerImage}
		src={joker.image}
		alt={joker.name}
		class="w-full h-full object-fill rounded-[5.46875%] z-[2] shadow-[5px_15px_10px_rgba(0,0,0,0.5)]"
		style="aspect-ratio: {ratio}; transform-style: preserve-3d;"
		use:popup={popupHover1}
	/>
</div>