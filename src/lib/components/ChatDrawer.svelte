<script lang="ts">
    import type { ChatBuble } from "$lib/interfaces";
    import AvatarDisplay from "./AvatarDisplay.svelte";
    import { chatStore } from "$lib/stores";

    let elemChat: HTMLElement;

    let currentMessage = "";
    let chatLength = 0;
    let messageFeed: ChatBuble[] = [];

    // Reactive variables
    chatStore.subscribe(chats => {
        chatLength = chats.length;
        messageFeed = chats;
    });


    // Function to scroll to bottom on new message
    function scrollChatBottom(behavior?: ScrollBehavior): void {
        elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
    }

    function addMessage(): void {
        // Gets the time and formats it
        const now = new Date();
        const timeString = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        });
        // Create dummy message, implement later
        const newMessage: ChatBuble = {
            id: chatLength,
            isMe: Math.random() < 0.5, 
            avatar: 1,
            username: 'Jane',
            timestamp: timeString,
            message: currentMessage,
        };
        // Append the new message to the message feed
        chatStore.update(chats => [...chats, newMessage]);
        // Clear the textarea message
        currentMessage = '';
        // Smoothly scroll to the bottom of the feed
        setTimeout(() => { scrollChatBottom('smooth'); }, 0);
    }

</script>

<div class="h-full grid grid-rows-[1fr_auto] gap-1">
    <!--FEED-->
    <div bind:this={elemChat} class="bg-surface-500/30 p-4 overflow-y-auto">
        <section class="w-full p-4 overflow-y-auto space-y-4">
            {#each messageFeed as bubble, i}
                {#if bubble.isMe === true}
                    <!-- Host Message Bubble -->
                    <div class="grid grid-cols-[1fr_auto] gap-2">
                        <div class="card p-4 rounded-tr-none space-y-2 variant-soft-primary">
                            <header class="flex justify-between items-center">
                                <p class="font-bold">{bubble.username}</p>
                                <small class="opacity-50">{bubble.timestamp}</small>
                            </header>
                            <p class="text-left">{bubble.message}</p>
                        </div>
                        <AvatarDisplay icon={bubble.avatar} width={55}/>
                    </div>
                {:else}
                    <!-- Guest Message Bubble -->
                    <div class="grid grid-cols-[auto_1fr] gap-2">
                        <AvatarDisplay icon={bubble.avatar} width={55}/>
                        <div class="card p-4 rounded-tr-none space-y-2 variant-soft-secondary">
                            <header class="flex justify-between items-center">
                                <p class="font-bold">{bubble.username}</p>
                                <small class="opacity-50">{bubble.timestamp}</small>
                            </header>
                            <p class="text-left">{bubble.message}</p>
                        </div>
                    </div>
                {/if}
            {/each}
        </section>
    </div>

    <!--PROMT-->
    <div class="bg-surface-500/30 p-4">
        <div
            class="input-group input-group-divider grid-cols-[1fr_auto] rounded-container-token"
        >
            <textarea
                bind:value={currentMessage}
                class="bg-transparent border-0 ring-0"
                name="prompt"
                id="prompt"
                placeholder="Write a message..."
                rows="1"
            />
            <button class="variant-filled-primary" on:click={addMessage}>Send</button>
        </div>
    </div>
</div>
