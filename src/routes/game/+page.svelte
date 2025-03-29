<script lang="ts">
  import GameCard from "$lib/components/GameCard.svelte";

  // Estado del juego
  let round = 0;
  let totalRounds = 10;
  let money = 243;
  let roundPot = 10;
  let buyIn = 10;
  let discards = 4;
  let timeLeft = 30;
  let fullHouse = {
    value: 30,
    multiplier: 8
  };

  // Imágenes para las cartas
  const suitImages = {
    "♠": "/icons/spade.png",
    "♥": "/icons/heart.png",
    "♦": "/icons/diamond.png",
    "♣": "/icons/club.png"
  };
  
  // Imágenes de arte para el centro de las cartas (corregidas con los nombres reales)
  const artImages = [
    "/icons/pxArt(1).png",
    "/icons/pxArt(2).png",
    "/icons/pxArt(3).png",
    "/icons/pxArt(4).png",
    "/icons/pxArt(5).png",
    "/icons/pxArt(6).png",
    "/icons/pxArt(7).png",
    "/icons/pxArt(8).png"
  ];

  const jokers = [
    { name: "J", value: 11, suit: "♠", image: artImages[0] },
    { name: "Q", value: 12, suit: "♥", image: artImages[1] },
    { name: "K", value: 13, suit: "♦", image: artImages[2] },
    { name: "A", value: 14, suit: "♣", image: artImages[3] },
  ];

  const playerCards = [
    { name: "7", value: 7, suit: "♠", image: artImages[4] },
    { name: "8", value: 8, suit: "♥", image: artImages[5] },
    { name: "9", value: 9, suit: "♦", image: artImages[6] },
    { name: "10", value: 10, suit: "♣", image: artImages[7] },
    { name: "J", value: 11, suit: "♠", image: artImages[0] },
  ];
</script>

<div class="h-screen flex bg-[#1E213F80]">
  <!-- Panel lateral blanco - pegado a la izquierda del todo -->
  <div class="w-[250px] min-w-[350px] bg-white p-4 flex flex-col left-0 absolute h-full">
    <h2 class="text-xl mb-4 font-pixelify">Round {round}/{totalRounds}</h2>
    
    <div class="mb-6">
      <h3 class="mb-2 font-pixelify">Used consumables</h3>
      <div class="grid grid-cols-2 gap-2">
        {#each Array(2) as _}
          <div class="aspect-[3/4] border-2 border-black rounded-lg flex items-center justify-center bg-white">
            <span class="font-pixelify">Mod</span>
          </div>
        {/each}
      </div>
      <div class="w-full h-2 bg-gray-200 rounded mt-2"></div>
    </div>

    <div class="border-2 border-black rounded-lg p-3 mb-6">
      <h4 class="font-pixelify">Full House lvl 2</h4>
      <div class="flex justify-between font-pixelify">
        <span>{fullHouse.value}</span>
        <span>x {fullHouse.multiplier}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      {#each [['Discards', discards], ['Your money', `$${money}`], ['Buy-in', `$${buyIn}`], ['Round\'s pot', `$${roundPot}`]] as [label, value]}
        <div class="border-2 border-black rounded-lg p-3">
          <div class="font-pixelify text-sm">{label}</div>
          <div class="font-pixelify text-lg">{value}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Área de juego - expandida y centrada -->
  <div class="ml-[350px] flex-1 p-8 relative flex flex-col items-center justify-center">
    <!-- Timer -->
    <div class="absolute top-4 right-4 bg-white rounded-lg px-6 py-2 font-pixelify">
      {timeLeft}s
    </div>

    <!-- Jokers - centrados -->
    <div class="flex justify-center gap-4 mb-12 w-full max-w-[1200px]">
      {#each jokers as card, i}
        <div class="w-40 h-56 bg-white rounded-lg border border-white relative overflow-hidden">
          <div class="absolute top-2 left-2 text-lg font-bold" class:text-red-500={card.suit === "♥" || card.suit === "♦"}>
            {card.name}{card.suit}
          </div>
          <div class="flex items-center justify-center h-full">
            <img src={card.image} alt={card.suit} class="w-24 h-24 object-contain" />
          </div>
          <div class="absolute bottom-2 right-2 text-lg font-bold rotate-180" class:text-red-500={card.suit === "♥" || card.suit === "♦"}>
            {card.name}{card.suit}
          </div>
        </div>
      {/each}
    </div>

    <!-- Cartas del jugador - centradas -->
    <div class="mt-auto mb-16">
      <div class="flex justify-center gap-6">
        {#each playerCards as card, i}
          <div class="w-40 h-56 bg-white rounded-lg border border-white relative overflow-hidden">
            <div class="absolute top-2 left-2 text-lg font-bold" class:text-red-500={card.suit === "♥" || card.suit === "♦"}>
              {card.name}{card.suit}
            </div>
            <div class="flex items-center justify-center h-full">
              <img src={card.image} alt={card.suit} class="w-24 h-24 object-contain" />
            </div>
            <div class="absolute bottom-2 right-2 text-lg font-bold rotate-180" class:text-red-500={card.suit === "♥" || card.suit === "♦"}>
              {card.name}{card.suit}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Contador de cartas -->
    <div class="absolute bottom-4 right-4 text-white font-pixelify">
      41/52
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
  
  .font-pixelify {
    font-family: 'Pixelify Sans', sans-serif;
  }
</style>
