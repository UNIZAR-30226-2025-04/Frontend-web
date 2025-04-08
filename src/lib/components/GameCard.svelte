<script lang="ts">
	import {
		overlayDirectory,
		suitColorDirectory,
		suitDirectory,
	} from "$lib/cardDirectory";
	import type { Card, Overlay, Suit } from "$lib/interfaces";
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
	import { onDestroy, onMount } from "svelte";
	import { cardAnimation } from "$lib/components/animator";

	export let card: Card; // Main data to show
	export let width: string = "w-full"; // Width of the card
	export let ratio: number = 0.714285; // Ratio of the card
	export let animateCard: boolean = false; // If the card is animated

	let suitColor: string;
	let suitImage: string;
	let altSuit: string;
	let overlay: Overlay;
	// Necesary for avoiding animation errors
	let salt: number = Math.floor(Math.random() * 100000);
	// Animation variables
	let stopAnimation: () => void;
	let cardImage: HTMLElement;
	let overlayImage: HTMLElement;
	// Pop up config, initialized to not show
	let popupHover: PopupSettings = {
		event: "hover",
		target: "",
		placement: "top",
	};

	// If suits exist we extract the color and image
	let s: Suit | undefined = suitDirectory.find((s: Suit) => s.name === card.suit);
	if (s !== undefined) {
		suitColor = suitColorDirectory[s.color];
		suitImage = s.image;
		altSuit = card.rank + s.name;
	} else {
		suitColor = suitColorDirectory[0];
		suitImage = "icons/missing.png";
		altSuit = "Default image";
	}

	// If overlay is valid we extract the data and enable the pop up
	if (card.overlay < 0 || card.overlay >= overlayDirectory.length) {
		overlay = overlayDirectory[0];
	} else {
		overlay = overlayDirectory[card.overlay];
		popupHover = {
			event: "hover",
			target: overlay.name + salt,
			placement: "top",
		};
	}


	onMount(() => {
		if (animateCard) {
			stopAnimation = cardAnimation({
				elem1: cardImage,
				elem2: overlayImage,
			});
		}
	});

	onDestroy(() => {
		if (animateCard && stopAnimation) {
			stopAnimation();
		}
	});

</script>

<div class="{width} min-w-[70px] relative z-[1]" style="aspect-ratio: {ratio};">
	{#if card.faceUp}
		<!--Pop up-->
		<div
			class="card p-4 variant-filled-surface border-2 w-[200%]"
			data-popup={overlay.name + salt}
		>
			<p>{overlay.name}: {overlay.tooltip}</p>
		</div>

		<!--Overlay Image-->
		{#if card.overlay > 0}
			<img
				bind:this={overlayImage}
				src={overlay.image}
				alt={overlay.name}
				class="absolute w-full h-full object-fill top-0 z-[3] rounded-[5.46875%] opacity-50"
				style="transform-style: preserve-3d;"
				use:popup={popupHover}
			/>
		{/if}

		<!--Actual card-->
		<div
			bind:this={cardImage}
			class="w-full h-full bg-white rounded-[5.46875%]
			grid grid-cols-[15%_70%_15%] items-center
			shadow-[5px_15px_10px_rgba(0,0,0,0.5)]"
		>
			<!--Top left text-->
			<div class="mt-[30%] h-full w-full">
				<div class="font-bold {suitColor} text-[150%]">
					{card.rank}
				</div>
			</div>

			<!--Suit image-->
			<img src={suitImage} alt={altSuit} class="w-full" />

			<!--Bottom right text-->
			<div class="pt-[30%] h-full w-full transform rotate-180">
				<div class="font-bold {suitColor} text-[150%]">
					{card.rank}
				</div>
			</div>
		</div>
	{:else}
		<!--If the card is face down we only show the backside-->
		<img
			bind:this={cardImage}
			src="cards/Blue_Deck.png"
			alt="Face down card"
			class="w-full h-full object-fill rounded-[5.46875%] shadow-[5px_15px_10px_rgba(0,0,0,0.5)]"
			style="aspect-ratio: {ratio}; transform-style: preserve-3d;"
		/>
	{/if}
</div>
