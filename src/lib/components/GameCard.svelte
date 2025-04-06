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

	export let card: Card;
	export let width: string = "w-full";
	export let ratio: number = 0.714285;
	export let animateCard: boolean = false;

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

	// If suits exist we extract the color and image
	let s: Suit | undefined = suitDirectory.find(
		(s: Suit) => s.name === card.suit,
	);
	if (s !== undefined) {
		suitColor = suitColorDirectory[s.color];
		suitImage = s.image;
		altSuit = card.rank + s.name;
	} else {
		suitColor = suitColorDirectory[0];
		suitImage = "icons/missing.png";
		altSuit = "Default image";
	}

	if (card.overlay < 0 || card.overlay >= overlayDirectory.length) {
		overlay = overlayDirectory[0];
	} else {
		overlay = overlayDirectory[card.overlay];
	}

	let popupHover: PopupSettings = {
		event: "hover",
		target: "",
		placement: "top",
	};

	if (card.overlay > 0) {
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

	function onClick() {
		console.log(card);
	}
</script>

<div class="{width} min-w-[70px] relative z-[1]" style="aspect-ratio: {ratio};">
	{#if card.faceUp}
		<div
			class="card p-4 variant-filled-surface border-2 w-[200%]"
			data-popup={overlay.name + salt}
		>
			<p>{overlay.name}: {overlay.tooltip}</p>
		</div>

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

		<div
			bind:this={cardImage}
			class="w-full h-full bg-white rounded-[5.46875%]
			grid grid-cols-[15%_70%_15%] items-center
			shadow-[5px_15px_10px_rgba(0,0,0,0.5)]"
		>
			<div class="mt-[30%] h-full w-full">
				<div class="font-bold {suitColor} text-[150%]">
					{card.rank}
				</div>
			</div>

			<img src={suitImage} alt={altSuit} class="w-full" />

			<div class="pt-[30%] h-full w-full transform rotate-180">
				<div class="font-bold {suitColor} text-[150%]">
					{card.rank}
				</div>
			</div>
		</div>
	{:else}
		<img
			bind:this={cardImage}
			src="cards/Blue_Deck.png"
			alt="Face down card"
			class="w-full h-full object-fill rounded-[5.46875%] shadow-[5px_15px_10px_rgba(0,0,0,0.5)]"
			style="aspect-ratio: {ratio}; transform-style: preserve-3d;"
		/>
	{/if}
</div>
