<script lang="ts">
  import  AvatarDisplay  from "../../lib/components/AvatarDisplay.svelte";
  import { goto } from "$app/navigation";
  import { base } from '$app/paths';
  import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();

  // Lobby type
  type Lobby = {
    key: number
    host: string
    icon: number
    players: number
  };

  // List of lobbies, includes testing data for viewing purposes
  let lobbies: Lobby[] = [
    {key: 0, host: 'Victor', icon: 3, players: 4},
    {key: 1, host: 'Rubén', icon: 8, players: 8},
    {key: 3, host: 'Jorge', icon: 2, players: 5},
    {key: 4, host: 'Carlos', icon: 1, players: 3},
    {key: 5, host: 'Ana', icon: 5, players: 6},
    {key: 6, host: 'Miguel', icon: 7, players: 8},
    {key: 7, host: 'Laura', icon: 4, players: 2},
    {key: 8, host: 'Sofía', icon: 9, players: 7},
    {key: 9, host: 'Pablo', icon: 6, players: 4},
    {key: 10, host: 'Elena', icon: 2, players: 8},
    {key: 11, host: 'Daniel', icon: 4, players: 3},
    {key: 12, host: 'Javier', icon: 2, players: 8},
    {key: 13, host: 'Isabel', icon: 3, players: 8},
    {key: 14, host: 'Raúl', icon: 4, players: 7},
    {key: 15, host: 'Patricia', icon: 5, players: 5},
    {key: 16, host: 'Manuel', icon: 6, players: 4},
    {key: 17, host: 'Cristina', icon: 7, players: 8},
    {key: 18, host: 'Fernando', icon: 8, players: 6},
    {key: 19, host: 'Marta', icon: 9, players: 5},
];

  const modalJoinLobbyCode: ModalSettings = {
      type: 'component',
      component: 'joinLobbyCodeModal'
  };

  function clickOnInsertCode(){
    modalStore.trigger(modalJoinLobbyCode);
  }

</script>

<!-- Title -->
<h1 class="ml-[-66%]  mt-[4%] text-[5vmin]">PUBLIC LOBBIES</h1>

<!-- Buttons -->
<div class="flex flex-row gap-[10vmin] mt-[3%] ml-[1%] text-[3.5vmin]"> 
  <button type="button" class="btn btn-lg variant-filled w-[18vmin]" on:click={clickOnInsertCode}>INSERT CODE</button>
  <button type="button" class="btn btn-lg variant-filled">MATCHMAKING</button>
  <div class="ml-[109vmin]">
    <button type="button" class="btn btn-lg variant-filled" on:click={() => goto(base + "/home")}>BACK</button>
  </div>
</div>


<!-- Lobbies -->
<div class="lobby-list-container ml-[2%] mt-[2%] overflow-y-auto h-[60vh]">
  <nav>
    <ul>
      {#each lobbies as lobby, index (lobby.key)}
        <li>
          <div class={`flex flex-row items-center h-[10vmin] w-[176vmin] p-4 ${index % 2 == 0 ? 'bg-surface-700' : 'bg-surface-800'}`}>
            <AvatarDisplay icon={lobby.icon} width={60}/>
            <span class="text-[4vmin] ml-4">{lobby.host}</span>
            <div class="ml-auto">
                <button class={`badge text-[3vmin] px-9 py-4 ${lobby.players != 8 ? 'bg-primary-500' : 'bg-error-500'}`}> JOIN {lobby.players} / 8</button>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </nav>
</div>




