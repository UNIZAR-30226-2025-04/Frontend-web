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

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup, type ModalComponent } from '@skeletonlabs/skeleton';
	import CreateLobbyFormModal from '$lib/components/CreateLobbyFormModal.svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	// Modal signleton setup, once per proyect
	import { initializeStores, Modal } from '@skeletonlabs/skeleton';
	import JoinLobbyCodeModal from '$lib/components/JoinLobbyCodeModal.svelte';
    import FriendsModal from '$lib/components/FriendsModal.svelte';
    import InboxModal from '$lib/components/InboxModal.svelte';
  	import InformationChangeFormModal from '$lib/components/InformationChangeFormModal.svelte';
	import MatchMakingModal from '$lib/components/MatchMakingModal.svelte';
	
	initializeStores();

  	const modalRegistry: Record<string, ModalComponent> = {
		infoChangeModal: { ref: InformationChangeFormModal },
		createLobbyModal: { ref: CreateLobbyFormModal },
		friendsModal: { ref : FriendsModal },
		inboxModal: { ref : InboxModal },
		joinLobbyCodeModal: {ref: JoinLobbyCodeModal},
		matchMakingModal: {ref: MatchMakingModal}
	};

  
</script>

<Modal components={modalRegistry}/>
<slot />
