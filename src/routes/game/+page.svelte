<script lang="ts">
  import GameCard from "$lib/components/GameCard.svelte";

  // Estado del juego
  let round = 3;
  let totalRounds = 10;
  let money = 2435;
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

  // Estado para el modal de salida
  let showExitModal = false;
  let showWinModal = false;
  let showLoseModal = false;

  // Consumibles usados con imágenes de mock
  const usedConsumables = [
    { name: "Mod 1", description: "Modificador de cartas", icon: "/icons/pxArt(1).png" },
    { name: "Mod 2", description: "Modificador de cartas", icon: "/icons/pxArt(2).png" },
    { name: "Mod 3", description: "Modificador de cartas", icon: "/icons/pxArt(3).png" },
    { name: "Mod 4", description: "Modificador de cartas", icon: "/icons/pxArt(4).png" },
    { name: "Mod 5", description: "Modificador de cartas", icon: "/icons/pxArt(5).png" },
    { name: "Mod 6", description: "Modificador de cartas", icon: "/icons/pxArt(6).png" }
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

  // Jokers en la parte superior con imagen
  const jokers = [
    { name: "Joker", description: "Comodín que puede sustituir cualquier carta", image: "/icons/pxArt(1).png" },
    { name: "Joker", description: "Comodín que puede sustituir cualquier carta", image: "/icons/pxArt(2).png" },
    { name: "Joker", description: "Comodín que puede sustituir cualquier carta", image: "/icons/pxArt(3).png" },
    { name: "Joker", description: "Comodín que puede sustituir cualquier carta", image: "/icons/pxArt(4).png" }
  ];
  
  // Total de jokers disponibles en el juego
  let totalJokers = 8;

  const tableCards = [
    { name: "J", value: 11, suit: "♠", image: artImages[0] },
    { name: "Q", value: 12, suit: "♥", image: artImages[1] },
    { name: "K", value: 13, suit: "♦", image: artImages[2] },
    { name: "A", value: 14, suit: "♣", image: artImages[3] },
  ];

  // Añadimos más cartas para el jugador para demostrar el desplazamiento
  const playerCards = [
    { name: "7", value: 7, suit: "♠", image: artImages[4] },
    { name: "8", value: 8, suit: "♥", image: artImages[5] },
    { name: "9", value: 9, suit: "♦", image: artImages[6] },
    { name: "10", value: 10, suit: "♣", image: artImages[7] },
    { name: "J", value: 11, suit: "♠", image: artImages[0] },
    { name: "Q", value: 12, suit: "♥", image: artImages[1] },
    { name: "K", value: 13, suit: "♦", image: artImages[2] },
    { name: "A", value: 14, suit: "♣", image: artImages[3] },
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
    showExitModal = true;
  }
  
  function confirmExit() {
    window.location.href = "/lobbies";
  }
  
  function cancelExit() {
    showExitModal = false;
  }
  
  // Funciones para los botones de acción
  function playCards() {
    alert("Jugando cartas");
  }
  
  function discardCards() {
    alert("Descartando cartas");
  }
  
  function prevOption() {
    alert("Opción anterior");
  }
  
  function nextOption() {
    alert("Siguiente opción");
  }

  // Función para mostrar el modal de victoria
  function youWinDemo() {
    showWinModal = true;
  }
  
  // Función para cerrar el modal de victoria
  function closeWinModal() {
    showWinModal = false;
  }

  // Función para mostrar el modal de derrota
  function youLoseDemo() {
    showLoseModal = true;
  }
  
  // Función para cerrar el modal de derrota
  function closeLoseModal() {
    showLoseModal = false;
  }
  
  function goToMainMenu() {
    window.location.href = "/lobbies";
  }
</script>

<div class="h-screen flex">
  <!-- Panel lateral blanco - con margen a la izquierda -->
  <div class="w-[250px] min-w-[350px] bg-white p-6 flex flex-col left-8 absolute h-full z-10 rounded-lg shadow-lg">
    <h2 class="text-xl mb-8 font-pixelify text-black font-bold">Round {round}/{totalRounds}</h2>
    
    <div class="mb-12">
      <h3 class="mb-3 font-pixelify text-black font-bold">Active consumables</h3>
      <!-- Contenedor con desplazamiento horizontal -->
      <div class="overflow-x-auto pb-2">
        <div class="flex gap-3 min-w-max">
          {#each usedConsumables as consumable}
            <div class="w-24 h-32 border-2 border-black rounded-lg flex flex-col items-center justify-center bg-white shrink-0">
              <img src={consumable.icon} alt={consumable.name} class="w-10 h-10 object-contain mb-1" />
              <span class="font-pixelify text-black text-xs font-medium">{consumable.name}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="border-2 border-black rounded-lg p-4 mb-14">
      <h4 class="font-pixelify text-center mb-4 text-black font-bold">{fullHouse.name} lvl {fullHouse.level}</h4>
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

    <div class="grid grid-cols-2 gap-5">
      {#each [
        ['Discards', discards], 
        ['Your money', `$${money}`]
      ] as [label, value], i}
        <div class="border-2 border-black rounded-lg p-2">
          <div class="font-pixelify text-sm text-black font-medium">{label}</div>
          <div class="font-pixelify text-lg border-t border-black pt-1 text-center text-black font-bold">{value}</div>
        </div>
      {/each}
    </div>
    
    <div class="grid grid-cols-2 gap-5 mt-8">
      {#each [
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
  <div class="ml-[190px] flex-1 p-8 relative">
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

    <!-- Estructura de tres secciones para el área de juego -->
    <div class="h-full flex flex-col">
      <!-- Jokers en la parte superior con contador - alineados a la izquierda -->
      <div class="mt-4 relative">
        <!-- Contenedor con el mismo ancho que las cartas del jugador -->
        <div class="mx-auto" style="width: calc(145px * 5 + 16px * 4);">
          <div class="flex gap-4 justify-start">
            {#each jokers as joker, i}
              <div class="w-[145px] h-[193px] bg-white rounded-lg border-2 border-black relative overflow-hidden shrink-0">
                <div class="absolute top-2 left-2 text-base font-bold z-10 text-purple-700">
                  Joker
                </div>
                <div class="flex items-center justify-center h-full">
                  <img src={joker.image} alt="Joker" class="w-16 h-16 object-contain" />
                </div>
                <div class="absolute bottom-2 right-2 text-base font-bold rotate-180 z-10 text-purple-700">
                  Joker
                </div>
              </div>
            {/each}
          </div>
          
          <!-- Contador de jokers debajo a la izquierda del primer joker -->
          <div class="absolute -bottom-6 left-0">
            <span class="text-white font-pixelify font-bold">{jokers.length}/{totalJokers}</span>
          </div>
        </div>
      </div>
      
      <!-- Cartas de la mesa (tableCards) - CENTRADAS HORIZONTALMENTE Y MOVIDAS HACIA ARRIBA -->
      <div class="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center gap-4 w-full max-w-[1200px]">
        {#each tableCards as card, i}
          <div class="w-[130px] h-[173px] bg-white rounded-lg border-2 border-black relative overflow-hidden">
            <div class="absolute top-2 left-2 text-lg font-bold z-10" class:text-red-500={card.suit === "♥" || card.suit === "♦"} class:text-black={card.suit === "♠" || card.suit === "♣"}>
              {card.name}{card.suit}
            </div>
            <div class="flex items-center justify-center h-full">
              <img src={card.image} alt={card.suit} class="w-16 h-16 object-contain" />
            </div>
            <div class="absolute bottom-2 right-2 text-lg font-bold rotate-180 z-10" class:text-red-500={card.suit === "♥" || card.suit === "♦"} class:text-black={card.suit === "♠" || card.suit === "♣"}>
              {card.name}{card.suit}
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Espacio inferior con las cartas del jugador -->
      <div class="flex-1 flex flex-col justify-end">
        <!-- Cartas del jugador - en la parte inferior con desplazamiento horizontal -->
        <div class="mt-auto">
          <!-- Contenedor con desplazamiento horizontal para las cartas del jugador - limitado a 5 cartas visibles -->
          <div class="overflow-x-auto pb-2 mx-auto" style="width: calc(145px * 5 + 16px * 4);">
            <div class="flex gap-4 min-w-max">
              {#each playerCards as card, i}
                <div class="w-[145px] h-[193px] bg-white rounded-lg border-2 border-black relative overflow-hidden shrink-0">
                  <div class="absolute top-2 left-2 text-base font-bold z-10" class:text-red-500={card.suit === "♥" || card.suit === "♦"} class:text-black={card.suit === "♠" || card.suit === "♣"}>
                    {card.name}{card.suit}
                  </div>
                  <div class="flex items-center justify-center h-full">
                    <img src={card.image} alt={card.suit} class="w-16 h-16 object-contain" />
                  </div>
                  <div class="absolute bottom-2 right-2 text-base font-bold rotate-180 z-10" class:text-red-500={card.suit === "♥" || card.suit === "♦"} class:text-black={card.suit === "♠" || card.suit === "♣"}>
                    {card.name}{card.suit}
                  </div>
                </div>
              {/each}
            </div>
          </div>
          
          <!-- Controles de juego estilo pixelado -->
          <div class="flex justify-center items-center gap-2 mt-6 mb-8">
            <button 
              class="bg-white rounded-full py-2 px-10 font-pixelify text-black font-bold text-base border-2 border-black hover:bg-gray-100"
              on:click={playCards}
            >
              Play
            </button>
            
            <div class="flex border-2 border-black rounded-md">
              <button 
                class="bg-white py-2 px-4 font-pixelify text-black font-bold hover:bg-gray-100 border-r border-black"
                on:click={prevOption}
              >
                ←
              </button>
              <button 
                class="bg-white py-2 px-4 font-pixelify text-black font-bold hover:bg-gray-100"
                on:click={nextOption}
              >
                →
              </button>
            </div>
            
            <button 
              class="bg-white rounded-full py-2 px-10 font-pixelify text-black font-bold text-base border-2 border-black hover:bg-gray-100"
              on:click={discardCards}
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mazo de cartas apiladas en la esquina inferior derecha de la pantalla -->
    <div class="fixed bottom-8 right-8 z-20">
      <div class="relative">
        <!-- Carta 3 (la de más atrás) -->
        <div class="absolute -right-3 -bottom-3 w-28 h-40 bg-white rounded-lg border-2 border-black">
          <!-- Patrón de cruces azules en los bordes -->
          <div class="absolute inset-0 p-1">
            <div class="border-2 border-dashed border-blue-400 h-full w-full rounded-md flex items-center justify-center">
              <!-- Círculo verde en el centro -->
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-lg">×</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Carta 2 (en medio) -->
        <div class="absolute -right-1.5 -bottom-1.5 w-28 h-40 bg-white rounded-lg border-2 border-black">
          <!-- Patrón de cruces azules en los bordes -->
          <div class="absolute inset-0 p-1">
            <div class="border-2 border-dashed border-blue-400 h-full w-full rounded-md"></div>
          </div>
        </div>
        
        <!-- Carta 1 (la de más adelante) -->
        <div class="relative w-28 h-40 bg-white rounded-lg border-2 border-black">
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

<!-- Botones para demostración -->
<div class="fixed bottom-4 left-4 flex gap-2 z-50">
  <button 
    class="bg-white rounded-lg p-2 font-pixelify text-black font-bold border-2 border-black"
    on:click={youWinDemo}
  >
    youwindemo
  </button>
  
  <button 
    class="bg-white rounded-lg p-2 font-pixelify text-black font-bold border-2 border-black"
    on:click={youLoseDemo}
  >
    youlosedemo
  </button>
</div>

<!-- Modal de victoria -->
{#if showWinModal}
  <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-96 overflow-hidden border-4 border-black text-center p-6">
      <h2 class="font-pixelify text-center text-5xl font-bold text-black mb-6">YOU WIN!</h2>
      
      <div class="border-2 border-black rounded-lg p-4 mb-6">
        <p class="font-pixelify text-black text-xl mb-2">Round reward</p>
        <p class="font-pixelify text-black text-3xl font-bold">$720</p>
      </div>
      
      <div class="border-2 border-black rounded-lg p-4 mb-8">
        <div class="flex justify-between items-center">
          <div class="w-1/2 border-r border-black pr-4">
            <p class="font-pixelify text-black text-lg">Your money</p>
            <p class="font-pixelify text-black text-2xl font-bold">$3155</p>
          </div>
          <div class="w-1/2 pl-4">
            <p class="font-pixelify text-black text-lg">Next round</p>
            <p class="font-pixelify text-black text-2xl font-bold">4/10</p>
          </div>
        </div>
      </div>
      
      <button 
        class="bg-white rounded-full py-3 px-12 font-pixelify text-black font-bold text-xl border-2 border-black hover:bg-gray-100"
        on:click={closeWinModal}
      >
        CONTINUE
      </button>
    </div>
  </div>
{/if}

<!-- Modal de derrota (Game Over) -->
{#if showLoseModal}
  <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-96 overflow-hidden border-4 border-black text-center p-6">
      <!-- Icono de bufón -->
      <div class="mb-4">
        <img src="/icons/jester.png" alt="Jester" class="w-16 h-16 mx-auto" />
      </div>
      
      <h2 class="font-pixelify text-center text-4xl font-bold text-black mb-6">GAME OVER</h2>
      
      <!-- Estadísticas del juego -->
      <div class="border-2 border-black rounded-lg p-4 mb-4">
        <p class="font-pixelify text-black text-xl font-bold">XXXXXXXX</p>
      </div>
      
      <div class="border-2 border-black rounded-lg p-4 mb-4">
        <p class="font-pixelify text-black text-xl font-bold">XXXXXXXX</p>
      </div>
      
      <div class="border-2 border-black rounded-lg p-4 mb-8">
        <p class="font-pixelify text-black text-xl font-bold">XXXXXXXX</p>
      </div>
      
      <button 
        class="bg-white rounded-full py-3 px-12 font-pixelify text-black font-bold text-xl border-2 border-black hover:bg-gray-100"
        on:click={goToMainMenu}
      >
        Main menu
      </button>
    </div>
  </div>
{/if}

<!-- Modal de confirmación para salir -->
{#if showExitModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-80 overflow-hidden border-2 border-black">
      <!-- Título del modal -->
      <div class="border-b-2 border-black p-3">
        <h2 class="font-pixelify text-center text-2xl font-bold tracking-wider text-black">EXIT</h2>
      </div>
      
      <!-- Botones de confirmación -->
      <div class="flex justify-center gap-6 p-4">
        <button 
          class="bg-white rounded-full py-2 px-8 font-pixelify text-black font-bold text-lg border-2 border-black hover:bg-gray-100"
          on:click={confirmExit}
        >
          YES
        </button>
        
        <button 
          class="bg-white rounded-full py-2 px-8 font-pixelify text-black font-bold text-lg border-2 border-black hover:bg-gray-100"
          on:click={cancelExit}
        >
          NO
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
  
  .font-pixelify {
    font-family: 'Pixelify Sans', sans-serif;
    text-shadow: 0px 0px 1px rgba(0,0,0,0.5);
  }
  
  /* Estilo para la barra de desplazamiento horizontal */
  .overflow-x-auto::-webkit-scrollbar {
    height: 6px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
