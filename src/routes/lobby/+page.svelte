<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import AvatarDisplay from "$lib/components/AvatarDisplay.svelte";
  import { fetchExitLobby } from "$lib/fetch/lobbyFetch";
  import type { Lobby, publicInformationUser } from "$lib/interfaces";
  import { wsBase } from "$lib/paths";
  import { addMessage } from "$lib/sockets-utils/chatAddMessage";
  import { lobbyStore, socketStore, userDataStore } from "$lib/stores";
  import {
      getDrawerStore,
      getModalStore,
      type DrawerSettings,
      type ModalSettings,
  } from "@skeletonlabs/skeleton";
  import { io } from "socket.io-client";
  import { onDestroy, onMount } from "svelte";
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";
  import { get } from "svelte/store";

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

  let actual = 0; // Actual number of players
  let max = 8; // Maximum number of players
  let publicString = "PUBLIC"; // String to show if the lobby is public or private
  let publicValue = true; // Boolean to know if the lobby is public or private
  $: code = $lobbyStore.code; // Code of the lobby
  $: host = $lobbyStore.host; // Boolean to know if the player is the host

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

  // List of players
  let players: Player[] = [];

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
    exitLobby();
    //await fetchExitLobby();
    goto(base + "/home");
  }

  /**
   * Adds user to the list
   * @param username
   * @param icon
   */
  function addPlayer(username: string, icon: number) {
    if (username !== get(userDataStore).username) {
      let newUser: Player = {
        username: username,
        icon: icon,
        key: players.length,
        host: false,
      };
      players = [...players, newUser];
    }
  }

  function openDrawer() {
    drawerStore.open(settingsChat);
  }

  // Websocket code

  let socket: any;

  onMount(() => {
    console.log("Trying to connect to ws");
    socket = io(wsBase, {
      auth: {
        username: get(userDataStore).username,
        authorization: "Bearer " + get(userDataStore).token,
      },
      transports: ["websocket"],
    });

    // Connection events
    socket.on("connect", () => {
      console.log("-> connect:", socket.id);
      socketStore.set(socket);
    });

    socket.on("disconnect", () => {
      console.log("-> disconnect");
    });

    socket.on("new_user_in_lobby", (args: any) => {
      console.log("-> joined_lobby", args);
    });

    socket.on("error", function (error: any) {
      console.error("-> Error:", error);
    });

    socket.on("new_lobby_message", (args: any) => {
      console.log("-> new_lobby_message", args);
      console.log(args.username, args.user_icon, args.message);
      addMessage(args.username, args.user_icon, args.message);
    });

    socket.on("lobby_info", (args: any) => {
      console.log("-> lobby_info", args);

      players = [];
      let playersLobby: publicInformationUser[] = [];
      for (let i: number = 0; i < args.players.length; i++) {
        let newPlayer: Player = {
          key: players.length,
          username: args.players[i].username,
          icon: args.players[i].user_icon,
          host: args.players[i].username === args.creator.username,
        };
        console.log("Pushed player:", newPlayer);
        players.push(newPlayer);

        let newPlayer2: publicInformationUser = {
          username: args.players[i].username,
          icon: args.players[i].user_icon,
        };
        playersLobby.push(newPlayer2);
      }
      players = players;

      lobbyStore.update((lob: Lobby) => ({
        code: lob.code,
        host: args.creator.username === get(userDataStore).username,
        players: playersLobby,
      }));
    });

    socket.on("new_user_in_lobby", (args: any) => {
      console.log("-> new_user_in_lobby", args);
      // If it is not on the list
      if (
        players.find((p: Player) => p.username === args.username) === undefined
      ) {
        let newPlayer: Player = {
          key: players.length,
          username: args.username,
          icon: args.icon,
          host: false,
        };
        console.log("Pushed player:", newPlayer);
        players.push(newPlayer);
        players = players;
      }

      let playersLobby: publicInformationUser[] = get(lobbyStore).players;
      let newPlayer2: publicInformationUser = {
        username: args.username,
        icon: args.icon,
      };
      playersLobby.push(newPlayer2);

      lobbyStore.update((lob: Lobby) => ({
        code: lob.code,
        host: lob.host,
        players: playersLobby,
      }));
    });

    socket.on("player_left", (args: any) => {
      console.log("-> player_left", args);
      players = players.filter((play:Player) => play.username !== args.username);
    });

    socket.onAny((event: any, ...args: any) => {
      console.log(`-> Event recieved: ${event}`, args);
    });

    // Sending an event to let know the lobby that the user just joined
    console.log("<- Sending join_lobby:", get(lobbyStore).code);
    socket.emit("join_lobby", get(lobbyStore).code);

    // Getting all info on the lobby
    console.log("<- Sending get_lobby_info:", get(lobbyStore).code);
    socket.emit("get_lobby_info", get(lobbyStore).code);
  });

  function exitLobby(){
    // Sending an event to let know the that the user just left the lobby
    console.log("<- Sending exit_lobby:", get(lobbyStore).code);
    socket.emit("exit_lobby", get(lobbyStore).code);
  }

  onDestroy(() => {
    if (socket) {
      socket.disconnect();
    }
  });

  function customAction() {
    console.log("<- Sending get_lobby_info:", get(lobbyStore).code);
    socket.emit("get_lobby_info", get(lobbyStore).code);
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
    <button
      type="button"
      class="btn btn-lg variant-filled"
      on:click={openDrawer}
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
    <button
      type="button"
      class="btn btn-lg variant-filled text-2xl w-[21vw]"
      on:click={customAction}>Do custom action</button
    >
  </div>
</div>
