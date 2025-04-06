<script lang="ts">
	import {
		boucherDirectory,
		jokerDirectory,
		jokerEditionsDirectory,
		overlayDirectory,
		suitDirectory,
	} from "$lib/cardDirectory";
	import BoucherCard from "$lib/components/BoucherCard.svelte";
	import GameCard from "$lib/components/GameCard.svelte";
	import JokerCard from "$lib/components/JokerCard.svelte";
	import type { Card } from "$lib/interfaces";

	type CardItem = {
		key: number;
		card: Card;
	};

	type JokerItem = {
		key: number;
		id: number;
		edition: number;
	};

	type BoucherItem = {
		key: number;
		id: number;
	};

	let nextKey: number = 0;

	let playedCards: CardItem[] = [];
	let handCards: CardItem[] = [];
	let jokers: JokerItem[] = [];
	let bouchers: BoucherItem[] = [];

	let dummyCard:Card = {
		rank:"A",
		suit:"h",
		overlay:0,
		faceUp:false
	}

	for (let i = 0; i < 5; i++) {
		playedCards.push({ key: getNextKey(), card: generateCard(true, true) });
	}

	for (let i = 0; i < 8; i++) {
		handCards.push({ key: getNextKey(), card: generateCard(true, true) });
	}

	for (let j = 0; j < 5; j++) {
		onAddJoker();
	}

	for (let j = 0; j < 6; j++) {
		onAddBoucher();
	}

	function generateCard(withOverlay: boolean, faceUp: boolean): Card {
		const ranks: string[] = [
			"A",
			"K",
			"Q",
			"J",
			"10",
			"9",
			"8",
			"7",
			"6",
			"5",
			"4",
			"3",
			"2",
		];
		return {
			rank: ranks[Math.floor(Math.random() * ranks.length)],
			suit: suitDirectory[
				Math.floor(Math.random() * suitDirectory.length)
			].name,
			faceUp: faceUp,
			overlay: withOverlay
				? Math.floor(Math.random() * overlayDirectory.length)
				: 0,
		};
	}

	function onAddJoker() {
		const newJoker = Math.floor(Math.random() * jokerDirectory.length);
		const newEdition = Math.floor(
			Math.random() * jokerEditionsDirectory.length,
		);
		jokers.push({ key: getNextKey(), id: newJoker, edition: newEdition });
		jokers = jokers;
	}

	function onAddBoucher() {
		const newBoucher = Math.floor(Math.random() * boucherDirectory.length);
		bouchers.push({ key: getNextKey(), id: newBoucher });
		bouchers = bouchers;
	}

	function getNextKey(): number {
		nextKey++;
		return nextKey;
	}
</script>

