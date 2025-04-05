<script lang="ts">
  import BoucherCard from "$lib/components/BoucherCard.svelte";
import GameCard from "$lib/components/GameCard.svelte";
    import JokerCard from "$lib/components/JokerCard.svelte";
    import type { Card } from "$lib/interfaces";

    let card:Card = {
    rank:"A",
    suit:"h",
    faceUp: true,
    overlay:1
  }

  let card2:Card = {
    rank:"K",
    suit:"s",
    faceUp: true,
    overlay:0
  }

  let card3:Card = {
    rank:"K",
    suit:"s",
    faceUp: false,
    overlay:0
  }

</script>

<div class="mt-[400px]"></div>
<div class="flex gap-[10px]">
  <GameCard width="w-[100px]" card={card}/>
  <GameCard width="w-[100px]" card={card2}/>
  <GameCard width="w-[100px]" card={card3}/>
  <JokerCard width="w-[100px]" jokerId={0} editionId={0}/>
  <JokerCard width="w-[100px]" jokerId={0} editionId={1}/>
  <BoucherCard width="w-[100px]" boucherId={0}/>
</div> 

<style>
  :global(body) {
    background-image: url('/fondo_juego.png') !important;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
</style>