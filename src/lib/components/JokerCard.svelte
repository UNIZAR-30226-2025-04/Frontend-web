<script lang="ts">
    import { errorJoker, jokerDirectory, jokerEditionsDirectory } from "$lib/cardDirectory";
    import type { Joker, JokerEdition } from "$lib/interfaces";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import { onDestroy, onMount } from "svelte";
    import { cardAnimation } from "$lib/components/animator";

    export let jokerId: number; // Main data to show
    export let editionId:number; // Edition of the joker
    export let width: string = "w-full"; // Width of the card
    export let ratio: number = 0.714285; // Ratio of the card
    export let animateCard: boolean = false; // If the card is animated

    let joker: Joker;
    let edition: JokerEdition;
    // Necesary for avoiding animation errors
    let salt:number = Math.floor(Math.random() * (100000));
    // Animation variables
    let stopAnimation: () => void;
    let jokerImage: HTMLImageElement;
    let editionImage:HTMLImageElement;

    // If joker exists we extract the data
    if (jokerId < 0 || jokerId >= jokerDirectory.length) {
        joker = errorJoker;
    } else {
        joker = jokerDirectory[jokerId];
    }

    // If edition exists we extract the data
    if (editionId < 0 || editionId >= jokerEditionsDirectory.length) {
        edition = jokerEditionsDirectory[0];
        editionId = 0;
    } else {
        edition = jokerEditionsDirectory[editionId];
    }

    // Pop up settings

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

    <!--Normal tooltip-->
    <div class="card p-4 variant-filled-surface w-[200%] border-2" data-popup={joker.name+salt}>
        <p>{joker.name}: {joker.tooltip}</p>
    </div>
    
    <!--With edition tooltip-->
    <div class="card p-4 variant-filled-surface w-[200%] border-2" data-popup={joker.name+edition.name+salt}>
        <p>{joker.name}: {joker.tooltip}. {edition.name}: {edition.tooltip}</p>
    </div>

    <!--Edition image-->
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
    
    <!--Joker image-->
    <img
		bind:this={jokerImage}
		src={joker.image}
		alt={joker.name}
		class="w-full h-full object-fill rounded-[5.46875%] z-[2] shadow-[5px_15px_10px_rgba(0,0,0,0.5)]"
		style="aspect-ratio: {ratio}; transform-style: preserve-3d;"
		use:popup={popupHover1}
	/>
</div>