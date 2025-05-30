<script lang="ts">
    import AvatarDisplay from "./AvatarDisplay.svelte";
    import { chatFeedElem, chatStore } from "$lib/stores";
    import { onMount, afterUpdate } from "svelte";
    import { sendMessage } from "$lib/sockets-utils/lobbySocket";
    import { getDrawerStore } from '@skeletonlabs/skeleton';
    
    let elemChat: HTMLElement;
    let currentMessage = "";
    $: messageFeed = $chatStore;

    function onSend(){
        if(currentMessage.length > 0)
            sendMessage(currentMessage);
        currentMessage = '';
    }

    function handleKeyDown(event:any) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    }

    function scrollToBottom() {
        if (elemChat) {
            elemChat.scrollTop = elemChat.scrollHeight;
        }
    }

    onMount(() => {
        // Whenever we mount the component (when the drawer is opened), we set the chat feed element
        chatFeedElem.set(elemChat);
        scrollToBottom();
    });

    afterUpdate(() => {
        // Whenever we update the component (when a new message is added), we scroll to the bottom
        scrollToBottom();
    });

    const drawerStore = getDrawerStore();

    $: if ($drawerStore.open && $drawerStore.id === 'chat') {
        setTimeout(scrollToBottom, 50);
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
                class="bg-transparent border-0 ring-0 resize-none"
                name="prompt"
                id="prompt"
                placeholder="Write a message..."
                rows="1"
                on:keydown={handleKeyDown}
            />
            <button class="variant-filled-primary" on:click={onSend}>Send</button>
        </div>
    </div>
</div>
