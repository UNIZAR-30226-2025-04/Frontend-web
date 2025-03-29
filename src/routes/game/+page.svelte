<script lang="ts">
  import GameCard from "$lib/components/GameCard.svelte";

  // Mock data para las cartas
  const playerCards = [
    { name: "As de Corazones", image: "/cards/hearts_ace.png" },
    { name: "Rey de Picas", image: "/cards/spades_king.png" },
    { name: "Reina de Diamantes", image: "/cards/diamonds_queen.png" },
    { name: "Jota de Tréboles", image: "/cards/clubs_jack.png" },
    { name: "10 de Corazones", image: "/cards/hearts_10.png" },
    { name: "9 de Picas", image: "/cards/spades_9.png" },
  ];

  const tableCards = [
    { name: "8 de Diamantes", image: "/cards/diamonds_8.png" },
    { name: "7 de Tréboles", image: "/cards/clubs_7.png" },
    { name: "6 de Corazones", image: "/cards/hearts_6.png" },
    { name: "5 de Picas", image: "/cards/spades_5.png" },
    { name: "4 de Diamantes", image: "/cards/diamonds_4.png" },
  ];
</script>

<div class="min-h-screen bg-surface-900 p-4 flex flex-col">
  <!-- Mesa de juego -->
  <div class="flex-grow flex flex-col items-center justify-between">
    <!-- Cartas de la mesa -->
    <div class="w-full mb-8">
      <h2 class="text-2xl font-bold mb-4 text-white">Mesa</h2>
      <div class="flex flex-wrap justify-center gap-4">
        {#each tableCards as card}
          <GameCard 
            cardName={card.name} 
            imagePath={card.image}
            width="w-[calc(20%-1rem)]" 
            height="h-[calc(20vw*1.5)]"
          />
        {/each}
      </div>
    </div>

    <!-- Cartas del jugador -->
    <div class="w-full mt-auto">
      <h2 class="text-2xl font-bold mb-4 text-white">Tus cartas</h2>
      <div class="flex flex-wrap justify-center gap-4">
        {#each playerCards as card}
          <GameCard 
            cardName={card.name} 
            imagePath={card.image}
            width="w-[calc(16.66%-1rem)]" 
            height="h-[calc(16.66vw*1.5)]"
          />
        {/each}
      </div>
    </div>
  </div>
</div>
