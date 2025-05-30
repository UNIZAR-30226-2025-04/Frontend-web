<script lang="ts">
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";
	import AvatarDisplay from "$lib/components/AvatarDisplay.svelte";
	import { exitLobby, initializeSocket, kickUser } from "$lib/sockets-utils/lobbySocket";
	import { lobbyStore, socketStore, userDataStore, unreadMessages } from "$lib/stores";
	import {
		getDrawerStore,
		getModalStore,
		type DrawerSettings,
		type ModalSettings,
	} from "@skeletonlabs/skeleton";
	import { onDestroy, onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { get } from "svelte/store";
	import { startGame } from "$lib/sockets-utils/gameSocket";
	import { updateLobbyVisibility } from "$lib/fetch/lobbyFetch";
	import { markMessagesAsRead } from "$lib/sockets-utils/chatAddMessage";

	const modalStore = getModalStore();
	const drawerStore = getDrawerStore();

	const settingsChat: DrawerSettings = {
		id: "chat",
		position: "right",
		width: "w-[40%]",
		padding: "p-4",
	};

	const modalShare: ModalSettings = {
		type: "component",
		component: "shareModal",
	};

	let max = 8; // Maximum number of players
	let autoStart = false;
	$: actual = $lobbyStore.players.length; // Actual number of players
	$: host = $lobbyStore.host; // Boolean to know if the player is the host
	$: players = $lobbyStore.players; // List of players
	$: mode = $lobbyStore.mode;	// Mode of the lobby

	$: if(!autoStart && mode === 2 && $lobbyStore.players.length === 1 && host){
		console.log("AUTO STARTING");
		autoStart = true;
		setTimeout(() => startGame(), 500);
	}

	// Function to switch the public value
	async function onSwitchPublic() {
		if (host && mode < 2) {
			// Toggle the visibility state
			const newVisibility = mode === 1? 0:1;
						
			await updateLobbyVisibility(newVisibility)
		}
	}

	// Function to start the game
	function onStart() {
		if(!autoStart && $lobbyStore.players.length >= 1){
			autoStart = true;
			setTimeout(() => { startGame(); autoStart = false}, 500);
		}
		
	}
	
	// Function to copy code to clipboard
	function onCopyCode() {
		navigator.clipboard.writeText($lobbyStore.code);
	}


	/**
	 * Function to kick a player of the list that has index
	 * @param username
	 */
	function onKickPlayer(username: string) {
		kickUser(username);
	}

	/**
	 * Opens the InviteFriends modal
	 */
	function onShare() {
		modalStore.trigger(modalShare);
	}

	/**
	 * Function to leave lobby, calls socket to exit
	 * */
	function onLeave() {
		exitLobby();
	}

	function openDrawer() {
		markMessagesAsRead();
		drawerStore.open(settingsChat);
	}

	onMount(() => {
		initializeSocket();
	});

	onDestroy(() => {
		
	});

</script>

<div class="w-[95vw] mt-[5vmin]">
	<!-- Lobby header -->
	<div class="flex w-full justify-between">
		<div
			class="flex gap-[2vw] text-[clamp(15px,3.5vmin,9999px)] items-center"
		>
			<h1 class="text-[clamp(15px,5vmin,9999px)]">LOBBY</h1>
			<div>{actual} / {max}</div>
			<button
				type="button"
				class="btn btn-lg variant-filled"
				on:click={onSwitchPublic}>
				{#if mode === 0}
					PRIVATE
				{:else if mode === 1}
					PUBLIC
				{:else if mode === 2}
					VS IA
				{:else}
					LOADING
				{/if}
			</button>
			<h2>Code : {$lobbyStore.code}</h2>
			<button
				type="button"
				class="btn btn-lg variant-filled"
				on:click={onCopyCode}>Copy</button
			>
			<button
				type="button"
				class="btn btn-lg variant-filled"
				on:click={onShare}>Share</button
			>
		</div>
		<button
			type="button"
			class="btn btn-lg variant-filled relative"
			on:click={openDrawer}
		>
			<img src="icons/chat.png" alt="chat" class="w-[20px]" />
			{#if $unreadMessages}
				<span class="notification-dot"></span>
			{/if}
		</button>
	</div>

	<!-- Players -->
	<div class="mt-[4%] gap-[5vmin] grid grid-cols-2 md:grid-cols-4">
		{#each players as player (player.key)}
			<div
				animate:flip={{ duration: 500, easing: cubicOut }}
				class="block card card-hover shadow-xl space-y-6 text-left p-6"
				style="flex: 0 0 40vmin;"
			>
				<AvatarDisplay icon={player.icon} width={100} />
				<div class="text-2xl">{player.username}</div>
				{#if player.host}
					<h1 class="text-green-500 text-3xl">HOST</h1>
				{/if}
				{#if $lobbyStore.host}
					{#if player.username !== $userDataStore.username}
						<button
							class="btn btn-lg variant-filled mt-[30%]"
							on:click={() => onKickPlayer(player.username)}>Kick</button
						>
					{/if}
				{/if}
			</div>
		{/each}
	</div>

	<!-- Leave / Start button -->
	<div class="flex gap-[3.5vw] mt-[3%] mb-[3%]">
		<button
			type="button"
			class="btn btn-lg variant-filled text-2xl w-[21vw]"
			on:click={onLeave}>Leave</button
		>
		{#if host}
			<button
				type="button"
				class="btn btn-lg variant-filled text-2xl w-[21vw]"
				on:click={onStart}>
				{#if mode === 2}
					Starting game...
				{:else}
					Start
				{/if}
			</button>
		{/if}
	</div>
</div>

<style>
	.notification-dot {
		position: absolute;
		top: -5px;
		right: -5px;
		width: 10px;
		height: 10px;
		background-color: #FF4136;
		border-radius: 50%;
		animation: pulse 1.5s infinite;
	}
	
	@keyframes pulse {
		0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 65, 54, 0.7); }
		70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 65, 54, 0); }
		100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 65, 54, 0); }
	}
</style>
