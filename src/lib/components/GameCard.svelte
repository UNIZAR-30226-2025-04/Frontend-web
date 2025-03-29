<script lang="ts">
    export let cardName: string;
    export let imagePath: string;
    export let width: string = "w-full";
    export let height: string = "h-full";
    export let suit: "♥" | "♠" | "♦" | "♣";

    const suitColor = suit === "♥" || suit === "♦" ? "text-red-500" : "text-black";
</script>
  
<div class={`${width} ${height} bg-white rounded-lg shadow-xl flex flex-col p-2 transform transition-transform hover:scale-105 cursor-pointer relative overflow-hidden`}>
  <!-- Nombre y palo en las esquinas -->
  <div class="absolute top-2 left-2 text-sm md:text-base font-bold {suitColor}">
    {cardName}
  </div>
  <div class="absolute bottom-2 right-2 text-sm md:text-base font-bold {suitColor} rotate-180">
    {cardName}
  </div>
  
  <!-- Imagen de la carta en el centro -->
  <div class="flex-grow flex items-center justify-center p-6">
    <img 
      src={imagePath} 
      alt={cardName}
      class="w-full h-full object-contain"
    />
  </div>
</div>