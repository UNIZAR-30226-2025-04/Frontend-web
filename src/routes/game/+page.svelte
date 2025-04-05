<script lang="ts">
  import { boucherDirectory, suitDirectory } from "$lib/cardDirectory";
  import BoucherCard from "$lib/components/BoucherCard.svelte";
  import GameCard from "$lib/components/GameCard.svelte";
  import type { Card } from "$lib/interfaces";

  let nextKey: number = 0;

  let cards: Card[] = [];

  type Pair = {
    key: number;
    value: number;
  };

  let bouchers: Pair[] = [];

  for (let i = 0; i < 15; i++) {
    cards.push(generateCard(true, true));
  }

  for (let j = 0; j < 3; j++) {
    onAdd();
  }

  function generateCard(withOverlay: boolean, faceUp: boolean): Card {
    const ranks: string[] = [
      "A",
      "K",
      "Q",
      "J",
      "10",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
    ];
    return {
      rank: ranks[Math.floor(Math.random() * ranks.length)],
      suit: suitDirectory[Math.floor(Math.random() * suitDirectory.length)]
        .name,
      faceUp: faceUp,
      overlay: withOverlay
        ? Math.floor(Math.random() * (suitDirectory.length - 1)) + 1
        : 0,
    };
  }

  function onAdd() {
    const newBoucher = 0;
    bouchers.push({ key: getNextKey(), value: newBoucher });
    bouchers = bouchers;
  }

  function getNextKey(): number {
    nextKey++;
    return nextKey;
  }
</script>


<!-- Main body -->
<div class="grid grid-cols-[30%_55%_15%] h-full w-full tv-filter">
  <!-- Info column -->
  <div class="h-[100vh] ml-[20%] card text-left p-[5%]">
    <!--Title-->
    <div class="text-5xl h-[12%]">
      Round 1/10
    </div>

    <!--Bouchers label-->
    <div class="text-2xl">
      Active consumables
    </div>
    <!--Bouchers-->
    <div class="flex h-[20%] mt-2 justify-between" style="width: calc(100% - 12vh);">
      {#each bouchers as boucher (boucher.key)}
        <div class="w-0">
          <div class="absolute">
            <BoucherCard width="w-[12vh]" boucherId={boucher.value} />
          </div>
        </div>
      {/each}
    </div>

    <!--Score-->
    <div class="card w-full h-[15vh] mt-2 text-center border-2 p-2">
      <div class="h-[45%] text-4xl content-center">
        Full house lvl 2
      </div>

      <div class="flex h-[45%] justify-between text-5xl m-3 gap-0 items-center">
        <div class="w-[45%] h-full card text-right p-2 variant-filled-tertiary content-center">
          90
        </div>
        <div>X</div>
        <div class="w-[45%] h-full card text-left p-2 variant-filled-error content-center">
          90
        </div>
      </div>
    </div>



  </div>

  <!-- Playing mat -->
  <div class="border-black border-solid border-2"></div>

  <!-- Options and deck -->
  <div class="border-white border-solid border-2"></div>
</div>

<style>
  :global(body) {
    background-image: url("/fondo_juego.png") !important;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  /*
	Filter taken from https://github.com/D3nn7/crt-css
	License says: "I love Open Source and decide that this small project don't need a license. 
	You can use it without any restrictions."
	Thank you Danny Schapeit!
	*/

  .tv-filter { 
         text-shadow: 0.06rem 0 0.06rem #ea36af, -0.125rem 0 0.06rem #75fa69;
         animation-duration: 0.01s;
         animation-name: textflicker;
         animation-iteration-count: infinite;
         animation-direction: alternate;
  }

  @keyframes textflicker {
    from {
      text-shadow: 1px 0 0 #ea36af, -2px 0 0 #75fa69;
    }
    to {
      text-shadow: 2px 0.5px 2px #ea36af, -1px -0.5px 2px #75fa69;
    }
  }

</style>
