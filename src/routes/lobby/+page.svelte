<script lang="ts">
  import AvatarDisplay from "../../lib/components/AvatarDisplay.svelte";
  import { userDataStore, lobbyStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";
  import { base } from "$app/paths";
  import { apiBase, joinLobbyPath, exitLobbyPath } from "$lib/paths";
  import { get } from "svelte/store";
  import { fetchExitLobby } from "$lib/fetch/lobbyFetch";
  import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";

  const modalStore = getModalStore();
  
  const modalShare: ModalSettings = {
    type: 'component',
    component: 'shareModal'
  }

  let actual = 8; // Actual number of players
  let max = 8; // Maximum number of players
  let publicString = "PUBLIC"; // String to show if the lobby is public or private
  let publicValue = true; // Boolean to know if the lobby is public or private
  let code = $lobbyStore.code; // Code of the lobby
  let host = $lobbyStore.host; // Boolean to know if the player is the host

  let error = "";

  // Function to switch the public value
  function onSwitchPublic() {
    if (host) publicString = publicValue ? "PRIVATE" : "PUBLIC";
    publicValue = !publicValue;
    console.log(publicValue);
  }

  // Function to copy code to clipboard
  function onCopyCode() {
    navigator.clipboard.writeText(code);
  }

  // Function to start the game
  function onStart() {
    console.log("Starting game");
  }

  // Player type
  type Player = {
    key: number;
    username: string;
    icon: number;
    host: boolean;
  };

  // Local player
  let username: string = $userDataStore.username;
  let avatar: number = $userDataStore.icon;

  // List of players, includes testing data for viewing purposes
  let players: Player[] = [
    { username: username, icon: avatar, key: 0, host: true },
    { username: "Player2", icon: 2, key: 1, host: false },
    { username: "Player3", icon: 3, key: 2, host: false },
    { username: "Player4", icon: 4, key: 3, host: false },
    { username: "Player5", icon: 5, key: 4, host: false },
    { username: "Player6", icon: 6, key: 5, host: false },
    { username: "Player7", icon: 7, key: 6, host: false },
    { username: "Player8", icon: 8, key: 7, host: false },
  ];

  /**
   * Function to kick a player of the list that has index
   * @number index
   * */
  function onKickPlayer(index: number) {
    console.log("Kicking player", players[index].username);
    players = [...players.slice(0, index), ...players.slice(index + 1)];
    actual = players.length;
  }

  /**
   * Opens the InviteFriends modal
   */
  function onShare() {
    modalStore.trigger(modalShare);
  }

  /**
   * Function to leave lobby
   * @async
   * */
  async function onLeave() {
    await fetchExitLobby();
    goto(base + "/home");
  }

  /**
   * Adds user to the list
   * @param username
   * @param icon
   */
  function addPlayer(username: string, icon: number) {
    let newUser: Player = {
      username: username,
      icon: icon,
      key: players.length,
      host: false,
    };
    players = [...players, newUser];
  }
</script>

<div class="w-[95vw] mt-[5vmin]">
  <!-- Lobby header -->
  <div class="flex w-full justify-between">
    <div class="flex gap-[2vw] text-[clamp(15px,3.5vmin,9999px)] items-center">
      <h1 class="text-[clamp(15px,5vmin,9999px)]">LOBBY</h1>
      <div>{actual} / {max}</div>
      <button
        type="button"
        class="btn btn-lg variant-filled"
        on:click={onSwitchPublic}>{publicString}</button
      >
      <h2>Code : {code}</h2>
      <button
        type="button"
        class="btn btn-lg variant-filled"
        on:click={onCopyCode}>Copy</button
      >
      <button type="button" class="btn btn-lg variant-filled" on:click={onShare}
        >Share</button
      >
    </div>
    <button type="button" class="btn btn-lg variant-filled"
      ><img src="icons/chat.png" alt="chat" class="w-[20px]" /></button
    >
  </div>

  <!-- Players -->
  <div class="mt-[4%] gap-[5vmin] grid grid-cols-2 md:grid-cols-4">
    {#each players as player, index (player.key)}
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
        {#if host}
          {#if index != 0}
            <button
              class="btn btn-lg variant-filled mt-[30%]"
              on:click={() => onKickPlayer(index)}>Kick</button
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
        on:click={onStart}>Start</button
      >
    {/if}
  </div>
</div>
