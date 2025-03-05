<script lang="ts">
  import  AvatarDisplay  from "../../lib/components/AvatarDisplay.svelte";
  import { userDataStore } from '$lib/stores';
  import { goto } from "$app/navigation";
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";
  import { ChatFill } from "svelte-bootstrap-icons";
  import { base } from '$app/paths';



  let actual = 8; // Actual number of players
  let max = 8; // Maximum number of players
  let publicString = "PUBLIC"; // String to show if the lobby is public or private
  let publicValue = true; // Boolean to know if the lobby is public or private
  let code = "1234"; // Code of the lobby
  let host = false; // Boolean to know if the player is the host
  
  // Function to switch the public value
  function onSwitchPublic(){
    if(host)
    publicString = publicValue ? "PRIVATE" : "PUBLIC";
    publicValue = !publicValue;
    console.log(publicValue);
  }
 
  // Function to copy code to clipboard
  function onCopyCode(){
    navigator.clipboard.writeText(code);
  }

  // Function to start the game
  function onStart(){
    console.log("Starting game");
  }


  // Player type
  type Player = {
    key: number
    username: string
    icon: number
    host: boolean
  };

  // Local player
  let username: string = $userDataStore.username;
  let avatar: number = $userDataStore.icon;

  // List of players, includes testing data for viewing purposes
  let players: Player[] = [
    {username: username, icon: avatar, key:0, host: true},
    {username: "Player2", icon: 2, key:1, host: false},
    {username: "Player3", icon: 3, key:2, host: false},
    {username: "Player4", icon: 4, key:3, host: false},
    {username: "Player5", icon: 5, key:4, host: false},
    {username: "Player6", icon: 6, key:5, host: false},
    {username: "Player7", icon: 7, key:6, host: false},
    {username: "Player8", icon: 8, key:7, host: false},
  ];

  /**
   * Function to kick a player of the list that has index
   * @number index
   * */ 
  function onKickPlayer(index: number){
    console.log("Kicking player", players[index].username);
    players = [...players.slice(0, index), ...players.slice(index + 1)];
    actual = players.length;
  }

  /**
   * Adds user to the list
   * @param username
   * @param icon
   */
  function addPlayer(username:string, icon:number){
    let newUser:Player = {username:username,icon:icon,key:players.length,host:false};
    players = [...players,newUser]
  }

</script>


<!-- Lobby header -->
<div class="flex flex-row gap-[10vmin] mt-[2%] ml-[0%] text-[3.5vmin] items-center"> 
  <h1>LOBBY</h1>
  <span>{actual} / {max}</span>
  <button type="button" class="btn btn-lg variant-filled w-[13vmin]" on:click={onSwitchPublic}>{publicString}</button>
  <h1>Code : {code}</h1>
  <button type="button" class="btn btn-lg variant-filled" on:click={onCopyCode}>Copy</button>
  <button type="button" class="btn btn-lg variant-filled">Share</button>
  <div class="ml-[37vmin]">
    <button type="button" class="btn btn-lg variant-filled"><ChatFill></ChatFill></button>
  </div>
</div>


<!-- Players -->
<div class="mt-[4%] gap-[5vmin] ml-[5%] mr-[5%] grid grid-cols-2 md:grid-cols-4">
  {#each players as player, index (player.key)}
    <div animate:flip={{ duration: 500, easing: cubicOut }} class="block card card-hover p-4 h-[28vmin] w-[40vmin] shadow-xl space-y-6  text-left" style="flex: 0 0 40vmin;"> 
      <AvatarDisplay icon={player.icon} width={100}/>
      <h1 class="text-[3vmin]">{player.username}</h1>
      {#if player.host}
        <h1 class="text-green-500 text-[5vmin]">HOST</h1>
      {/if}
      {#if host}
        {#if index != 0}
          <button class="btn btn-lg variant-filled mt-[30%]" on:click={() => onKickPlayer(index)}>Kick</button>
        {/if}
      {/if}
    </div>
  {/each}
</div>

<!-- Leave / Start button -->
{#if host}
  <div class="flex flex-row gap-[5vmin] mt-[1%] ml-[-47%]">
    <button type="button" class="btn btn-lg variant-filled w-[40vmin] h-[7vmin] mt-[5%] ml-[5%]" on:click={() => goto(base + "/home")}>Leave</button>
    <button type="button" class="btn btn-lg variant-filled w-[40vmin] h-[7vmin] mt-[5%] ml-[5%]" on:click={onStart}>Start</button>
  </div>
{/if}
{#if !host}
  <div class="flex flex-row gap-[5vmin] mt-[1%] ml-[-66%]">
    <button type="button" class="btn btn-lg variant-filled w-[40vmin] h-[7vmin] mt-[10%] ml-[3%]" on:click={() => goto(base + "/home")}>Leave</button>
  </div>
{/if}