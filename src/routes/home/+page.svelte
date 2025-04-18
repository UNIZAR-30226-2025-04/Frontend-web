<script lang="ts">
  import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
  import { lobbyStore, userDataStore } from '$lib/stores';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { Lobby } from '$lib/interfaces';
  import AvatarDisplay from "$lib/components/AvatarDisplay.svelte";
  import { initializeSocket } from "$lib/sockets-utils/lobbySocket";
  import WebSocketTest from "$lib/components/WebSocketTest.svelte";

  const modalStore = getModalStore();
  
  const modalInfoChange: ModalSettings = {
    type: 'component',
    component: 'infoChangeModal'
  }

  const modalCreateLobby: ModalSettings = {
    type: 'component',
    component: 'createLobbyModal'
  }

  const modalInbox: ModalSettings = {
    type: 'component',
    component: 'inboxModal'
  }

  const modalFriends: ModalSettings = {
    type: 'component',
    component: 'friendsModal'
  }

  // TO TEST
  let showWsTest = false;
  let hideTestButton = false;

  function clickOnJoin(){
    goto(base+"/lobbies");
  }
  
  function clickOnProfile(){
    modalStore.trigger(modalInfoChange);
  }

  function clickOnHost(){
    modalStore.trigger(modalCreateLobby);
  }

  function clickOnInbox(){
    modalStore.trigger(modalInbox);
  }

  function clickOnFriends(){
    modalStore.trigger(modalFriends);
  }

  onMount(() => {
    // We reset the lobby store in case on forcefull exit
    // May change later to a "is user in lobby" enpoint fetch
    const defaultLobby:Lobby = {
      code: "0000",
      host:false,
      players:[],
      isPublic: false
    }
    lobbyStore.set(defaultLobby);
    
    if (!$userDataStore.token) {
      goto(base + '/');
    }
  });

  function toggleWsTest() {
    showWsTest = !showWsTest;
  }
</script>

<div class="container h-full mx-auto flex justify-center items-center">
  <div class="flex flex-col space-y-10 p-4 w-full max-w-md">
    <div class="text-center">
      <div class="flex justify-center mb-6">
      </div>
    </div>
    
    <div class="grid grid-cols-1 gap-4">
      {#if !hideTestButton}
        <button class="btn variant-filled-tertiary" on:click={toggleWsTest}>
          Prueba WebSocket
        </button>
      {/if}
    </div>
  </div>
</div>

{#if showWsTest}
  <WebSocketTest />
{/if}

<!-- Game logo -->
<img class='mt-[2vh] h-[50vmin] w-auto' src='nogler2.png' alt="Nogler" />

  <!-- Button bar -->
  <div class="gap-[2vmin] mt-[4%] flex">
    <!-- Profile card -->
    <div class="card p-3 text-[clamp(14px,1.7vmin,999px)]">
      Profile
      <!-- Profile button -->
      <button class="block card p-3 mt-3" on:click={clickOnProfile}>
        {$userDataStore.username}
      </button>
    </div>

    <!-- Game buttons -->
    <div class="card flex p-3 gap-3">
      <!-- JOIN -->
      <button class="block card p-3 content-center text-[clamp(20px,3.5vmin,999px)] w-[clamp(100px,17vmin,999px)]" on:click={clickOnJoin}>
        JOIN
      </button>

      <!-- HOST -->
      <button class="block card p-3 content-center text-[clamp(20px,3.5vmin,999px)] w-[clamp(100px,17vmin,999px)]" on:click={clickOnHost}>
        HOST
      </button>

      <!-- INBOX -->
      <button class="block card p-3 content-center text-[clamp(20px,3.5vmin,999px)] w-[clamp(100px,17vmin,999px)]" on:click={clickOnInbox}>
        INBOX
      </button>

      <!-- FRIENDS -->
      <button class="block card p-3 content-center text-[clamp(20px,3.5vmin,999px)] w-[clamp(100px,17vmin,999px)]" on:click={clickOnFriends}>
        FRIENDS
      </button>
    </div>

    <!-- Github button -->
    <div class="content-center">
      <a href="https://github.com/UNIZAR-30226-2025-04">
        <img src="github.svg" alt="Github logo" class="w-[clamp(40px,4vmin,999px)] mx-auto"/>
        <div class="card p-3 text-[clamp(14px,1.7vmin,999px)]">
          Github
        </div>
      </a>
    </div>
  </div> 


<style>
.card{
  border-width: 1px;
}
</style>