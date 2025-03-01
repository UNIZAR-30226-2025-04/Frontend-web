<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import  AvatarDisplay  from "../../lib/components/AvatarDisplay.svelte";

  // Props
  /** Exposes parent props to this component. */
  export let parent: SvelteComponent;

  let actual = 1; // Actual number of players
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


  type Player = {
    username: string;
    icon: number;
  };

  let players: Player[] = [{
    icon: 0,
    username: 'Username'
  },
  {
    icon: 1,
    username: 'Username'
  },
  {
    icon: 2,
    username: 'Username'
  },
  {
    icon: 3,
    username: 'Username'
  },
  {
    icon: 4,
    username: 'Username'
  },
  {
    icon: 5,
    username: 'Username'
  },
  {
    icon: 6,
    username: 'Username'
  },
  {
    icon: 7,
    username: 'Username'
  }];

</script>




<!-- Lobby header -->
<div class="flex flex-row items-center gap-[10vmin] mt-[2%] ml-[5%] text-[3.5vmin]"> 
  <h1>LOBBY</h1>
  {actual} / {max}
  <button type="button" class="btn btn-lg variant-filled w-[13vmin]" on:click={onSwitchPublic}>{publicString}</button>
  <h1>Code : {code}</h1>
  <button type="button" class="btn btn-lg variant-filled" on:click={onCopyCode}>Copy</button>
  <button type="button" class="btn btn-lg variant-filled">Share</button>
</div>


<!-- Players -->
<div class="mt-[5%] gap-[5vmin] ml-[5%] mr-[5%] flex flex-wrap">
  {#each players as player, index}
    <div class="block card card-hover p-4 h-[30vmin] w-[18vmin] shadow-xl space-y-4" style="flex: 1 1 calc(25% - 10vmin);">
      <!-- <AvatarDisplay icon={player.icon} width={100}/> -->
      <h1>{player.username}</h1>
      <button type="button" class="btn btn-lg variant-filled">Kick</button>
    </div>
  {/each}
</div>
