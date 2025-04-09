<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { userDataStore, socketStore, lobbyStore } from "$lib/stores";
  import { wsBase } from "$lib/paths";
  import { io, Socket } from "socket.io-client";
  import { get } from "svelte/store";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { joinLobbyFetch } from "$lib/fetch/lobbyFetch";

  let socket: Socket | null = null;
  let messages: {type: string, direction: string, content: any}[] = [];
  let lobbyCodeInput = "";
  let messageInput = "";
  let username = get(userDataStore).username;
  let isConnected = false;
  let currentLobbyId = "";

  // Function to add messages to the log
  function addMessage(type: string, direction: string, content: any) {
    messages = [{
      type,
      direction,
      content: typeof content === 'object' ? JSON.stringify(content, null, 2) : content
    }, ...messages];
  }

  function connect() {
    loadingStore.startLoading('Conectando al servidor WebSocket...');
    
    socket = io(wsBase, {
      auth: {
        username: get(userDataStore).username,
        authorization: "Bearer " + get(userDataStore).token,
      },
      transports: ["websocket"],
    });

    // Connection events
    socket.on("connect", () => {
      addMessage("connect", "received", `Connected with ID: ${socket.id}`);
      isConnected = true;
      socketStore.set(socket);
      loadingStore.stopLoading();
    });

    socket.on("disconnect", () => {
      addMessage("disconnect", "received", "Disconnected from server");
      isConnected = false;
    });

    socket.on("connection_success", (args) => {
      addMessage("connection_success", "received", args);
    });

    socket.on("connection_error", (args) => {
      addMessage("connection_error", "recibido", args);
      loadingStore.stopLoading();
    });

    socket.on("error", (error) => {
      addMessage("error", "recibido", error);
      loadingStore.stopLoading();
    });

    // Lobby events
    socket.on("joined_lobby", (args) => {
      addMessage("joined_lobby", "received", args);
      currentLobbyId = args.lobby_id;
      
      // Update the lobby store
      lobbyStore.update(lobby => ({
        ...lobby,
        code: args.lobby_id,
        players: []
      }));
    });

    socket.on("new_user_in_lobby", (args) => {
      addMessage("new_user_in_lobby", "recibido", args);
    });

    socket.on("lobby_info", (args) => {
      addMessage("lobby_info", "recibido", args);
    });

    socket.on("exited_lobby", (args) => {
      addMessage("exited_lobby", "received", args);
      currentLobbyId = "";
      
      // Reset the lobby store
      lobbyStore.update(lobby => ({
        ...lobby,
        code: "0000",
        players: []
      }));
    });

    socket.on("player_left", (args) => {
      addMessage("player_left", "received", args);
    });

    socket.on("new_lobby_message", (args) => {
      addMessage("new_lobby_message", "recibido", args);
    });

    // Capture all events for the log
    socket.onAny((event, ...args) => {
      if (!["connect", "disconnect", "connection_success", "connection_error", 
            "error", "joined_lobby", "new_user_in_lobby", "lobby_info", 
            "exited_lobby", "player_left", "new_lobby_message"].includes(event)) {
        addMessage(event, "recibido", args);
      }
    });
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      addMessage("disconnect", "enviado", "Desconexión manual");
      socketStore.set(null);
    }
  }

  async function joinLobby() {
    if (!isConnected) {
      addMessage("error", "local", "No conectado");
      return;
    }
    
    if (!lobbyCodeInput) {
      addMessage("error", "local", "Código de lobby vacío");
      return;
    }
    
    try {
      // 1. First use the HTTP endpoint to join the lobby
      loadingStore.startLoading('Joining lobby via API...');
      const joinSuccess = await joinLobbyFetch(lobbyCodeInput);
      loadingStore.stopLoading();
      
      if (!joinSuccess) {
        addMessage("error", "local", "Error al unirse al lobby via API");
        return;
      }
      
      addMessage("join_api", "enviado", "Joined lobby via API successfully");
      
      // 2. Then use Socket.IO to join the room
      socket.emit("join_lobby", lobbyCodeInput);
      addMessage("join_lobby", "enviado", lobbyCodeInput);
      
      // 3. Request lobby information
      socket.emit("get_lobby_info", lobbyCodeInput);
      addMessage("get_lobby_info", "enviado", lobbyCodeInput);
      
      currentLobbyId = lobbyCodeInput;
    } catch (error) {
      addMessage("error", "local", "Error: " + error.message);
      loadingStore.stopLoading();
    }
  }

  function exitLobby() {
    if (!isConnected) {
      addMessage("error", "local", "No conectado");
      return;
    }
    
    if (!currentLobbyId) {
      addMessage("error", "local", "No estás en ningún lobby");
      return;
    }
    
    socket.emit("exit_lobby", currentLobbyId);
    addMessage("exit_lobby", "enviado", currentLobbyId);
  }

  function sendMessage() {
    if (!isConnected) {
      addMessage("error", "local", "No conectado");
      return;
    }
    
    if (!currentLobbyId) {
      addMessage("error", "local", "No estás en ningún lobby");
      return;
    }
    
    if (!messageInput.trim()) {
      addMessage("error", "local", "Mensaje vacío");
      return;
    }
    
    socket.emit("broadcast_to_lobby", currentLobbyId, messageInput);
    addMessage("broadcast_to_lobby", "enviado", {
      lobby_id: currentLobbyId,
      message: messageInput
    });
    
    messageInput = "";
  }

  function clearMessages() {
    messages = [];
  }

  function startGameTest() {
    if (!socket || !currentLobbyId) {
      addMessage("error", "local", "No conectado o no estás en un lobby");
      return;
    }
    
    socket.emit("start_game", currentLobbyId);
    addMessage("start_game", "enviado", currentLobbyId);
  }
  
  function playHandTest() {
    if (!socket || !currentLobbyId) {
      addMessage("error", "local", "No conectado o no estás en un lobby");
      return;
    }
    
    // Formato corregido según lo que espera el backend
    const testHand = {
      Cards: [
        { Suit: "h", Rank: "10" },
        { Suit: "h", Rank: "J" },
        { Suit: "h", Rank: "Q" }
      ],
      Jokers: 0,
      Gold: 100
    };
    
    socket.emit("play_hand", testHand);
    addMessage("play_hand", "enviado", JSON.stringify(testHand, null, 2));
  }
  
  function drawCardsTest() {
    if (!socket || !currentLobbyId) {
      addMessage("error", "local", "No conectado o no estás en un lobby");
      return;
    }
    
    // Formato corregido según lo que espera el backend
    const currentHand = {
      Cards: [
        { Suit: "h", Rank: "10" },
        { Suit: "h", Rank: "J" }
      ],
      Jokers: 0,
      Gold: 100
    };
    
    socket.emit("draw_cards", currentHand);
    addMessage("draw_cards", "enviado", JSON.stringify(currentHand, null, 2));
  }
  
  function getFullDeckTest() {
    if (!socket || !currentLobbyId) {
      addMessage("error", "local", "No conectado o no estás en un lobby");
      return;
    }
    
    socket.emit("get_full_deck");
    addMessage("get_full_deck", "enviado", "Requesting full deck");
  }

  onDestroy(() => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });
