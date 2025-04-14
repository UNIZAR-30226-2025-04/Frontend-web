<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { userDataStore, socketStore, lobbyStore } from "$lib/stores";
  import { wsBase } from "$lib/paths";
  import { io, Socket } from "socket.io-client";
  import { get } from "svelte/store";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { joinLobbyFetch, createLobbyFetch } from "$lib/fetch/lobbyFetch";

  let socket: Socket | null = null;
  let messages: { type: string, direction: string, content: any }[] = [];
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
      content: typeof content === "object" ? JSON.stringify(content, null, 2) : content
    }, ...messages];
  }

  // Connect to the WebSocket server
  function connect() {
    loadingStore.startLoading("Connecting to WebSocket server...");
    
    socket = io(wsBase, {
      auth: {
        username: get(userDataStore).username,
        authorization: "Bearer " + get(userDataStore).token,
      },
      transports: ["websocket"],
    });


    // Connection events
    socket.on("connect", () => {
      if(!socket) return;
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
      addMessage("connection_error", "received", args);
      loadingStore.stopLoading();
    });

    socket.on("error", (error) => {
      addMessage("error", "received", error);
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
      addMessage("new_user_in_lobby", "received", args);
    });

    socket.on("lobby_info", (args) => {
      addMessage("lobby_info", "received", args);
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
      addMessage("new_lobby_message", "received", args);
    });

    // Capture all events for the log
    socket.onAny((event, ...args) => {
      if (!["connect", "disconnect", "connection_success", "connection_error", 
        "error", "joined_lobby", "new_user_in_lobby", "lobby_info", 
            "exited_lobby", "player_left", "new_lobby_message"].includes(event)) {
        addMessage(event, "received", args);
      }
    });
  }

  // Disconnect from the WebSocket server
  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      addMessage("disconnect", "sent", "Manual disconnect");
      // Can't set to null
      //socketStore.set(null);
    }
  }

  // Join a lobby using the provided lobby code
  async function joinLobby() {
    if (!isConnected || !socket) {
      addMessage("error", "local", "Not connected");
      return;
    }
    
    if (!lobbyCodeInput) {
      addMessage("error", "local", "Lobby code is empty");
      return;
    }
    
    try {
      // 1. Call the HTTP endpoint to join the lobby
      loadingStore.startLoading('Joining lobby via API...');
      const joinSuccess = await joinLobbyFetch(lobbyCodeInput);
      loadingStore.stopLoading();
      
      if (!joinSuccess) {
        addMessage("error", "local", "Error joining lobby via API");
        return;
      }
      
      addMessage("join_api", "sent", "Joined lobby via API successfully");
      
      // 2. Use Socket.IO to join the room
      socket.emit("join_lobby", lobbyCodeInput);
      addMessage("join_lobby", "sent", lobbyCodeInput);
      
      // 3. Request lobby information
      socket.emit("get_lobby_info", lobbyCodeInput);
      addMessage("get_lobby_info", "sent", lobbyCodeInput);
      
      currentLobbyId = lobbyCodeInput;
    } catch (error:any) {
      addMessage("error", "local", "Error: " + error.message);
      loadingStore.stopLoading();
    }
  }

  // Leave the current lobby
  function exitLobby() {
    if(!socket) return;

    if (!isConnected) {
      addMessage("error", "local", "Not connected");
      return;
    }
    
    if (!currentLobbyId) {
      addMessage("error", "local", "Not in any lobby");
      return;
    }
    
    socket.emit("exit_lobby", currentLobbyId);
    addMessage("exit_lobby", "sent", currentLobbyId);
  }

  // Send a message to the lobby
  function sendMessage() {
    if(!socket) return;
    
    if (!isConnected) {
      addMessage("error", "local", "Not connected");
      return;
    }
    
    if (!currentLobbyId) {
      addMessage("error", "local", "Not in any lobby");
      return;
    }
    
    if (!messageInput.trim()) {
      addMessage("error", "local", "Message is empty");
      return;
    }
    
    socket.emit("broadcast_to_lobby", currentLobbyId, messageInput);
    addMessage("broadcast_to_lobby", "sent", {
      lobby_id: currentLobbyId,
      message: messageInput
    });
    
    messageInput = "";
  }

  // Clear the message log
  function clearMessages() {
    messages = [];
  }

  // Test starting the game
  function startGameTest() {
    if (!socket || !currentLobbyId) {
      addMessage("error", "local", "Not connected or not in a lobby");
      return;
    }
    
    socket.emit("start_game", currentLobbyId);
    addMessage("start_game", "sent", currentLobbyId);
  }
  
  // Test playing a hand
  function playHandTest() {
    if (!socket || !currentLobbyId) {
      addMessage("error", "local", "Not connected or not in a lobby");
      return;
    }
    
    // Corrected format as expected by the backend
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
    addMessage("play_hand", "sent", JSON.stringify(testHand, null, 2));
  }
  
  // Test drawing cards
  function drawCardsTest() {
    if (!socket || !currentLobbyId) {
      addMessage("error", "local", "Not connected or not in a lobby");
      return;
    }
    
    // Corrected format as expected by the backend
    const currentHand = {
      Cards: [
        { Suit: "h", Rank: "10" },
        { Suit: "h", Rank: "J" }
      ],
      Jokers: 0,
      Gold: 100
    };
    
    socket.emit("draw_cards", currentHand);
    addMessage("draw_cards", "sent", JSON.stringify(currentHand, null, 2));
  }
  
  // Test getting the full deck
  function getFullDeckTest() {
    if (!socket || !currentLobbyId) {
      addMessage("error", "local", "Not connected or not in a lobby");
      return;
    }
    
    socket.emit("get_full_deck");
    addMessage("get_full_deck", "sent", "Requesting full deck");
  }

  // Test room creation and joining the lobby
  async function createLobbyTest() {
    loadingStore.startLoading('Creating lobby via test...');
    try {
      const result = await createLobbyFetch(true);
      if (result) {
        currentLobbyId = get(lobbyStore).code;
        if(socket){
          socket.emit("join_lobby", currentLobbyId);
          addMessage("create_lobby", "sent", "Room created and joined successfully.");
        }else{
          addMessage("error", "local", "Must be connected before creating a lobby.");
        }
      } else {
        addMessage("error", "local", "Error creating room.");
      }
    } catch (error: any) {
      addMessage("error", "local", "Exception: " + error.message);
    } finally {
      loadingStore.stopLoading();
    }
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
              <button class="btn variant-filled-primary" on:click={connect}>Connect</button>
            {:else}
              <button class="btn variant-filled-error" on:click={disconnect}>Disconnect</button>
            {/if}
          </div>

          <div class="card p-2 mt-4">
            <h4 class="h4 mb-2">Lobby Testing</h4>
            <div class="space-y-2">
              <div class="input-group input-group-divider">
                <input 
                  bind:value={lobbyCodeInput} 
                  type="text" 
                  placeholder="Lobby Code" 
                  class="input"
                />
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-sm variant-filled-secondary" on:click={joinLobby}>Join Lobby</button>
                <button class="btn btn-sm variant-filled-secondary" on:click={exitLobby}>Exit Lobby</button>
                <button class="btn btn-sm variant-filled-success" on:click={createLobbyTest}>Create Lobby</button>
              </div>
            </div>
          </div>

          <div class="card p-2 mt-4">
            <h4 class="h4 mb-2">Send Message</h4>
            <div class="space-y-2">
              <div class="input-group input-group-divider">
                <input 
                  bind:value={messageInput} 
                  type="text" 
                  placeholder="Message" 
                  class="input"
                />
                <button class="variant-filled-secondary" on:click={sendMessage}>Send</button>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <p>Current status:</p>
            <ul class="list">
              <li>Connected: {isConnected ? 'Yes' : 'No'}</li>
              <li>User: {username}</li>
              <li>Current Lobby: {currentLobbyId || 'None'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card p-4 variant-filled-surface">
        <div class="flex justify-between items-center mb-4">
          <h3 class="h3">Message Log</h3>
          <button class="btn btn-sm variant-filled" on:click={clearMessages}>Clear</button>
        </div>
        
        <div class="h-[60vh] overflow-auto space-y-2 p-2 bg-surface-700/50 rounded-container-token">
          {#each messages as msg, i}
            <div class="card p-2 {msg.direction === 'sent' ? 'variant-soft-primary' : msg.direction === 'received' ? 'variant-soft-secondary' : 'variant-soft-tertiary'}">
              <div class="flex justify-between items-center">
                <span class="badge {msg.direction === 'sent' ? 'variant-filled-primary' : msg.direction === 'received' ? 'variant-filled-secondary' : 'variant-filled-tertiary'}">{msg.type}</span>
                <span class="badge variant-filled">{msg.direction}</span>
              </div>
              <pre class="whitespace-pre-wrap text-xs mt-2 p-2 bg-surface-900/30 rounded">{msg.content}</pre>
            </div>
          {/each}
          
          {#if messages.length === 0}
            <p class="text-center p-4 opacity-50">No messages</p>
          {/if}
        </div>
      </div>

      <div class="card p-4 variant-filled-surface">
        <h3 class="h3 mb-4">Game Actions</h3>
        
        <div class="grid grid-cols-2 gap-2">
          <button class="btn variant-filled-primary" on:click={startGameTest} disabled={!isConnected || !currentLobbyId}>
            Start Game
          </button>
          
          <button class="btn variant-filled-secondary" on:click={playHandTest} disabled={!isConnected || !currentLobbyId}>
            Play Test Hand
          </button>
          
          <button class="btn variant-filled-tertiary" on:click={drawCardsTest} disabled={!isConnected || !currentLobbyId}>
            Draw Cards
          </button>
          
          <button class="btn variant-filled-secondary" on:click={getFullDeckTest} disabled={!isConnected || !currentLobbyId}>
            View Full Deck
          </button>
        </div>
      </div>
    </div>
  </div>
</div> 