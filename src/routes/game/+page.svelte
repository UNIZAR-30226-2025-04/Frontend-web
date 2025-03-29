<script lang="ts">
  import GameCard from "$lib/components/GameCard.svelte";

  type CardType = {
    name: string;
    value: number;
    suit: "♥" | "♠" | "♦" | "♣";
    image: string;
  }

  // Asignamos las imágenes de pixel art a diferentes valores de cartas
  const playerCards: CardType[] = [
    { name: "As", value: 14, suit: "♥", image: "/icons/pxArt(1).png" },
    { name: "Rey", value: 13, suit: "♠", image: "/icons/pxArt(2).png" },
    { name: "Reina", value: 12, suit: "♦", image: "/icons/pxArt(3).png" },
    { name: "Jota", value: 11, suit: "♣", image: "/icons/pxArt(4).png" },
    { name: "10", value: 10, suit: "♥", image: "/icons/pxArt(1).png" },
    { name: "9", value: 9, suit: "♠", image: "/icons/pxArt(2).png" },
  ];

  const tableCards: CardType[] = [
    { name: "8", value: 8, suit: "♦", image: "/icons/pxArt(3).png" },
    { name: "7", value: 7, suit: "♣", image: "/icons/pxArt(4).png" },
    { name: "6", value: 6, suit: "♥", image: "/icons/pxArt(1).png" },
    { name: "5", value: 5, suit: "♠", image: "/icons/pxArt(2).png" },
    { name: "4", value: 4, suit: "♦", image: "/icons/pxArt(3).png" },
  ];
</script>

<div class="h-screen bg-surface-900 flex flex-col p-4">
  <!-- Mesa de juego - ocupa el 60% de la altura -->
  <div class="h-[60%] flex flex-col justify-center">
    <h2 class="text-2xl font-bold mb-4 text-white">Mesa</h2>
    <div class="flex justify-center gap-4 h-full items-center">
      {#each tableCards as card}
        <div class="h-[80%] aspect-[4/5]">
          <GameCard 
            cardName={`${card.name} (${card.value})`}
            imagePath={card.image}
            width="w-full"
            height="h-full"
            suit={card.suit}
          />
        </div>
      {/each}
    </div>
  </div>

  <!-- Cartas del jugador - ocupa el 40% de la altura -->
  <div class="h-[40%] flex flex-col justify-center">
    <h2 class="text-2xl font-bold mb-4 text-white">Tus cartas</h2>
    <div class="flex justify-center gap-4 h-full items-center">
      {#each playerCards as card}
        <div class="h-[80%] aspect-[4/5]">
          <GameCard 
            cardName={`${card.name} (${card.value})`}
            imagePath={card.image}
            width="w-full"
            height="h-full"
            suit={card.suit}
          />
        </div>
      {/each}
    </div>
  </div>
</div>
