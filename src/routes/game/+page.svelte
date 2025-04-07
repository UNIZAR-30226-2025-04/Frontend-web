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
	import { HandTypesBase, type Card, type GameState } from "$lib/interfaces";
	import { getNextKey } from "$lib/keyGenerator";
	import {
		getDrawerStore,
		getModalStore,
		type DrawerSettings,
		type ModalSettings,
	} from "@skeletonlabs/skeleton";
	import { onDestroy, onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { tweened } from "svelte/motion";
	import { fade, fly } from "svelte/transition";

	// Main state variable
	let state: GameState = {
		playedCards: [],
		handCards: [],
		jokers: [],
		activeBouchers: [],
		bouchers: [],
		handLevels: structuredClone(HandTypesBase),
		round: 1,
		minScore: 100000,
		handType: 1,
		blueScore: 0,
		redScore: 0,
		hands: 3,
		discards: 3,
		pot: 5,
		money: 10,
		deckSize: 52,
		deckLeft: 44,
		timeLeft: 30,
	};

	// To know what jocker has the user clicked
	let pickedJoker: number = -1;

	// If true it disables the button controls
	let actionBlocked: boolean = false;

	// For the play animation
	const playAnimSpeed: number = 750; //ms
	const playAnimDelay: number = 200; //ms
	let indexToPlayAnim: number = -1;
	let scorePlayAnim: number = 0;

	// To draw the deck
	let dummyCard: Card = {
		rank: "A",
		suit: "h",
		overlay: 0,
		faceUp: false,
	};

	// Styles tag that repeat
	const infoChip:string = "card text-center variant-filled-surface p-3 grid grid-rows-[25%_75%] gap-2";
	const infoChipCard:string = "card text-5xl-r content-center";

	// Modal and drawer variables

	const modalStore = getModalStore();
	const drawerStore = getDrawerStore();

	const settingsChat: DrawerSettings = {
		id: "chat",
		position: "right",
		width: "w-[40%]",
		padding: "p-4",
	};

	const leaveGameModal: ModalSettings = {
		type: "component",
		component: "leaveGameModal",
	};

	const handInfoModal: ModalSettings = {
		type: "component",
		meta: { levels: state.handLevels },
		component: "handInfoModal",
	};

	// Reactivity animations

	const minScoreText = tweened(state.minScore, {
		duration: 400,
		easing: cubicOut,
	});
	$: minScoreText.set(state.minScore);

	const blueScoreText = tweened(state.blueScore, {
		duration: 400,
		easing: cubicOut,
	});
	$: blueScoreText.set(state.blueScore);

	const redScoreText = tweened(state.redScore, {
		duration: 400,
		easing: cubicOut,
	});
	$: redScoreText.set(state.redScore);

	/**
	 * Handles the click event on the joker card, updating the state of the hand cards.
	 * If the action is blocked, it prevents any changes.
	 * Resets the `picked` status of all hand cards and sets the picked joker card index.
	 * @param index  of the joker card that was clicked.
	 */
	function onClickJoker(index: number) {
		if (actionBlocked) return;

		for (const card of state.handCards) card.picked = false;

		if (index !== pickedJoker) {
			const anyPicked = state.handCards.some((card) => card.picked);
			if (!anyPicked) pickedJoker = index;
		} else {
			pickedJoker = -1;
		}
	}

	/**
	 * Handles the play action, where the selected cards are played and added to the `playedCards` array.
	 * - If no action is blocked and a joker card is not picked, it checks the number of selected cards.
	 * - If the number of selected cards is between 1 and 5 (inclusive), it moves the picked cards to the played cards and updates the hand cards.
	 * - It also triggers animations and updates the scores of the blue and red teams at random.
	 * - Once the play is complete, it resets the state and allows further actions.
	 */
	function onPlay() {
		if (actionBlocked) return;

		if (pickedJoker !== -1) return;

		const pickedCards = state.handCards.filter((card) => card.picked);
		const count = pickedCards.length;

		if (count > 0 && count < 6) {
			const played = pickedCards.map(({ card }) => ({
				key: getNextKey(),
				card,
				picked: false,
			}));

			state.playedCards.push(...played);
			state.handCards = state.handCards.filter((card) => !card.picked);
			pickedJoker = -1;
			state.playedCards = [...state.playedCards];
			actionBlocked = true;

			// Animation. TODO put real values

			for (let i = 0; i < state.playedCards.length; i++) {
				setTimeout(
					() => {
						indexToPlayAnim = i;
						scorePlayAnim = Math.floor(Math.random() * 12);
						state.blueScore += Math.floor(Math.random() * 1000);
						state.redScore += Math.floor(Math.random() * 100);
					},
					playAnimSpeed * i + playAnimDelay,
				);
			}

			setTimeout(() => {
				indexToPlayAnim = -1;
				actionBlocked = false;
				state.playedCards = [];
				state.minScore -= 10000;
			}, playAnimSpeed * state.playedCards.length);
		}
	}

	/**
	 * Handles the action triggered by the left arrow key.
	 * - If no action is blocked and no joker card is picked, it swaps the selected card with the one to its left.
	 * - If a joker card is picked, it swaps the joker card with the one to its left in the `jokers` array.
	 * This function ensures that the picked card can only be swapped with the card immediately to the left,
	 * and updates the state of the hand cards or jokers accordingly.
	 */
	function onArrowLeft() {
		if (actionBlocked) return;

		if (pickedJoker === -1) {
			let pickedIndex = state.handCards.findIndex((card) => card.picked);
			if (
				pickedIndex > 0 &&
				state.handCards.filter((c) => c.picked).length === 1
			) {
				// Swap
				[
					state.handCards[pickedIndex - 1],
					state.handCards[pickedIndex],
				] = [
					state.handCards[pickedIndex],
					state.handCards[pickedIndex - 1],
				];
				state.handCards = [...state.handCards];
			}
		} else if (pickedJoker > 0) {
			// Swap
			[state.jokers[pickedJoker - 1], state.jokers[pickedJoker]] = [
				state.jokers[pickedJoker],
				state.jokers[pickedJoker - 1],
			];
			pickedJoker--;
		}
	}

	/**
	 * Handles the action triggered by the right arrow key.
	 * - If no action is blocked and no joker card is picked, it swaps the selected card with the one to its right.
	 * - If a joker card is picked, it swaps the joker card with the one to its right in the `jokers` array.
	 * This function ensures that the picked card can only be swapped with the card immediately to the right,
	 * and updates the state of the hand cards or jokers accordingly.
	 */
	function onArrowRight() {
		if (actionBlocked) return;

		if (pickedJoker === -1) {
			let pickedIndex = state.handCards.findIndex((card) => card.picked);
			if (
				pickedIndex !== -1 &&
				pickedIndex < state.handCards.length - 1 &&
				state.handCards.filter((c) => c.picked).length === 1
			) {
				// Swap
				[
					state.handCards[pickedIndex + 1],
					state.handCards[pickedIndex],
				] = [
					state.handCards[pickedIndex],
					state.handCards[pickedIndex + 1],
				];
				state.handCards = [...state.handCards];
			}
		} else if (pickedJoker < state.jokers.length - 1) {
			// Swap
			[state.jokers[pickedJoker + 1], state.jokers[pickedJoker]] = [
				state.jokers[pickedJoker],
				state.jokers[pickedJoker + 1],
			];
			pickedJoker++;
		}
	}

	/**
	 * Handles the discard action, removing all picked cards from the hand.
	 * - If no action is blocked, it filters out the picked cards from the `handCards` array, effectively discarding them.
	 * - This function is used to remove selected cards from the player's hand once they are discarded.
	 */
	function onDiscard() {
		if (actionBlocked) return;
		state.handCards = state.handCards.filter(
			(cardItem) => !cardItem.picked,
		);
	}

	function onHandInfo() {
		modalStore.trigger(handInfoModal);
	}

	function onChat() {
		drawerStore.open(settingsChat);
	}

	function onExit() {
		modalStore.trigger(leaveGameModal);
	}

	// Interval for timer, aux variable
	let interval: any;

	onMount(() => {
		// Interval for the Time left clock
		interval = setInterval(() => {
			if (state.timeLeft > 0) {
				state.timeLeft--;
			} else {
				state.timeLeft = 30;
			}
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	// ==== MOCKUP FUNCTIONS ====

	// Function just to get more cards and play around
	function onDeck() {
		state.handCards.push({
			key: getNextKey(),
			card: generateCard(true, true),
			picked: false,
		});
		state.handCards = state.handCards;
	}

	for (let i = 0; i < 0; i++) {
		state.playedCards.push({
			key: getNextKey(),
			card: generateCard(true, true),
			picked: false,
		});
	}

	for (let i = 0; i < 8; i++) {
		state.handCards.push({
			key: getNextKey(),
			card: generateCard(true, true),
			picked: false,
		});
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
		state.jokers.push({
			key: getNextKey(),
			id: newJoker,
			edition: newEdition,
		});
		state.jokers = state.jokers;
	}

	function onAddBoucher() {
		const newBoucher = Math.floor(Math.random() * boucherDirectory.length);
		state.activeBouchers.push({ key: getNextKey(), id: newBoucher });
		state.activeBouchers = state.activeBouchers;
	}

	function onClickHand(index: number) {
		pickedJoker = -1;
		const card = state.handCards[index];
		card.picked = !card.picked;
		state.handCards = [...state.handCards];
	}
</script>

<!-- Main body -->
<div
	class="grid grid-cols-[30%_50%_14%] h-full w-full tv-filter gap-[3%] game-div"
>
	<!-- Info column -->
	<div class="h-[100vh] ml-[20%] card rounded-none text-left p-[5%]">
		<!--Title-->
		<div class="text-5xl-r h-[12%] card variant-filled-surface p-5">
			Round {state.round}/10
		</div>

		<!--Bouchers label-->
		<div class="text-2xl-r mt-[3%]">Active consumables</div>
		<!--Bouchers-->
		<div
			class="flex h-[20%] mt-[3%] justify-between"
			style="width: calc(100% - 12vh);"
		>
			{#each state.activeBouchers as boucher (boucher.key)}
				<div class="w-0">
					<div class="absolute">
						<BoucherCard width="w-[12vh]" boucherId={boucher.id} />
					</div>
				</div>
			{/each}
		</div>

		<!--Score to beat-->
		<div
			class="card variant-filled-surface w-full h-[8%] mt-[3%] text-center grid grid-cols-[30%_70%] gap-2"
		>
			<div class="h-full text-3xl-r content-center p-3">Round score</div>
			<div
				class="card h-[6vh] text-5xl-r content-center align-middle mt-[3%] mr-[5%] p-0"
			>
				{$minScoreText.toFixed()}
			</div>
		</div>

		<!--Score-->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="card w-full h-[15%] mt-[3%] text-center border-2 p-2"
			on:click={onHandInfo}
		>
			<!--Hand type-->
			<div class="h-[45%] text-4xl-r content-center">
				{#if state.handType >= 0}
					{state.handLevels[state.handType].name} lvl {state
						.handLevels[state.handType].lvl}
				{/if}
			</div>

			<!--Score chips-->
			<div
				class="flex h-[45%] justify-between text-5xl-r m-3 gap-0 items-center"
			>
				<div
					class="w-[45%] h-full card text-right p-0 pr-[3%] variant-filled-tertiary content-center align-middle"
				>
					{$blueScoreText.toFixed()}
				</div>
				<div>X</div>
				<div
					class="w-[45%] h-full card text-left p-0 pl-[3%] variant-filled-error content-center align-middle"
				>
					{$redScoreText.toFixed()}
				</div>
			</div>
		</div>

		<!--Info chips-->
		<div class="h-[25%] mt-[3%] grid grid-cols-2 gap-3">
			<!--Hands-->
			<div class={infoChip}>
				<div class="text-2xl-r">Hands</div>
				<div class="{infoChipCard} text-tertiary-300">
					{state.hands}
				</div>
			</div>
			<!--Discards-->
			<div class={infoChip}>
				<div class="text-2xl-r">Discards</div>
				<div class="{infoChipCard} text-error-300">
					{state.discards}
				</div>
			</div>
			<!--Pot-->
			<div class={infoChip}>
				<div class="text-2xl-r">Pot</div>
				<div class={infoChipCard}>
					{state.pot}$
				</div>
			</div>
			<!--Money-->
			<div class={infoChip}>
				<div class="text-2xl-r">Money</div>
				<div class="{infoChipCard} text-warning-300">
					{state.money}$
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
			{#each state.jokers as joker, index (joker.key)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					animate:flip={{ duration: 100 }}
					class={`w-1 transition-all duration-[100ms] ease-in-out ${index === pickedJoker ? "mt-[5%]" : ""}`}
					on:click={() => onClickJoker(index)}
				>
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
		<div class="text-left text-2xl-r">{state.jokers.length}/5</div>

		<!--Played cards-->
		<div
			class="flex justify-between ml-[10%] mr-[10%]"
			style="width: calc(80% - 14vh);"
		>
			{#each state.playedCards as card, index (card.key)}
				<div transition:fly={{ y: 100, duration: 500 }} class="w-1">
					{#if index === indexToPlayAnim}
						<div
							in:fly={{ y: 150, duration: 300 }}
							out:fade={{ duration: 300 }}
							class="w-[14vh] text-center absolute mt-[-4vh] text-warning-300 text-3xl-r"
						>
							+{scorePlayAnim}
						</div>
					{/if}
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
			{#each state.handCards as card, index (card.key)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					animate:flip={{ duration: 100 }}
					class={`w-1 transition-all duration-[100ms] ease-in-out ${card.picked ? "mt-[-5%]" : ""}`}
					on:click={() => onClickHand(index)}
				>
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
			<button
				class="btn variant-filled-tertiary w-[35%] text-5xl-r"
				on:click={onPlay}
				>Play
			</button>
			<div class="flex w-[15%]">
				<button
					class="btn variant-filled-surface rounded-l-md rounded-r-none w-full text-5xl-r"
					on:click={onArrowLeft}
					>&lt;
				</button>
				<button
					class="btn variant-filled-surface rounded-r-md rounded-l-none w-full text-5xl-r"
					on:click={onArrowRight}
					>&gt;
				</button>
			</div>
			<button
				class="btn variant-filled-error w-[35%] text-5xl-r"
				on:click={onDiscard}
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
				<button
					class="card w-[25%] aspect-square content-center"
					on:click={onChat}
				>
					<img
						src="icons/chat2.png"
						alt="chat"
						class="w-[50%] min-w-[12px] mx-auto"
					/>
				</button>
				<button
					class="card w-[25%] aspect-square text-4xl-r"
					on:click={onExit}
				>
					X
				</button>
			</div>
			<div class="w-full card text-5xl-r text-right p-4 mt-[5%]">
				{state.timeLeft}s
			</div>
		</div>

		<!--Deck-->
		<div>
			<div class="relative w-full h-[22vh]">
				<div class="absolute top-[10%] left-[10%]">
					<GameCard width="w-[14vh]" card={dummyCard} />
				</div>
				<div class="absolute top-[5%] left-[5%]">
					<GameCard width="w-[14vh]" card={dummyCard} />
				</div>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="absolute" on:click={onDeck}>
					<GameCard width="w-[14vh]" card={dummyCard} />
				</div>
			</div>
			<div class="w-full text-right text-2xl-r mt-[10%]">
				{state.deckLeft}/{state.deckSize}
			</div>
		</div>
	</div>
</div>

<style>
	.game-div {
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

	@media (max-height: 640px) {
		.tv-filter {
			text-shadow: none;
			animation: none;
		}
	}

	.text-5xl-r {
		font-size: 4.5vh;
		line-height: 1;
	}

	.text-4xl-r {
		font-size: 3vh;
		line-height: 1;
	}

	.text-3xl-r {
		font-size: 2.5vh;
		line-height: 1;
	}

	.text-2xl-r {
		font-size: 2vh;
		line-height: 1;
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
