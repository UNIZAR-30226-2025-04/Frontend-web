<script lang="ts">
  import GameCard from "$lib/components/GameCard.svelte";
    import type { Card } from "$lib/interfaces";

  let card:Card = {
    rank:"A",
    suit:"h",
    faceUp: true,
    overlay:1
  }

</script>
<div class="mt-[400px]"></div>
<GameCard width="w-[100px]" card={card}/>