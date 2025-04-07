<script lang="ts">
    export let message: string = "Cargando...";
    export let fullScreen: boolean = true;
</script>

<div class={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
    <div class="pixel-spinner"></div>
    <p class="loading-message">{message}</p>
</div>

<style>
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        gap: 6rem;
    }
    
    .fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
    }
    
    .pixel-spinner {
        width: 80px;
        height: 80px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cstyle%3E rect %7B fill: white; %7D %3C/style%3E%3Crect x='20' y='0' width='10' height='10'/%3E%3Crect x='30' y='0' width='10' height='10'/%3E%3Crect x='40' y='0' width='10' height='10'/%3E%3Crect x='50' y='0' width='10' height='10'/%3E%3Crect x='60' y='10' width='10' height='10'/%3E%3Crect x='70' y='20' width='10' height='10'/%3E%3Crect x='70' y='30' width='10' height='10'/%3E%3Crect x='70' y='40' width='10' height='10'/%3E%3Crect x='70' y='50' width='10' height='10'/%3E%3Crect x='60' y='60' width='10' height='10'/%3E%3Crect x='50' y='70' width='10' height='10'/%3E%3Crect x='40' y='70' width='10' height='10'/%3E%3Crect x='30' y='70' width='10' height='10'/%3E%3Crect x='20' y='70' width='10' height='10'/%3E%3Crect x='10' y='60' width='10' height='10'/%3E%3Crect x='0' y='50' width='10' height='10'/%3E%3Crect x='0' y='40' width='10' height='10'/%3E%3Crect x='0' y='30' width='10' height='10'/%3E%3Crect x='0' y='20' width='10' height='10'/%3E%3Crect x='10' y='10' width='10' height='10'/%3E%3C/svg%3E");
        animation: pixel-spin 1.2s steps(8) infinite;
    }
    
    .loading-message {
        margin-top: 0;
        font-size: 2rem;
        color: white;
        text-align: center;
        font-family: 'Pixelify Sans', 'Press Start 2P', 'Courier New', monospace;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    
    @keyframes pixel-spin {
        to { transform: rotate(360deg); }
    }
    
</style> 