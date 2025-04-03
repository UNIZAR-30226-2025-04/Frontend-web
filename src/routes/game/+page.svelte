<script lang="ts">
  import GameCard from "$lib/components/GameCard.svelte";
    import type { Card } from "$lib/interfaces";

  let card:Card = {
    rank:"A",
    suit:"h",
    faceUp: true,
    overlay:0
  }

</script>

<GameCard width="w-[200px]" card={card}/>