<!-- Main body -->
<div class="grid grid-cols-[30%_50%_14%] h-full w-full tv-filter gap-[3%]">
	<!-- Info column -->
	<div class="h-[100vh] ml-[20%] card rounded-none text-left p-[5%]">
		<!--Title-->
		<div class="text-5xl h-[12%] card variant-filled-surface p-5">
			Round 1/10
		</div>

		<!--Bouchers label-->
		<div class="text-2xl mt-[3%]">Active consumables</div>
		<!--Bouchers-->
		<div
			class="flex h-[20%] mt-[3%] justify-between"
			style="width: calc(100% - 12vh);"
		>
			{#each bouchers as boucher (boucher.key)}
				<div class="w-0">
					<div class="absolute">
						<BoucherCard width="w-[12vh]" boucherId={boucher.id} />
					</div>
				</div>
			{/each}
		</div>

		<!--Score to beat-->
		<div
			class="card variant-filled-surface w-full h-[8%] mt-[3%] text-center p-3 grid grid-cols-[30%_70%] gap-2"
		>
			<div class="h-full text-3xl content-center">Round score</div>
			<div class="card text-5xl content-center mr-[2%]">9000</div>
		</div>

		<!--Score-->
		<div class="card w-full h-[15%] mt-[3%] text-center border-2 p-2">
			<div class="h-[45%] text-4xl content-center">Full house lvl 2</div>

			<div
				class="flex h-[45%] justify-between text-5xl m-3 gap-0 items-center"
			>
				<div
					class="w-[45%] h-full card text-right p-2 variant-filled-tertiary content-center"
				>
					90
				</div>
				<div>X</div>
				<div
					class="w-[45%] h-full card text-left p-2 variant-filled-error content-center"
				>
					90
				</div>
			</div>
		</div>

		<!--Info chips-->
		<div class="h-[25%] mt-[3%] grid grid-cols-2 gap-3">
			<div
				class="card text-center variant-filled-surface p-3 grid grid-rows-[25%_75%]"
			>
				<div class="text-2xl">Hands</div>
				<div class="card text-5xl content-center text-tertiary-300">
					3
				</div>
			</div>
			<div
				class="card text-center variant-filled-surface p-3 grid grid-rows-[25%_75%]"
			>
				<div class="text-2xl">Discards</div>
				<div class="card text-5xl content-center text-error-300">1</div>
			</div>
			<div
				class="card text-center variant-filled-surface p-3 grid grid-rows-[25%_75%]"
			>
				<div class="text-2xl">Pot</div>
				<div class="card text-5xl content-center">3$</div>
			</div>
			<div
				class="card text-center variant-filled-surface p-3 grid grid-rows-[25%_75%]"
			>
				<div class="text-2xl">Money</div>
				<div class="card text-5xl content-center text-warning-300">
					3$
				</div>
			</div>
		</div>
	</div>

	<!-- Playing mat -->
	<div class="h-[100vh] grid grid-rows-[20%_5%_20%_20%_8%] gap-[6%]">
		<!--Jokers-->
		<div
			class="flex justify-between mt-[3%]"
			style="width: calc(100% - 16vh);"
		>
			{#each jokers as joker (joker.key)}
				<div class="w-0">
					<div class="absolute">
						<JokerCard
							width="w-[16vh]"
							jokerId={joker.id}
							editionId={joker.edition}
							animateCard={true}
						/>
					</div>
				</div>
			{/each}
		</div>
		<div class="text-left text-2xl">4/5</div>

		<!--Played cards-->
		<div class="flex justify-between" style="width: calc(100% - 14vh);">
			{#each playedCards as card (card.key)}
				<div class="w-0">
					<div class="absolute">
						<GameCard
							width="w-[14vh]"
							card={card.card}
							animateCard={true}
						/>
					</div>
				</div>
			{/each}
		</div>

		<!--Hand-->
		<div class="flex justify-between" style="width: calc(100% - 14vh);">
			{#each handCards as card (card.key)}
				<div class="w-0">
					<div class="absolute">
						<GameCard
							width="w-[14vh]"
							card={card.card}
							animateCard={true}
						/>
					</div>
				</div>
			{/each}
		</div>

		<!--Action buttons-->
		<div class="flex justify-center gap-[4%]">
			<button class="btn variant-filled-tertiary w-[35%] text-5xl"
				>Play
			</button>
			<div class="flex w-[15%]">
				<button
					class="btn variant-filled-surface rounded-l-md rounded-r-none w-full text-5xl"
					>&lt;
				</button>
				<button
					class="btn variant-filled-surface rounded-r-md rounded-l-none w-full text-5xl"
					>&gt;
				</button>
			</div>
			<button class="btn variant-filled-error w-[35%] text-5xl"
				>Discard
			</button>
		</div>
	</div>

	<!-- Options and deck -->
	<div class="flex flex-col justify-between h-screen p-10">
		<!--Info group-->
		<div>
			<!--Chat and leave buttons-->
			<div class="flex justify-end gap-4">
				<button class="card w-[25%] aspect-square p-4">
					<img src="icons/chat2.png" alt="chat" class="w-full" />
				</button>
				<button class="card w-[25%] aspect-square text-4xl">
					X
				</button>
			</div>
			<div class="w-full card text-5xl text-right p-4 mt-[5%]">
				30s
			</div>
		</div>

		<!--Deck-->
		<div>
			<div class="relative w-full h-[22vh]">
				<div class="absolute top-[10%] left-[10%]">
					<GameCard width="w-[14vh]" card={dummyCard}/>
				</div>
				<div class="absolute top-[5%] left-[5%]">
					<GameCard width="w-[14vh]" card={dummyCard}/>
				</div>
				<div class="absolute">
					<GameCard width="w-[14vh]" card={dummyCard}/>
				</div>
				
			</div>
			<div class="w-full text-right text-2xl mt-[10%]">
				41/52
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-image: url("/fondo_juego.png") !important;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	/*
	Filter taken from https://github.com/D3nn7/crt-css
	License says: "I love Open Source and decide that this small project don't need a license. 
	You can use it without any restrictions."
	Thank you Danny Schapeit!
	*/

	.tv-filter {
		text-shadow:
			0.06rem 0 0.06rem #ea36af,
			-0.125rem 0 0.06rem #75fa69;
		animation-duration: 0.01s;
		animation-name: textflicker;
		animation-iteration-count: infinite;
		animation-direction: alternate;
	}

	@keyframes textflicker {
		from {
			text-shadow:
				1px 0 0 #ea36af,
				-2px 0 0 #75fa69;
		}
		to {
			text-shadow:
				2px 0.5px 2px #ea36af,
				-1px -0.5px 2px #75fa69;
		}
	}
</style>
