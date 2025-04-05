<svelte:head>
  <style>
    @font-face {
      font-family: 'Pixelify Sans';
      src: url('fonts/PixelifySans-Medium.otf') format('woff');
    }
  </style>
</svelte:head>

<script lang="ts">
	import '../app.postcss';

	// Floating UI for Popup
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup, type ModalComponent } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	// Modal signleton setup, once per proyect
	import { initializeStores, Modal, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import CreateLobbyFormModal from '$lib/components/CreateLobbyFormModal.svelte';
	import JoinLobbyCodeModal from '$lib/components/JoinLobbyCodeModal.svelte';
    import FriendsModal from '$lib/components/FriendsModal.svelte';
    import InboxModal from '$lib/components/InboxModal.svelte';
  	import InformationChangeFormModal from '$lib/components/InformationChangeFormModal.svelte';
	import MatchMakingModal from '$lib/components/MatchMakingModal.svelte';
	import ShareModal from '$lib/components/ShareModal.svelte';
    import ChatDrawer from '$lib/components/ChatDrawer.svelte';

	// For all singletons
	initializeStores();

	const drawerStore = getDrawerStore();

  	const modalRegistry: Record<string, ModalComponent> = {
		infoChangeModal: { ref: InformationChangeFormModal },
		createLobbyModal: { ref: CreateLobbyFormModal },
		friendsModal: { ref : FriendsModal },
		inboxModal: { ref : InboxModal },
		joinLobbyCodeModal: {ref: JoinLobbyCodeModal},
		matchMakingModal: {ref: MatchMakingModal},
		shareModal: {ref: ShareModal},
	};
  
</script>

<Drawer>
	{#if $drawerStore.id === "chat" }
		<ChatDrawer/>
	{:else}
		<h1>ERROR!</h1>
	{/if}
</Drawer>
<Modal components={modalRegistry}/>
<slot />


<style>
	:global(body) {
		background-image: url('/5.jpg') !important;
		margin: 0;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		text-align: center;
		color: black;
		font-family: 'Pixelify Sans';
	}

</style>