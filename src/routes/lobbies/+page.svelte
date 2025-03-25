<script lang="ts">
  import AvatarDisplay from "../../lib/components/AvatarDisplay.svelte";
  import { goto } from "$app/navigation";
  import { base } from '$app/paths';
  import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import { getAllLobbiesFetch, joinLobbyFetch } from "$lib/fetch/lobbyFetch";
  import { lobbyStore } from "$lib/stores";
  import type { LobbyDisplay } from "$lib/interfaces";

  const modalStore = getModalStore();

  // Modal settings
  const modalJoinLobbyCode: ModalSettings = {
    type: 'component',
    component: 'joinLobbyCodeModal'
  };

  const modalMatchMaking: ModalSettings = {
    type: 'component',
    component: 'matchMakingModal'
  };

  // List of lobbies
  let lobbies: LobbyDisplay[] = [];
  let isLoading = true;
  let error = '';

  // Load lobbies when mounting the component
  onMount(async () => {
    await refreshLobbies();
  });

  // Function to refresh the list of lobbies
  async function refreshLobbies() {
    try {
      isLoading = true;
      lobbies = await getAllLobbiesFetch();
    } catch (err: any) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  // Function to join a lobby
  async function handleJoinLobby(lobbyId: string) {
    await joinLobbyFetch(lobbyId);
    
    // Update the store with the lobby code
    lobbyStore.update(() => ({
      code: lobbyId,
      host: false
    }));
    
    // Redirect to the lobby page
    goto(base + "/lobby");
  }

  function clickOnInsertCode() {
    modalStore.trigger(modalJoinLobbyCode);
  }

  function clickOnMatchMaking() {
    modalStore.trigger(modalMatchMaking);
  }
</script>

<!-- Headers -->
<div class="w-[85vw] mt-[8vh]">
  <!-- Title -->
  <h1 class="ml-[2vw] text-[5vmin] text-left">PUBLIC LOBBIES</h1>

  <!-- Buttons -->
  <div class="flex justify-between mt-[3%] ml-[1%] ">
    <div class="flex gap-[10vmin]"> 
      <button type="button" class="btn btn-lg variant-filled text-2" on:click={clickOnInsertCode}>INSERT CODE</button>
      <button type="button" class="btn btn-lg variant-filled text-2" on:click={clickOnMatchMaking}>MATCHMAKING</button>
      <button type="button" class="btn btn-lg variant-filled text-2" on:click={refreshLobbies}>REFRESH</button>
    </div>  
    <button type="button" class="btn btn-lg variant-filled text-2" on:click={() => goto(base + "/home")}>BACK</button>
  </div>
</div>

<!-- Lobbies -->
<div class="w-[85vw] mt-[8vh] overflow-y-auto h-[60vh] rounded-lg">
  {#if isLoading}
    <div class="flex justify-center items-center h-full">
      <p class="text-[4vmin]">Cargando lobbies...</p>
    </div>
  {:else if lobbies.length === 0}
    <div class="flex justify-center items-center h-full">
      <p class="text-[4vmin]">No hay lobbies disponibles</p>
    </div>
  {:else}
    <nav>
      <ul>
        {#each lobbies as lobby, index (lobby.key)}
          <li>
            <div class={`flex flex-row items-center h-[10vmin] w-full p-4 ${index % 2 == 0 ? 'bg-surface-700' : 'bg-surface-800'}`}>
              <AvatarDisplay icon={lobby.icon || 1} width={60}/>
              <span class="text-[4vmin] ml-4">{lobby.host}</span>
              <div class="ml-auto flex items-center gap-4">
                {#if lobby.rounds}
                  <span class="text-[2.5vmin]">Rondas: {lobby.rounds}</span>
                {/if}
                {#if lobby.points}
                  <span class="text-[2.5vmin]">Puntos: {lobby.points}</span>
                {/if}
                <button 
                  class={`badge text-[3vmin] px-9 py-4 rounded-lg ${(lobby.players || 1) < (lobby.maxPlayers || 8) ? 'bg-primary-500' : 'bg-error-500'}`}
                  on:click={() => handleJoinLobby(lobby.key)}
                > 
                  JOIN {lobby.players || 1} / {lobby.maxPlayers || 8}
                </button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</div>