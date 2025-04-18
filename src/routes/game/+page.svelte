<script lang="ts">
	import {
		getValueFromRank,
		getValueFromSuit,
		HandTypesBase,
		jokerDirectory,
		jokerEditionsDirectory,
		overlayDirectory,
		packageDirectory,
		suitDirectory,
		voucherDirectory,
	} from "$lib/cardDirectory";
	import GameCard from "$lib/components/GameCard.svelte";
	import JokerCard from "$lib/components/JokerCard.svelte";
	import PackageCard from "$lib/components/PackageCard.svelte";
	import VoucherCard from "$lib/components/VoucherCard.svelte";
	import {
		type Card,
		type CardItem,
		type GameState,
		type JokerItem,
		type Package,
		type PackageItem,
		type VoucherItem,
	} from "$lib/interfaces";
	import { getNextKey } from "$lib/keyGenerator";
	import { initializeSocket } from "$lib/sockets-utils/lobbySocket";
	import {
		getDrawerStore,
		getModalStore,
		type DrawerSettings,
		type ModalSettings,
	} from "@skeletonlabs/skeleton";
	import { onDestroy, onMount } from "svelte";
	import { dndzone } from "svelte-dnd-action";
	import { flip } from "svelte/animate";
	import { bounceOut, cubicOut } from "svelte/easing";
	import { tweened } from "svelte/motion";
	import { fade, fly } from "svelte/transition";

	// Main state variable
	let state: GameState = {
		playedCards: [],
		handCards: [],
		jokers: [],
		activeVouchers: [],
		vouchers: [],
		handLevels: structuredClone(HandTypesBase),
		shop: { jokerRow: [], voucherRow: [], packageRow: [] },
		round: 1,
		phase: 0,
		minScore: 100000,
		handType: 1,
		blueScore: 0,
		redScore: 0,
		hands: 3,
		discards: 3,
		pot: 5,
		money: 1000,
		rerollAmount: 3,
		deckSize: 52,
		deckLeft: 44,
		timeLeft: 300,
	};

	// If true it disables the button controls
	let actionBlocked: boolean = false;

	// Global speed of animations
	const animationSpeed: number = 100; // ms

	// For the play animation
	const playAnimSpeed: number = animationSpeed * 7.5; //ms
	const playAnimDelay: number = animationSpeed * 2; //ms
	const drawCardAnimSpeed: number = animationSpeed; //ms
	const drawCardDelay: number = animationSpeed * 2; //ms
	let indexToPlayAnim: number = -1;
	let scorePlayAnim: number = 0;

	// To draw the deck
	let dummyCard: Card = {
		rank: "A",
		suit: "h",
		overlay: 0,
		faceUp: false,
	};

	// Styles tag that repeat or are too long
	const shopTitle =
		"text-6xl-r h-[12%] card p-5 text-center content-center text-warning-500 border-8 border-warning-500 shadow-[5px_15px_10px_rgba(0,0,0,0.5)]";
	const vouchersTitle =
		"text-6xl-r h-[12%] card p-5 text-center content-center variant-filled-secondary shadow-[5px_15px_10px_rgba(0,0,0,0.5)]";
	const infoChip: string =
		"card text-center variant-filled-surface p-3 grid grid-rows-[25%_75%] gap-2";
	const infoChipCard: string = "card text-5xl-r content-center";
	const priceChip: string =
		"h-full card border-2 border-warning-500 text-3xl-r text-warning-500 content-center";

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
		duration: animationSpeed * 4,
		easing: cubicOut,
	});
	$: minScoreText.set(state.minScore);

	const blueScoreText = tweened(state.blueScore, {
		duration: animationSpeed * 4,
		easing: cubicOut,
	});
	$: blueScoreText.set(state.blueScore);

	const redScoreText = tweened(state.redScore, {
		duration: animationSpeed * 4,
		easing: cubicOut,
	});
	$: redScoreText.set(state.redScore);

	const moneyText = tweened(state.money, {
		duration: animationSpeed * 4,
		easing: cubicOut,
	});
	$: moneyText.set(state.money);

	const potText = tweened(state.pot, {
		duration: animationSpeed * 4,
		easing: cubicOut,
	});
	$: potText.set(state.pot);


	/**
	 * Handles the click event on the joker card, updating the state of the hand cards.
	 * If the action is blocked, it prevents any changes.
	 * Resets the `picked` status of all hand cards and sets the picked joker card index.
	 * If on shop phase it sells the joker
	 * @param index  of the joker card that was clicked.
	 */
	function onClickJoker(index: number) {
		if (actionBlocked) return;

		if (state.phase === 1) {
			state.money += state.jokers[index].sellAmount;
			state.jokers.splice(index, 1);
		}
	}

	/**
	 * Handles the play action on vouchers phase
	 */
	function onPlayVoucher() {
		if (actionBlocked) return;

		let pickedVouchers:VoucherItem[] = state.vouchers.filter((vouch:VoucherItem) => vouch.picked);

		if(pickedVouchers.length === 1){

			let pickedVoucher:VoucherItem = pickedVouchers[0];
			const index:number = state.vouchers.findIndex((vouch:VoucherItem) => vouch.picked);

			if(isOffensiveVoucher(pickedVoucher.voucherId)){
				const useVoucherModal: ModalSettings = {
					type: "component",
					meta: { voucherId: pickedVoucher.voucherId },
					component: "useVoucherModal",
					response: (r: boolean | undefined) => removeVoucherModal(r,index)
				}

				modalStore.trigger(useVoucherModal);
			}else{
				state.activeVouchers.push(pickedVoucher);
				state.vouchers.splice(index,1);
			}

			// Reset the picked voucher
			state.vouchers.map((vouch:VoucherItem) => vouch.picked = false);
			state.vouchers = [...state.vouchers];
		}

	}

	function removeVoucherModal(response:boolean|undefined ,index:number){
		if(response && response === true && index > 0 && index < state.vouchers.length){
			state.vouchers.splice(index,1);
			state.vouchers = [...state.vouchers];
		}
	}

	/**
	 * Sort cards on hand by rank
	 */
	function onSortR() {
		state.handCards = state.handCards.sort(
			(cardA, cardB: CardItem) =>
				getValueFromRank(cardB.card.rank) -
				getValueFromRank(cardA.card.rank),
		);
	}

	/**
	 * Sorts cards on hand by suit
	 */
	function onSortS() {
		state.handCards = state.handCards.sort(
			(cardA, cardB: CardItem) =>
				getValueFromSuit(cardA.card.suit) -
				getValueFromSuit(cardB.card.suit),
		);
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

	/**
	 * Buys the joker at 'index' from the shop if the user has the aviable money and space
	 * @param index
	 */
	function onBuyJoker(index: number) {
		if (
			state.jokers.length < 5 &&
			state.shop.jokerRow[index].sellAmount <= state.money
		) {
			state.money -= state.shop.jokerRow[index].sellAmount;
			state.jokers.push(state.shop.jokerRow[index]);
			state.shop.jokerRow.splice(index, 1);
		}
	}

	/**
	 * Buys the voucher at 'index' from the shop if the user has the aviable money
	 * @param index
	 */
	function onBuyVoucher(index: number) {
		if (state.shop.voucherRow[index].sellAmount <= state.money) {
			state.money -= state.shop.voucherRow[index].sellAmount;

			// Create a copy of the voucher to add to the collection
			const boughtVoucher = {
				...state.shop.voucherRow[index],
				id: getNextKey(), // Assign a new unique ID
			};

			// Add to player's voucher inventory
			state.vouchers.push(boughtVoucher);

			// Ensure reactivity
			state.vouchers = [...state.vouchers];

			// Remove the voucher from the shop
			state.shop.voucherRow.splice(index, 1);
			state.shop.voucherRow = [...state.shop.voucherRow];

			console.log(
				`Bought voucher ID ${boughtVoucher.voucherId}, total in inventory: ${state.vouchers.length}`,
			);
		}
	}

	/**
	 * Buys the package at 'index' from the shop if the user has the aviable money
	 * If the pack contains joker it doesn't open if the user has already 5/5 jokers
	 * @param index
	 */
	function onBuyPack(index: number) {
		let packItem: PackageItem = state.shop.packageRow[index];
		if (state.shop.packageRow[index].sellAmount <= state.money) {
			if (
				packItem.packageId >= 0 &&
				packItem.packageId < packageDirectory.length
			) {
				let pack: Package = packageDirectory[packItem.packageId];
				if (pack.contentType !== 1 || state.jokers.length < 5) {
					const openPackModal: ModalSettings = {
						type: "component",
						meta: {
							state: state,
							packItem: state.shop.packageRow[index],
							animationSpeed: animationSpeed,
						},
						component: "openPackModal",
					};

					state.money -= state.shop.packageRow[index].sellAmount;
					state.shop.packageRow.splice(index, 1);

					modalStore.trigger(openPackModal);
				}
			}
		}
	}

	/**
	 * If the user has enough money it rerolls the joker row from the shop
	 */
	function onReroll() {
		if (
			state.money >= state.rerollAmount &&
			state.shop.jokerRow.length > 0
		) {
			let aux: number = state.shop.jokerRow.length;
			state.shop.jokerRow = [];
			for (let i = 0; i < aux; i++) {
				const newJoker = Math.floor(
					Math.random() * jokerDirectory.length,
				);
				const newEdition = Math.floor(
					Math.random() * jokerEditionsDirectory.length,
				);
				state.shop.jokerRow.push({
					id: getNextKey(),
					jokerId: newJoker,
					edition: newEdition,
					sellAmount: Math.floor(Math.random() * 30) + 1,
					picked: false,
				});
			}
			state.shop.jokerRow = state.shop.jokerRow;
			state.money -= state.rerollAmount;
			state.rerollAmount += Math.floor(Math.random() * 5) + 1;
		}
	}

	// Drag and drop functions
	function handleDndConsiderCards(e: any) {
		state.handCards = e.detail.items;
	}
	function handleDndFinalizeCards(e: any) {
		state.handCards = e.detail.items;
	}
	function handleDndConsiderJokers(e: any) {
		state.jokers = e.detail.items;
	}
	function handleDndFinalizeJokers(e: any) {
		state.jokers = e.detail.items;
	}
	function handleDndConsiderVouchers(e: any) {
		state.vouchers = e.detail.items;
	}
	function handleDndFinalizeVouchers(e: any) {
		state.vouchers = e.detail.items;
	}

	

	// ==== MOCKUP FUNCTIONS ====

	// Function just to get more cards and play around
	function onAddCard() {
		state.handCards.push({
			id: getNextKey(),
			card: generateCard(true, true),
			picked: false,
		});
		state.handCards = state.handCards;
	}

	function onAddMoney() {
		state.money += 10;
	}

	function onRemoveVoucher() {
		state.vouchers.splice(0, 1);
		state.vouchers = state.vouchers;
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
			id: getNextKey(),
			jokerId: newJoker,
			edition: newEdition,
			sellAmount: Math.floor(Math.random() * 30) + 1,
			picked: false,
		});
		state.jokers = state.jokers;
	}

	/**
	 * Creates a new voucher for the vouchers collection only
	 */
	function onAddVoucher() {
		const newVoucher = Math.floor(Math.random() * voucherDirectory.length);
		// Get voucher details from directory to determine targetType
		const voucherInfo = voucherDirectory[newVoucher];

		const newVoucherItem: VoucherItem = {
			id: getNextKey(),
			voucherId: newVoucher,
			sellAmount: Math.floor(Math.random() * 30) + 1,
			picked: false,
		};

		// Only add to state.vouchers, not to activeVouchers
		state.vouchers.push(newVoucherItem);
		state.vouchers = [...state.vouchers];

		console.log(
			`Added voucher ID ${newVoucher} to inventory, total: ${state.vouchers.length}`,
		);
	}

	/**
	 * Handles click on a hand card
	 * @param index Index of the clicked card
	 */
	function onClickHand(index: number) {
		if (actionBlocked) return;

		const card:CardItem = state.handCards[index];

		// Switch state
		card.picked = !card.picked;

		// Update state to reflect changes in UI
		state.handCards = [...state.handCards];
	}

	/**
	 * Handles click on a voucher in hand
	 * @param index Index of the clicked voucher
	 */
	function onClickHandVoucher(index:number){
		if (actionBlocked) return;

		const voucher:VoucherItem = state.vouchers[index];
		const prevState = voucher.picked;

		// Deselect all vouchers
		state.vouchers.map((voucherItem) => (voucherItem.picked = false));

		// Switch state
		voucher.picked = !prevState;

		// Update state to reflect changes in UI
		state.vouchers = [...state.vouchers];
	}

	/**
	 * Modified onNextPhase function to handle transition between phases correctly
	 */
	function onNextPhase() {

		// Closes all active modals
		modalStore.close();

		if (state.phase === 0) {
			// Normal phase → Shop phase
			state.phase = 1;
			setupShop();
			state.timeLeft = 30;
		} else if (state.phase === 1) {
			// Shop phase → Voucher phase
			state.activeVouchers = [];
			state.phase = 2;
			state.timeLeft = 30;
		} else if (state.phase === 2) {
			// Voucher phase → Normal phase (next round)
			handleNextRound();
		}
	}

	/**
	 * Configures the shop with new items, MOCKUP change later
	 */
	function setupShop() {
		state.shop = { jokerRow: [], voucherRow: [], packageRow: [] };

		// Add jokers to the shop
		for (let i = 0; i < 3; i++) {
			const newJoker = Math.floor(Math.random() * jokerDirectory.length);
			const newEdition = Math.floor(
				Math.random() * jokerEditionsDirectory.length,
			);
			state.shop.jokerRow.push({
				id: getNextKey(),
				jokerId: newJoker,
				edition: newEdition,
				sellAmount: Math.floor(Math.random() * 30) + 1,
				picked: false,
			});
		}

		// Add vouchers to the shop
		for (let i = 0; i < 2; i++) {
			const newVoucher = Math.floor(
				Math.random() * voucherDirectory.length,
			);
			// Get voucher info from directory
			const voucherInfo = voucherDirectory[newVoucher];

			state.shop.voucherRow.push({
				id: getNextKey(),
				voucherId: newVoucher,
				sellAmount: Math.floor(Math.random() * 30) + 1,
				picked: false,
			});
		}

		// Add packages to the shop
		for (let i = 0; i < 2; i++) {
			const newPack = Math.floor(Math.random() * packageDirectory.length);
			const pack = packageDirectory[newPack];
			let content: CardItem[] | JokerItem[] | VoucherItem[] = [];

			// Configure content based on package type
			if (pack.contentType === 0) {
				// Card content
				content = <CardItem[]>[];
				for (let j = 0; j < pack.contentSize; j++) {
					content.push({
						id: getNextKey(),
						card: generateCard(true, true),
						picked: false,
					});
				}
			} else if (pack.contentType === 1) {
				// Joker content
				content = <JokerItem[]>[];
				for (let j = 0; j < pack.contentSize; j++) {
					const newJoker = Math.floor(
						Math.random() * jokerDirectory.length,
					);
					const newEdition = Math.floor(
						Math.random() * jokerEditionsDirectory.length,
					);
					content.push({
						id: getNextKey(),
						jokerId: newJoker,
						edition: newEdition,
						sellAmount: Math.floor(Math.random() * 30) + 1,
						picked: false,
					});
				}
			} else {
				// Voucher content
				content = <VoucherItem[]>[];
				for (let j = 0; j < pack.contentSize; j++) {
					const newVoucher = Math.floor(
						Math.random() * voucherDirectory.length,
					);
					const voucherInfo = voucherDirectory[newVoucher];
					content.push({
						id: getNextKey(),
						voucherId: newVoucher,
						sellAmount: Math.floor(Math.random() * 30) + 1,
						picked: false,
					});
				}
			}

			state.shop.packageRow.push({
				id: getNextKey(),
				packageId: newPack,
				sellAmount: Math.floor(Math.random() * 30) + 1,
				contents: content,
			});
		}

		// Update shop to reflect in UI
		state.shop.jokerRow = [...state.shop.jokerRow];
		state.shop.voucherRow = [...state.shop.voucherRow];
		state.shop.packageRow = [...state.shop.packageRow];
	}

	/**
	 * Plays the selected cards on game phase
	 */
	 function onPlayHand() {
		if (actionBlocked) return;

		let pickedCards:CardItem[] = state.handCards.filter((cardItem:CardItem) => cardItem.picked);
		
		const played = pickedCards.map(({ card }: any) => ({
			id: getNextKey(),
			card,
			picked: false,
		}));

		state.playedCards.push(...played);
		state.handCards = state.handCards.filter((card: any) => !card.picked);
		state.playedCards = [...state.playedCards];
		actionBlocked = true;

		// Animation. TODO put real values
		for (let i = 0; i < state.playedCards.length; i++) {
			setTimeout(
				() => {
					indexToPlayAnim = i;
					scorePlayAnim = getValueFromRank(
						state.playedCards[i].card.rank,
					);
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

		setTimeout(
			() => {
				state.blueScore = 0;
				state.redScore = 0;
			},
			playAnimSpeed * (state.playedCards.length + 1),
		);
	}


	/**
	 * Handles the transition to the next round
	 */
	function handleNextRound() {
		// Clear only normal cards, not vouchers from inventory
		state.handCards = [];

		// Deal new cards for the next round
		for (let i = 0; i < 8; i++) {
			setTimeout(
				() => {
					onAddCard();
				},
				drawCardAnimSpeed * i + drawCardDelay,
			);
		}

		// Increment round counter
		state.round++;

		// Reset phase and timer
		state.phase = 0;
		state.timeLeft = 30;

		// Update minimum score for the new round
		state.minScore = 100000 - state.round * 10000;
	}


	/**
	 * Auxiliary function: Determines if a voucher is offensive (must choose players) or non-offensive (only own user affected)
	 * @param voucherId The ID of the voucher to check
	 * @returns True if the voucher is offensive
	 */
	function isOffensiveVoucher(voucherId: number): boolean {
		if (voucherId > 0 && voucherId < voucherDirectory.length) {
			// Get voucher info from directory
			const voucherInfo = voucherDirectory[voucherId];

			// Check if it's offensive based on targetType
			return voucherInfo.targetType;
		} else {
			return false;
		}
	}

	// Interval for timer, aux variable
	let interval: any;

	onMount(() => {
		// State mockup initialization
		for (let i = 0; i < 0; i++) {
			state.playedCards.push({
				id: getNextKey(),
				card: generateCard(true, true),
				picked: false,
			});
		}

		for (let i = 0; i < 8; i++) {
			state.handCards.push({
				id: getNextKey(),
				card: generateCard(true, true),
				picked: false,
			});
		}

		for (let j = 0; j < 5; j++) {
			onAddJoker();
		}

		for (let j = 0; j < 6; j++) {
			onAddVoucher();
		}

		// Interval for the Time left clock
		interval = setInterval(() => {
			if (state.timeLeft > 0) {
				state.timeLeft--;
			} else if (state.timeLeft === 0) {
				onNextPhase();
			}
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});

</script>

<!-- Main body -->
<div
	class="grid grid-cols-[30%_50%_14%] h-full w-full tv-filter gap-[3%] game-div"
>
	<!-- Info column -->
	<div class="h-[100vh] ml-[20%] card rounded-none text-left p-[5%]">
		<!--Title-->
		{#if state.phase === 0}
			<div class="text-5xl-r h-[12%] card variant-filled-surface p-5">
				Round {state.round}/10
			</div>
		{:else if state.phase === 1}
			<div class={shopTitle}>SHOP</div>
		{:else if state.phase === 2}
			<div class={vouchersTitle}>VOUCHERS</div>
		{/if}

		<!-- Show "Your vouchers" only in shop phase -->
		{#if state.phase === 1}
			<!--Vouchers label-->
			<div class="text-2xl-r mt-[3%]">Your vouchers</div>
			<!--Vouchers-->
			<div
				class="flex h-[20%] mt-[3%] justify-between"
				style="width: calc(100% - 11vh);"
			>
				{#each state.vouchers as voucher (voucher.id)}
					<div
						class="w-[1vh]"
						animate:flip={{ duration: animationSpeed }}
					>
						<VoucherCard
							width="w-[12vh]"
							voucherId={voucher.voucherId ?? 0}
							animateCard={true}
						/>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Active Vouchers Display - show in all phases except shop -->
			<div class="text-2xl-r mt-[3%]">Active Effects</div>
			<div
				class="flex h-[20%] mt-[3%] justify-between"
				style="width: calc(100% - 11vh);"
			>
				{#each state.activeVouchers as voucher (voucher.id)}
					<div
						class="w-[1vh]"
						animate:flip={{ duration: animationSpeed }}
					>
						<VoucherCard
							width="w-[12vh]"
							voucherId={voucher.voucherId ?? 0}
							animateCard={true}
						/>
					</div>
				{/each}
			</div>
		{/if}

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
					{$potText.toFixed()}$
				</div>
			</div>
			<!--Money-->
			<div class={infoChip}>
				<div class="text-2xl-r">Money</div>
				<div class="{infoChipCard} text-warning-300">
					{$moneyText.toFixed()}$
				</div>
			</div>
		</div>
	</div>

	<!-- Playing mat -->

	<div class="h-[100vh] grid grid-rows-[20%_5%_75%] gap-[6%]">
		<!--Jokers-->
		<div
			class="flex justify-between relative h-full mt-[3%]"
			style="width: calc(100% - 9vh);"
			use:dndzone={{
				items: state.jokers,
				flipDurationMs: animationSpeed,
				type: "Joker",
				dropTargetStyle: { outline: "solid 0px" },
			}}
			on:consider={handleDndConsiderJokers}
			on:finalize={handleDndFinalizeJokers}
		>
			{#each state.jokers as joker, index (joker.id)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					animate:flip={{ duration: animationSpeed }}
					class={`w-[5vh] h-full transition-transform duration-[${animationSpeed * 2}] ease-in-out`}
					on:click={() => onClickJoker(index)}
				>
					<JokerCard
						width="w-[16vh]"
						jokerId={joker.jokerId}
						editionId={joker.edition}
						animateCard={true}
						sellAmount={joker.sellAmount}
						sellable={state.phase === 1}
					/>
				</div>
			{/each}
		</div>
		<div class="text-left text-2xl-r">{state.jokers.length}/5</div>

		{#if state.phase === 0}
			<!-- Fase normal de juego -->
			<div class="h-[63vh] grid grid-rows-[33%_33%_12%] gap-[8%]">
				<!--Played cards-->
				<div
					class="flex justify-between ml-[10%] mr-[10%]"
					style="width: calc(80% - 13vh);"
				>
					{#each state.playedCards as card, index (card.id)}
						<div
							transition:fly={{
								y: 100,
								duration: animationSpeed * 5,
							}}
							class="w-[1vh]"
						>
							{#if index === indexToPlayAnim}
								<div
									in:fly={{
										y: 150,
										duration: animationSpeed * 3,
									}}
									out:fade={{
										duration: animationSpeed * 3,
									}}
									class="w-[14vh] text-center absolute mt-[-4vh] text-warning-300 text-3xl-r"
								>
									+{scorePlayAnim}
								</div>
							{/if}
							<GameCard
								width="w-[14vh]"
								card={card.card}
								animateCard={true}
							/>
						</div>
					{/each}
				</div>

				<!--Hand-->
				<div
					class="flex justify-between relative"
					style="width: calc(100% - 9vh);"
					use:dndzone={{
						items: state.handCards,
						flipDurationMs: animationSpeed,
						type: "hand",
						dropTargetStyle: { outline: "solid 0px" },
					}}
					on:consider={handleDndConsiderCards}
					on:finalize={handleDndFinalizeCards}
				>
					{#each state.handCards as card, index (card.id)}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div
							animate:flip={{ duration: animationSpeed }}
							class={`w-[5vh] h-full transition-transform duration-[${animationSpeed * 2}] ease-in-out
									${card.picked ? "mt-[-5%]" : ""}`}
							on:click={() => onClickHand(index)}
						>
							<GameCard
								card={card.card}
								width="w-[14vh]"
								animateCard={true}
							/>
						</div>
					{/each}
				</div>

				<!--Action buttons-->
				<div class="flex justify-center gap-[4%]">
					<button
						class="btn variant-filled-tertiary w-[35%] text-5xl-r"
						on:click={onPlayHand}
						>Play
					</button>
					<div class="flex w-[15%]">
						<button
							class="btn variant-filled-surface rounded-l-md rounded-r-none w-full text-5xl-r"
							on:click={onSortR}
						>
							R
						</button>
						<button
							class="btn variant-filled-surface rounded-r-md rounded-l-none w-full text-5xl-r"
							on:click={onSortS}
						>
							S
						</button>
					</div>
					<button
						class="btn variant-filled-error w-[35%] text-5xl-r"
						on:click={onDiscard}
						>Discard
					</button>
				</div>
			</div>
		{:else if state.phase === 1}
			<!--Shop container-->
			<div
				class="h-[63vh] card p-3 flex flex-col gap-3"
				transition:fly={{
					y: 500,
					duration: animationSpeed * 3,
					easing: bounceOut,
				}}
			>
				<!--Joker row-->
				<div class="h-[50%] w-full flex gap-2">
					<div
						class="w-[25%] h-full flex flex-col gap-3 p-3 content-center text-4xl-r"
					>
						<button
							class="w-full h-[50%] card variant-filled-error tv-filter"
							on:click={onNextPhase}
						>
							<p>Next</p>
							<p>Round</p>
						</button>
						<button
							class="w-full h-[50%] card variant-filled-primary tv-filter"
							on:click={onReroll}
						>
							<p>Reroll</p>
							<p class="text-5xl-r">{state.rerollAmount}$</p>
						</button>
					</div>
					<div
						class="w-[75%] card variant-filled-surface p-3 flex justify-around"
					>
						{#each state.shop.jokerRow as joker, index (joker.id)}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div
								animate:flip={{ duration: animationSpeed }}
								in:fly={{
									y: -300,
									duration: animationSpeed * 3,
									easing: cubicOut,
								}}
								class="flex flex-col justify-between gap-3"
								on:click={() => onBuyJoker(index)}
							>
								<JokerCard
									width="w-[16vh]"
									jokerId={joker.jokerId}
									editionId={joker.edition}
									animateCard={true}
								/>
								<div class={priceChip}>
									{joker.sellAmount}$
								</div>
							</div>
						{/each}
					</div>
				</div>
				<!--Bottom rows-->
				<div class="h-[50%] w-full flex gap-3">
					<!--Voucher row-->
					<div class="w-[50%] h-full card variant-filled-surface p-4">
						<div class="w-full h-full card flex justify-around">
							{#each state.shop.voucherRow as voucher, index (voucher.id)}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<div
									animate:flip={{ duration: animationSpeed }}
									class="flex flex-col justify-between gap-3 p-2"
									on:click={() => onBuyVoucher(index)}
								>
									<VoucherCard
										width="w-[14vh]"
										voucherId={voucher.voucherId}
										animateCard={true}
									/>
									<div class={priceChip}>
										{voucher.sellAmount}$
									</div>
								</div>
							{/each}
						</div>
					</div>
					<!--Package row-->
					<div
						class="w-[50%] h-full card variant-filled-surface flex justify-around p-3"
					>
						{#each state.shop.packageRow as pack, index (pack.id)}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div
								animate:flip={{ duration: animationSpeed }}
								class="flex flex-col justify-between gap-3"
								on:click={() => onBuyPack(index)}
							>
								<PackageCard
									width="w-[16vh]"
									packageId={pack.packageId}
									animateCard={true}
								/>
								<div class={priceChip}>
									{pack.sellAmount}$
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else if state.phase == 2}
			<!-- Voucher phase -->
			<div class="h-[63vh] grid grid-rows-[33%_33%_12%] gap-[8%]">
				<div class=""></div>

				<!-- Voucher hand -->
				<div
					class="flex justify-between relative"
					style="width: calc(100% - 9vh);"
					use:dndzone={{
						items: state.vouchers,
						flipDurationMs: animationSpeed,
						type: "vouchers",
						dropTargetStyle: { outline: "solid 0px" },
					}}
					on:consider={handleDndConsiderVouchers}
					on:finalize={handleDndFinalizeVouchers}
				>
					{#each state.vouchers as voucher, index (voucher.id)}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div
							animate:flip={{ duration: animationSpeed }}
							class={`w-[5vh] h-full transition-transform duration-[${animationSpeed * 2}] ease-in-out
									${voucher.picked ? "mt-[-5%]" : ""}`}
							on:click={() => onClickHandVoucher(index)}
						>
							<VoucherCard
								width="w-[14vh]"
								voucherId={voucher.voucherId ?? 0}
								animateCard={true}
							/>
						</div>
					{/each}
				</div>

				<!-- Action buttons -->
				<div class="flex justify-center gap-[4%]">
					<button
						class="btn variant-filled-tertiary w-[35%] text-5xl-r"
						on:click={onPlayVoucher}
						>Use Voucher
					</button>
					<button
						class="btn variant-filled-error w-[35%] text-5xl-r"
						on:click={onNextPhase}
						>Next Round
					</button>
				</div>
			</div>
		{/if}
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
			<div
				class={`w-full card text-5xl-r text-right p-4 mt-[5%] ${state.timeLeft <= 0 ? "variant-filled-error" : ""}`}
			>
				{state.timeLeft}s
			</div>
		</div>

		<!--Debug buttons-->
		<div class="flex flex-col gap-2">
			<button class="btn variant-filled-surface" on:click={onNextPhase}>
				Next phase
			</button>
			<button class="btn variant-filled-surface" on:click={onAddCard}>
				Add card
			</button>
			<button class="btn variant-filled-surface" on:click={onAddMoney}>
				Add money
			</button>
			<button
				class="btn variant-filled-surface"
				on:click={onRemoveVoucher}
			>
				Remove voucher
			</button>
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
				<div class="absolute">
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

	.text-6xl-r {
		font-size: 5vh;
		line-height: 1;
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
