<script lang="ts">
    export let cardName: string;
    export let imagePath: string;
    export let width: string = "w-32"; // width por defecto
    export let height: string = "h-48"; // height por defecto
  </script>
  
  <div class={`${width} ${height} bg-surface-700 rounded-lg shadow-xl flex flex-col p-2 transform transition-transform hover:scale-105 cursor-pointer`}>
    <!-- Nombre de la carta en la parte superior -->
    <div class="text-center text-sm font-semibold mb-2 text-white">
      {cardName}
    </div>
    
    <!-- Imagen de la carta en el centro -->
    <div class="flex-grow flex items-center justify-center">
      <img 
        src={imagePath} 
        alt={cardName}
        class="max-w-full max-h-full object-contain rounded"
      />
    </div>
  </div>