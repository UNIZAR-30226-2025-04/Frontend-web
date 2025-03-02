<script lang="ts">
  import  AvatarDisplay  from "../../lib/components/AvatarDisplay.svelte";
  import { userDataStore } from '$lib/stores';
  import { goto } from "$app/navigation";


  let actual = 8; // Actual number of players
  let max = 8; // Maximum number of players
  let publicString = "PUBLIC"; // String to show if the lobby is public or private
  let publicValue = true; // Boolean to know if the lobby is public or private
  let code = "1234"; // Code of the lobby
  
  // Function to switch the public value
  function onSwitchPublic(){
    publicString = publicValue ? "PRIVATE" : "PUBLIC";
    publicValue = !publicValue;
    console.log(publicValue);
  }
 
  // Function copy code to clipboard
  function onCopyCode(){
    navigator.clipboard.writeText(code);
  }

  // Function to start the game
  function onStart(){
    console.log("Starting game");
  }

  // Function to leave the lobby
  function onLeave(){
    goto("/home");
  }

  // Player type
  type Player = {
    username: string;
    icon: number;
  };

  // Local player
  let username: string = $userDataStore.username;
  let avatar: number = $userDataStore.icon;

  // List of players
  let players: Player[] = [
    {username: username, icon: avatar},
    {username: "Player2", icon: 2},
    {username: "Player3", icon: 3},
    {username: "Player4", icon: 4},
    {username: "Player5", icon: 5},
    {username: "Player6", icon: 6},
    {username: "Player7", icon: 7},
    {username: "Player8", icon: 8},
  ];

  // Function to kick a player
  function onKickPlayer(index: number){
    console.log("Kicking player", players[index].username);
    players = [...players.slice(0, index), ...players.slice(index + 1)];
    actual = players.length;
  }

</script>


<!-- Lobby header -->
<div class="flex flex-row gap-[10vmin] mt-[2%] ml-[-25%] text-[3.5vmin] items-center"> 
  <h1>LOBBY</h1>
  <span>{actual} / {max}</span>
  <button type="button" class="btn btn-lg variant-filled w-[13vmin]" on:click={onSwitchPublic}>{publicString}</button>
  <h1>Code : {code}</h1>
  <button type="button" class="btn btn-lg variant-filled" on:click={onCopyCode}>Copy</button>
  <button type="button" class="btn btn-lg variant-filled">Share</button>
</div>


<!-- Players -->
<div class="mt-[4%] gap-[5vmin] ml-[5%] mr-[5%] grid grid-cols-2 md:grid-cols-4 gap-4">
  {#each players as player, index}
    <div class="block card card-hover p-4 h-[28vmin] w-[40vmin] shadow-xl space-y-6  text-left" style="flex: 0 0 40vmin;"> 
      <AvatarDisplay icon={player.icon} width={100}/>
      <h1 class="text-[3vmin]">{player.username}</h1>
      {#if index != 0}
      <button class="btn btn-lg variant-filled mt-[30%]" on:click={() => onKickPlayer(index)}>Kick</button>
      {/if}
    </div>
  {/each}
</div>

<!-- Leave / Start button -->
 <div class="flex flex-row gap-[5vmin] mt-[1%] ml-[-47%]">
  <button type="button" class="btn btn-lg variant-filled w-[40vmin] h-[7vmin] mt-[5%] ml-[5%]" on:click={onLeave}>Leave</button>
  <button type="button" class="btn btn-lg variant-filled w-[40vmin] h-[7vmin] mt-[5%] ml-[5%]" on:click={onStart}>Start</button>
 </div>