</script>

<div class="modal-container">
  <div class="modal-content">
    <div class="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4">
      <div class="space-y-4">
        <div class="card p-4">
          <h3 class="h3 mb-4">WebSocket Test</h3>
          
          <div class="space-y-4">
            {#if !isConnected}
              <button class="btn variant-filled-primary" on:click={connect}>Conectar</button>
            {:else}
              <button class="btn variant-filled-error" on:click={disconnect}>Desconectar</button>
            {/if}
          </div>

          <div class="card p-2 mt-4">
            <h4 class="h4 mb-2">Pruebas de Lobby</h4>
            <div class="space-y-2">
              <div class="input-group input-group-divider">
                <input 
                  bind:value={lobbyCodeInput} 
                  type="text" 
                  placeholder="Código de Lobby" 
                  class="input"
                />
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-sm variant-filled-secondary" on:click={joinLobby}>Unirse al Lobby</button>
                <button class="btn btn-sm variant-filled-secondary" on:click={exitLobby}>Salir del Lobby</button>
              </div>
            </div>
          </div>

          <div class="card p-2 mt-4">
            <h4 class="h4 mb-2">Enviar mensaje</h4>
            <div class="space-y-2">
              <div class="input-group input-group-divider">
                <input 
                  bind:value={messageInput} 
                  type="text" 
                  placeholder="Mensaje" 
                  class="input"
                />
                <button class="variant-filled-secondary" on:click={sendMessage}>Enviar</button>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <p>Estado actual:</p>
            <ul class="list">
              <li>Conectado: {isConnected ? 'Sí' : 'No'}</li>
              <li>Usuario: {username}</li>
              <li>Lobby actual: {currentLobbyId || 'Ninguno'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card p-4 variant-filled-surface">
        <div class="flex justify-between items-center mb-4">
          <h3 class="h3">Registro de Mensajes</h3>
          <button class="btn btn-sm variant-filled" on:click={clearMessages}>Limpiar</button>
        </div>
        
        <div class="h-[60vh] overflow-auto space-y-2 p-2 bg-surface-700/50 rounded-container-token">
          {#each messages as msg, i}
            <div class="card p-2 {msg.direction === 'enviado' ? 'variant-soft-primary' : msg.direction === 'recibido' ? 'variant-soft-secondary' : 'variant-soft-tertiary'}">
              <div class="flex justify-between items-center">
                <span class="badge {msg.direction === 'enviado' ? 'variant-filled-primary' : msg.direction === 'recibido' ? 'variant-filled-secondary' : 'variant-filled-tertiary'}">{msg.type}</span>
                <span class="badge variant-filled">{msg.direction}</span>
              </div>
              <pre class="whitespace-pre-wrap text-xs mt-2 p-2 bg-surface-900/30 rounded">{msg.content}</pre>
            </div>
          {/each}
          
          {#if messages.length === 0}
            <p class="text-center p-4 opacity-50">No hay mensajes</p>
          {/if}
        </div>
      </div>

      <div class="card p-4 variant-filled-surface">
        <h3 class="h3 mb-4">Acciones de Juego</h3>
        
        <div class="grid grid-cols-2 gap-2">
          <button class="btn variant-filled-primary" on:click={startGameTest} disabled={!isConnected || !currentLobbyId}>
            Iniciar Juego
          </button>
          
          <button class="btn variant-filled-secondary" on:click={playHandTest} disabled={!isConnected || !currentLobbyId}>
            Jugar Mano de Prueba
          </button>
          
          <button class="btn variant-filled-tertiary" on:click={drawCardsTest} disabled={!isConnected || !currentLobbyId}>
            Pedir Cartas
          </button>
          
          <button class="btn variant-filled-secondary" on:click={getFullDeckTest} disabled={!isConnected || !currentLobbyId}>
            Ver Mazo Completo
          </button>
        </div>
      </div>
    </div>
  </div>
</div> 