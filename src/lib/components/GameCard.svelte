<script lang="ts">
	import {
		overlayDirectory,
		suitColorDirectory,
		suitDirectory,
	} from "$lib/cardDirectory";
	import type { Card, Overlay, Suit } from "$lib/interfaces";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";

	export let card: Card;
	export let width: string = "w-full";
	export let ratio: number = 0.714285;
	let suitColor: string;
	let suitImage: string;
	let altSuit: string;
	let overlay: Overlay;
	// Necesary for avoiding animation errors
    let salt:number = Math.floor(Math.random() * (100000));

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

	const popupHover: PopupSettings = {
		event: 'hover',
		target: overlay.name+salt,
		placement: 'top'
	};
</script>

<div
	class="{width} min-w-[70px] bg-white rounded-[5.46875%] relative z-[1]"
	style="aspect-ratio: {ratio};"
>
	{#if card.faceUp}
		<div class="card p-4 variant-filled-tertiary w-[200%]" data-popup={overlay.name+salt}>
			<p>{overlay.name}: {overlay.tooltip}</p>
			<div class="arrow variant-filled-tertiary" />
		</div>

		{#if card.overlay > 0}
			<img
				src={overlay.image}
				alt={overlay.name}
				class="absolute w-full h-full object-fill top-0 z-[3] rounded-[5.46875%] opacity-50"
				use:popup={popupHover}
			/>
		{/if}

		<div class="w-full h-full grid grid-cols-[15%_70%_15%] place-items-center">
			<div class="mt-[30%] h-full w-full">
				<div class="font-bold {suitColor} text-[150%]">
					{card.rank}
				</div>
			</div>

			<img src={suitImage} alt={altSuit} class="w-full"/>

			<div class="pt-[30%] h-full w-full transform rotate-180">
				<div class="font-bold {suitColor} text-[150%]">
					{card.rank}
				</div>
			</div>
		</div>
	{:else}
		<img
			src="cards/Blue_Deck.png"
			alt="Face down card"
			class="w-full h-full object-fill rounded-[5.46875%]"
			style="aspect-ratio: {ratio};"
		/>
	{/if}
</div>
