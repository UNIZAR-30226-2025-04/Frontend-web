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
    name: "Full House",
    level: 2,
    value: 90,
    multiplier: 8
  };

  // Consumibles usados
  const usedConsumables = [
    { name: "Mod", description: "Modificador de cartas" },
    { name: "Mod", description: "Modificador de cartas" }
  ];

  // Progreso de la barra de consumibles (15%)
  let progressPercentage = 15;

  // Imágenes para las cartas
  const suitImages = {
    "♠": "/icons/spade.png",
    "♥": "/icons/heart.png",
    "♦": "/icons/diamond.png",
    "♣": "/icons/club.png"
  };
  
  // Imágenes de arte para el centro de las cartas
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

  // Contador de cartas
  let cardsRemaining = 41;
  let totalCards = 52;

  // Inputs para la interfaz
  let inputValue = "";
  let selectedOption = "";
  const options = ["Opción 1", "Opción 2", "Opción 3"];
  
  // Funciones para los botones de chat y salir
  function openChat() {
    alert("Abriendo chat");
  }
  
  function exitGame() {
    if (confirm("¿Estás seguro de que quieres abandonar la partida?")) {
      // Lógica para salir del juego
      window.location.href = "/lobbies";
    }
  }
</script>

<div class="h-screen flex bg-[#1E213F80]">
  <!-- Panel lateral blanco - pegado a la izquierda del todo -->
  <div class="w-[250px] min-w-[350px] bg-white p-4 flex flex-col left-0 absolute h-full z-10">
    <h2 class="text-xl mb-4 font-pixelify text-black font-bold">Round {round}/{totalRounds}</h2>
    
    <div class="mb-6">
      <h3 class="mb-2 font-pixelify text-black font-bold">Used consumables</h3>
      <div class="grid grid-cols-2 gap-2">
        {#each usedConsumables as consumable}
          <div class="aspect-[3/4] border-2 border-black rounded-lg flex items-center justify-center bg-white">
            <span class="font-pixelify text-black font-medium">{consumable.name}</span>
          </div>
        {/each}
      </div>
      <!-- Barra de progreso con el 15% completado -->
      <div class="w-full h-2 bg-white border border-black rounded mt-2 overflow-hidden">
        <div class="h-full bg-black" style="width: {progressPercentage}%"></div>
      </div>
    </div>

    <!-- Sección de inputs según la imagen de referencia -->
    <div class="border-2 border-black rounded-lg p-3 mb-6">
      <h3 class="font-pixelify text-center mb-2 text-black font-bold">Inputs</h3>
      <div class="flex flex-col gap-2">
        <!-- Dos botones en la primera fila -->
        <div class="grid grid-cols-2 gap-2">
          <button class="border-2 border-black rounded-lg py-2 px-3 font-pixelify hover:bg-gray-100 text-black font-medium">
            Acción 1
          </button>
          <button class="border-2 border-black rounded-lg py-2 px-3 font-pixelify hover:bg-gray-100 text-black font-medium">
            Acción 2
          </button>
        </div>
      </div>
    </div>

    <div class="border-2 border-black rounded-lg p-3 mb-6">
      <h4 class="font-pixelify text-center mb-2 text-black font-bold">{fullHouse.name} lvl {fullHouse.level}</h4>
      <div class="flex justify-between font-pixelify">
        <div class="border-2 border-black rounded-lg py-1 px-3 text-center w-[45%]">
          <span class="text-xl text-black font-bold">{fullHouse.value}</span>
        </div>
        <div class="flex items-center justify-center">
          <span class="text-xl text-black font-bold">X</span>
        </div>
        <div class="border-2 border-black rounded-lg py-1 px-3 text-center w-[45%]">
          <span class="text-xl text-black font-bold">{fullHouse.multiplier}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      {#each [
        ['Discards', discards], 
        ['Your money', `$${money}`], 
        ['Buy-in', `$${buyIn}`], 
        ['Round\'s pot', `$${roundPot}`]
      ] as [label, value], i}
        <div class="border-2 border-black rounded-lg p-2">
          <div class="font-pixelify text-sm text-black font-medium">{label}</div>
          <div class="font-pixelify text-lg border-t border-black pt-1 text-center text-black font-bold">{value}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Área de juego - expandida y centrada -->
  <div class="ml-[350px] flex-1 p-8 relative flex flex-col items-center justify-center">
    <!-- Controles superiores: Chat, Timer y Exit - Posicionados a la derecha del todo de la pantalla -->
    <div class="fixed top-4 right-4 flex flex-col items-end gap-2 z-20">
      <div class="flex gap-2">
        <!-- Botón de chat con imagen -->
        <button 
          class="bg-white rounded-lg p-2 font-pixelify flex items-center justify-center w-12 h-12 border-2 border-black"
          on:click={openChat}
        >
          <img src="/icons/chat.png" alt="Chat" class="w-8 h-8" />
        </button>
        
        <!-- Botón de salir (X) -->
        <button 
          class="bg-white rounded-lg p-2 font-pixelify flex items-center justify-center w-12 h-12 border-2 border-black"
          on:click={exitGame}
        >
          <span class="text-black font-bold text-2xl">X</span>
        </button>
      </div>
      
      <!-- Timer - Debajo de los botones -->
      <div class="bg-white rounded-lg px-6 py-2 font-pixelify border-2 border-black w-full text-center">
        <span class="text-black font-bold text-xl">{timeLeft} s</span>
      </div>
    </div>

    <!-- Jokers - centrados -->
    <div class="flex justify-center gap-4 mb-12 w-full max-w-[1200px]">
      {#each jokers as card, i}
        <div class="w-40 h-56 bg-white rounded-lg border-2 border-black relative overflow-hidden">
          <div class="absolute top-2 left-2 text-lg font-bold z-10" class:text-red-500={card.suit === "♥" || card.suit === "♦"} class:text-black={card.suit === "♠" || card.suit === "♣"}>
            {card.name}{card.suit}
          </div>
          <div class="flex items-center justify-center h-full">
            <img src={card.image} alt={card.suit} class="w-24 h-24 object-contain" />
          </div>
          <div class="absolute bottom-2 right-2 text-lg font-bold rotate-180 z-10" class:text-red-500={card.suit === "♥" || card.suit === "♦"} class:text-black={card.suit === "♠" || card.suit === "♣"}>
            {card.name}{card.suit}
          </div>
        </div>
      {/each}
    </div>

    <!-- Cartas del jugador - centradas -->
    <div class="mt-auto mb-16">
      <div class="flex justify-center gap-6">
        {#each playerCards as card, i}
          <div class="w-40 h-56 bg-white rounded-lg border-2 border-black relative overflow-hidden">
            <div class="absolute top-2 left-2 text-lg font-bold z-10" class:text-red-500={card.suit === "♥" || card.suit === "♦"} class:text-black={card.suit === "♠" || card.suit === "♣"}>
              {card.name}{card.suit}
            </div>
            <div class="flex items-center justify-center h-full">
              <img src={card.image} alt={card.suit} class="w-24 h-24 object-contain" />
            </div>
            <div class="absolute bottom-2 right-2 text-lg font-bold rotate-180 z-10" class:text-red-500={card.suit === "♥" || card.suit === "♦"} class:text-black={card.suit === "♠" || card.suit === "♣"}>
              {card.name}{card.suit}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Mazo de cartas apiladas en la esquina inferior derecha de la pantalla -->
    <div class="fixed bottom-8 right-8 z-20">
      <div class="relative">
        <!-- Carta 3 (la de más atrás) -->
        <div class="absolute -right-4 -bottom-4 w-32 h-44 bg-white rounded-lg border-2 border-black">
          <!-- Patrón de cruces azules en los bordes -->
          <div class="absolute inset-0 p-1">
            <div class="border-2 border-dashed border-blue-400 h-full w-full rounded-md flex items-center justify-center">
              <!-- Círculo verde en el centro -->
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-xl">×</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Carta 2 (en medio) -->
        <div class="absolute -right-2 -bottom-2 w-32 h-44 bg-white rounded-lg border-2 border-black">
          <!-- Patrón de cruces azules en los bordes -->
          <div class="absolute inset-0 p-1">
            <div class="border-2 border-dashed border-blue-400 h-full w-full rounded-md"></div>
          </div>
        </div>
        
        <!-- Carta 1 (la de más adelante) -->
        <div class="relative w-32 h-44 bg-white rounded-lg border-2 border-black">
          <!-- Patrón de cruces azules en los bordes -->
          <div class="absolute inset-0 p-1">
            <div class="border-2 border-dashed border-blue-400 h-full w-full rounded-md"></div>
          </div>
        </div>
      </div>
      
      <!-- Contador de cartas debajo del mazo -->
      <div class="mt-2 text-center bg-transparent">
        <span class="text-white font-pixelify font-bold">{cardsRemaining}/{totalCards}</span>
      </div>
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
    text-shadow: 0px 0px 1px rgba(0,0,0,0.5);
  }
</style>
