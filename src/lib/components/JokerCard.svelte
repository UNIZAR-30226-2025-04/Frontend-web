<script lang="ts">
    import {
        errorJoker,
        jokerDirectory,
        jokerEditionsDirectory,
    } from "$lib/cardDirectory";
    import type { Joker, JokerEdition } from "$lib/interfaces";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import { onDestroy, onMount } from "svelte";
    import { cardAnimation } from "$lib/components/animator";

    export let jokerId: number; // Main data to show
    export let editionId: number; // Edition of the joker
    export let width: string = "w-full"; // Width of the card
    export let ratio: number = 0.714285; // Ratio of the card
    export let animateCard: boolean = false; // If the card is animated
    export let sellAmount: number = 0; // If the card is sellable it shows this amount when hovered
    export let sellable: boolean = false; // If true show the sell ammount when hovered

    let joker: Joker;
    let edition: JokerEdition;
    // Necesary for avoiding animation errors
    let salt: number = Math.floor(Math.random() * 100000);
    // Animation variables
    let stopAnimation: () => void;
    let jokerImage: HTMLImageElement;
    let overlayImage: HTMLImageElement;

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

    const popupHover: PopupSettings = {
        event: "hover",
        target: joker.name + salt,
        placement: "bottom",
    };

    onMount(() => {
        if (animateCard) {
            stopAnimation = cardAnimation({
                elements: [jokerImage, overlayImage],
            });
        }
    });

    onDestroy(() => {
        if (animateCard && stopAnimation) {
            stopAnimation();
        }
    });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="{width} min-w-[70px] relative z-[1]">
    <!--Tooltip-->
    <div class="w-[200%]" data-popup={joker.name + salt}>
        <!--Sell text-->
        {#if sellable}
            <div class="w-full grid grid-cols-[65%_33%] gap-[2%]">
                <div class="card p-4 variant-filled-surface border-2">
                    {#if editionId > 0}
                        <p>{joker.name}: {joker.tooltip}.</p>
                        <p>{edition.name}: {edition.tooltip}</p>
                    {:else}
                        {joker.name}: {joker.tooltip}
                    {/if}
                </div>
                <div class="card border-2 border-warning-500 p-3 text-[2.5vh] leading-none text-warning-500 content-center">
                    <p>Sell</p>
                    <p>{sellAmount}$</p>
                </div>
            </div>
        {:else}
            <div class="w-full card p-4 variant-filled-surface border-2">
                {#if editionId > 0}
                    <p>
                        {joker.name}: {joker.tooltip}. {edition.name}: {edition.tooltip}
                    </p>
                {:else}
                    <p>{joker.name}: {joker.tooltip}</p>
                {/if}
            </div>
        {/if}
    </div>

    <!--Edition image-->
    {#if editionId > 0}
        <img
            bind:this={overlayImage}
            src={edition.image}
            alt={edition.name}
            class="absolute w-full h-full object-fill top-0 z-[4] rounded-[5.46875%] opacity-50"
            style="transform-style: preserve-3d;"
            use:popup={popupHover}
        />
    {/if}

    <!--Joker image-->
    <img
        bind:this={jokerImage}
        src={joker.image}
        alt={joker.name}
        class="w-full h-full object-fill rounded-[5.46875%] z-[2] shadow-[5px_15px_10px_rgba(0,0,0,0.5)]"
        style="aspect-ratio: {ratio}; transform-style: preserve-3d;"
        use:popup={popupHover}
    />
</div>
