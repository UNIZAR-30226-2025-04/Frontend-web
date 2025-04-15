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
	    type VoucherItem
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
		timeLeft: 30,
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

	// Mock players for the player selection dialog
	let mockPlayers = [
		{ id: 1, username: "Username1", avatar: "icons/pxArt(4).png" },
		{ id: 2, username: "Username2", avatar: "icons/pxArt(4).png" },
		{ id: 3, username: "Username3", avatar: "icons/pxArt(4).png" },
		{ id: 4, username: "Username4", avatar: "icons/pxArt(4).png" },
		{ id: 5, username: "Username5", avatar: "icons/pxArt(4).png" },
		{ id: 6, username: "Username6", avatar: "icons/pxArt(4).png" },
		{ id: 7, username: "Username7", avatar: "icons/pxArt(4).png" },
		{ id: 8, username: "Username8", avatar: "icons/pxArt(4).png" },
		{ id: 9, username: "Username9", avatar: "icons/pxArt(4).png" },
		{ id: 10, username: "Username10", avatar: "icons/pxArt(4).png" }
	];

	// Flag to show the player selection dialog
	let showPlayerSelection = false;
	// Store the selected player
	let selectedPlayer: any = null;
	// Store the cards that triggered the player selection
	let actionCards: any[] = [];

	// Añadir esta variable para controlar la fase de vouchers
	let voucherPhase = false;

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
	 * Adds a voucher card to the player's hand
	 * @param voucherId ID of the voucher to add
	 */
	function addVoucherToHand(voucherId: number) {
		// Get voucher info from directory
		const voucherInfo = voucherDirectory[voucherId];
		
		state.handCards.push({
			id: getNextKey(),
			voucherId: voucherId,
			isVoucher: true,
			picked: false,
			targetType: voucherInfo.targetType,
			targetCount: voucherInfo.targetCount,
			card: { rank: "", suit: "", overlay: 0, faceUp: true } // Empty card object to satisfy type
		});
		state.handCards = [...state.handCards]; // Trigger reactivity
	}
	
	/**
	 * Handles the play action, processing both normal cards and vouchers
	 */
	function onPlay() {
		if (actionBlocked) return;

		const pickedCards = state.handCards.filter((card) => card.picked);
		const count = pickedCards.length;

		if (count > 0 && count < 6) {
			// Separate vouchers and normal cards
			const vouchers = pickedCards.filter(card => card.isVoucher);
			const normalCards = pickedCards.filter(card => !card.isVoucher);
			
			// Check if there are vouchers that require player selection
			const targetVouchers = vouchers.filter(voucher => voucher.targetType === true);
			
			// If there are vouchers requiring selection, show the dialog
			if (targetVouchers.length > 0) {
				actionCards = targetVouchers;
				showPlayerSelection = true;
				return;
			}
			
			// Process vouchers that don't require selection (targetType = false)
			for (const voucher of vouchers.filter(v => v.targetType === false)) {
				applyVoucherEffect(voucher.voucherId);
			}
			
			// Remove processed vouchers from hand
			if (vouchers.length > 0) {
				state.handCards = state.handCards.filter(card => 
					!(card.picked && card.isVoucher)
				);
			}
			
			// Play normal cards directly
			if (normalCards.length > 0) {
				playCards(normalCards);
			}
		}
	}

	/**
	 * Applies the effect of a voucher based on its ID
	 * @param voucherId The ID of the voucher to apply
	 */
	function applyVoucherEffect(voucherId: number) {
		// Implement different effects based on voucher ID
		if (voucherId === 0) {
			// Example: Increase blue score
			state.blueScore += 500;
		} else if (voucherId === 1) {
			// Example: Draw additional cards
			for (let i = 0; i < 2; i++) {
				setTimeout(() => onDeck(), drawCardAnimSpeed * i + drawCardDelay);
			}
		}
		// Add more voucher effects as needed
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
			state.vouchers.push(state.shop.voucherRow[index]);
			state.shop.voucherRow.splice(index, 1);
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

	// Interval for timer, aux variable
	let interval: any;

	onMount(() => {
		// We initialize the socket
		initializeSocket();

		// Interval for the Time left clock
		interval = setInterval(() => {
			if (state.timeLeft > 0) {
				state.timeLeft--;
			} else if (state.timeLeft === 0 && !voucherPhase && state.phase === 0) {
				// Cuando el tiempo llega a 0, activamos la fase de vouchers
				voucherPhase = true;
				
				// Movemos los vouchers del jugador a la mano
				moveVouchersToHand();
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

	function onAddVoucher() {
		const newVoucher = Math.floor(Math.random() * voucherDirectory.length);
		const newVoucherItem = {
			id: getNextKey(),
			voucherId: newVoucher,
			sellAmount: Math.floor(Math.random() * 30) + 1,
			picked: false,
		};
		state.activeVouchers.push(newVoucherItem);
		state.vouchers.push(newVoucherItem);
		state.activeVouchers = state.activeVouchers;
		state.vouchers = state.vouchers;
	}

	function onClickHand(index: number) {
		const card = state.handCards[index];
		card.picked = !card.picked;
		state.handCards = [...state.handCards];
	}

	/**
	 * Mueve los vouchers del jugador a su mano cuando el tiempo llega a 0
	 */
	function moveVouchersToHand() {
		// Limpiamos las cartas normales de la mano
		state.handCards = [];
		
		// Añadimos los vouchers a la mano
		for (const voucher of state.vouchers) {
			const voucherInfo = voucherDirectory[voucher.voucherId];
			state.handCards.push({
				id: getNextKey(),
				voucherId: voucher.voucherId,
				isVoucher: true,
				picked: false,
				targetType: voucherInfo.targetType,
				targetCount: voucherInfo.targetCount,
				card: { rank: "", suit: "", overlay: 0, faceUp: true }
			});
		}
		
		// Actualizamos la mano para que se refleje en la UI
		state.handCards = [...state.handCards];
	}

	/**
	 * Modificar la función onNextPhase para manejar la transición entre fases
	 */
	function onNextPhase() {
		if (state.phase === 1) {
			// Si estamos en la fase de tienda, volvemos a la fase normal
			state.handCards = [];
			for (let i = 0; i < 8; i++) {
				setTimeout(
					() => {
						onDeck();
					},
					drawCardAnimSpeed * i + drawCardDelay,
				);
			}
			state.phase = 0;
			voucherPhase = false; // Reseteamos la fase de vouchers
			state.timeLeft = 30; // Reiniciamos el temporizador
		} else if (voucherPhase) {
			// Si estamos en la fase de vouchers, pasamos a la tienda
			voucherPhase = false;
			state.phase = 1;
			setupShop(); // Configuramos la tienda
		} else {
			// Si estamos en la fase normal, pasamos a la tienda
			state.phase = 1;
			setupShop(); // Configuramos la tienda
		}
	}

	/**
	 * Configura la tienda con nuevos items
	 */
	function setupShop() {
		state.shop = { jokerRow: [], voucherRow: [], packageRow: [] };
		
		// Añadir jokers a la tienda
		for (let i = 0; i < 3; i++) {
			const newJoker = Math.floor(Math.random() * jokerDirectory.length);
			const newEdition = Math.floor(Math.random() * jokerEditionsDirectory.length);
			state.shop.jokerRow.push({
				id: getNextKey(),
				jokerId: newJoker,
				edition: newEdition,
				sellAmount: Math.floor(Math.random() * 30) + 1,
				picked: false,
			});
		}
		
		// Añadir vouchers a la tienda
		for (let i = 0; i < 2; i++) {
			const newVoucher = Math.floor(Math.random() * voucherDirectory.length);
			state.shop.voucherRow.push({
				id: getNextKey(),
				voucherId: newVoucher,
				sellAmount: Math.floor(Math.random() * 30) + 1,
				picked: false,
			});
		}
		
		// Añadir paquetes a la tienda
		for (let i = 0; i < 2; i++) {
			const newPack = Math.floor(Math.random() * packageDirectory.length);
			const pack = packageDirectory[newPack];
			let content: CardItem[] | JokerItem[] | VoucherItem[] = [];
			
			// Configurar el contenido según el tipo de paquete
			if (pack.contentType === 0) {
				// Contenido de cartas
				content = <CardItem[]>[];
				for (let j = 0; j < pack.contentSize; j++) {
					content.push({
						id: getNextKey(),
						card: generateCard(true, true),
						picked: false,
					});
				}
			} else if (pack.contentType === 1) {
				// Contenido de jokers
				content = <JokerItem[]>[];
				for (let j = 0; j < pack.contentSize; j++) {
					const newJoker = Math.floor(Math.random() * jokerDirectory.length);
					const newEdition = Math.floor(Math.random() * jokerEditionsDirectory.length);
					content.push({
						id: getNextKey(),
						jokerId: newJoker,
						edition: newEdition,
						sellAmount: Math.floor(Math.random() * 30) + 1,
						picked: false,
					});
				}
			} else {
				// Contenido de vouchers
				content = <VoucherItem[]>[];
				for (let j = 0; j < pack.contentSize; j++) {
					const newVoucher = Math.floor(Math.random() * voucherDirectory.length);
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
		
		// Actualizar la tienda para que se refleje en la UI
		state.shop.jokerRow = [...state.shop.jokerRow];
		state.shop.voucherRow = [...state.shop.voucherRow];
		state.shop.packageRow = [...state.shop.packageRow];
	}

	/**
	 * Selects a player from the dialog
	 * @param player The player to select
	 */
	function selectPlayer(player: any) {
		selectedPlayer = player;
	}

	/**
	 * Sends the action to the selected player and closes the dialog
	 */
	function sendActionToPlayer() {
		if (!selectedPlayer) return;
		
		// We're only sending vouchers now
		console.log(`Sending voucher(s) to player ${selectedPlayer.username}`);
		
		// Here we would implement the actual logic to send the voucher to the player
		// through a socket connection
		
		// Remove the sent vouchers from the player's hand
		state.handCards = state.handCards.filter(card => 
			!(card.picked && card.isVoucher)
		);
		
		// Close the dialog and reset selection
		showPlayerSelection = false;
		selectedPlayer = null;
		actionCards = [];
	}

	/**
	 * Function to cancel the action and close the dialog
	 */
	function cancelAction() {
		showPlayerSelection = false;
		selectedPlayer = null;
		actionCards = [];
	}

	/**
	 * Plays the selected cards
	 * @param pickedCards The cards to play
	 */
	function playCards(pickedCards: any[]) {
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
	 * Debug function to add a voucher card to the player's hand
	 */
	function onAddVoucherToHand() {
		const randomVoucherId = Math.floor(Math.random() * voucherDirectory.length);
		addVoucherToHand(randomVoucherId);
	}

	/**
	 * Determines if a voucher can be sent to another player
	 * @param voucherId The ID of the voucher to check
	 * @returns True if the voucher can be sent to another player
	 */
	function isVoucherSendable(voucherId: number): boolean {
		// Define which voucher IDs can be sent to other players
		// Vouchers with even IDs (2, 4) can be sent to other players
		return voucherId % 2 === 0;
	}
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
		{/if}

		{#if state.phase === 0}
			<!--Vouchers label-->
			<div class="text-2xl-r mt-[3%]">Active consumables</div>
			<!--Vouchers-->
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
							voucherId={voucher.voucherId}
							animateCard={true}
						/>
					</div>
				{/each}
			</div>
		{:else if state.phase === 1}
			<!--Vouchers label-->
			<div class="text-2xl-r mt-[3%]">Your consumables</div>
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
							voucherId={voucher.voucherId}
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
			{#if voucherPhase}
				<!-- Fase de vouchers -->
				<div class="h-[63vh] grid grid-rows-[33%_33%_12%] gap-[8%]">
					<div class="text-5xl-r h-[12%] card variant-filled-surface p-5 text-center">
						VOUCHERS PHASE
					</div>
					
					<!-- Hand (solo vouchers) -->
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
								<VoucherCard
									width="w-[14vh]"
									voucherId={card.voucherId}
									animateCard={true}
								/>
							</div>
						{/each}
					</div>

					<!-- Action buttons -->
					<div class="flex justify-center gap-[4%]">
						<button
							class="btn variant-filled-tertiary w-[35%] text-5xl-r"
							on:click={onPlay}
							>Use Voucher
						</button>
						<button
							class="btn variant-filled-error w-[35%] text-5xl-r"
							on:click={onNextPhase}
							>Go to Shop
						</button>
					</div>
				</div>
			{:else}
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
										out:fade={{ duration: animationSpeed * 3 }}
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
								{#if card.isVoucher}
									<VoucherCard
										width="w-[14vh]"
										voucherId={card.voucherId}
										animateCard={true}
									/>
								{:else}
									<GameCard
										card={card.card}
										width="w-[14vh]"
										animateCard={true}
									/>
								{/if}
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
			{/if}
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
			<button class="btn variant-filled-surface" on:click={onDeck}>
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
			<button class="btn variant-filled-surface" on:click={onAddVoucherToHand}>
				Add Voucher to Hand
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

<!-- Player selection dialog -->
{#if showPlayerSelection}
<div 
	class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
	transition:fade={{ duration: animationSpeed * 3 }}
>
	<div 
		class="card variant-filled-surface p-8 max-w-4xl w-full text-center tv-filter"
		in:fly={{ y: 50, duration: animationSpeed * 3 }}
	>
		<h2 class="text-6xl-r mb-8">
			{actionCards.some(card => card.isVoucher) ? 'SEND VOUCHER TO' : 'USE CARD AGAINST'}
		</h2>
		
		<div class="grid grid-cols-5 gap-4 mb-8">
			{#each mockPlayers as player}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div 
					class="flex flex-col items-center cursor-pointer p-2"
					class:border-4={selectedPlayer && selectedPlayer.id === player.id}
					class:border-warning-500={selectedPlayer && selectedPlayer.id === player.id}
					class:rounded-lg={selectedPlayer && selectedPlayer.id === player.id}
					on:click={() => selectPlayer(player)}
				>
					<img src={player.avatar} alt="Player avatar" class="w-16 h-16 rounded-full mb-2" />
					<span class="text-2xl-r">{player.username}</span>
				</div>
			{/each}
		</div>
		
		<div class="flex justify-center gap-8">
			<button 
				class="btn variant-filled-tertiary w-[40%] text-4xl-r"
				on:click={sendActionToPlayer}
				disabled={!selectedPlayer}
			>
				SEND
			</button>
			<button 
				class="btn variant-filled-error w-[40%] text-4xl-r"
				on:click={cancelAction}
			>
				CANCEL
			</button>
		</div>
	</div>
</div>
{/if}
