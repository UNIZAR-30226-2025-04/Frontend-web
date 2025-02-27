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
  import InformationChangeFormModal from '$lib/components/InformationChangeFormModal.svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

  // Modal signleton setup, once per proyect
  import { initializeStores, Modal } from '@skeletonlabs/skeleton';
  initializeStores();

  const modalRegistry: Record<string, ModalComponent> = {
    infoChangeModal: { ref: InformationChangeFormModal },
  };
  
</script>

<Modal components={modalRegistry}/>
<slot />
