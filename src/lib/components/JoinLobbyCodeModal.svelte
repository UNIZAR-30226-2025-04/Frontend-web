<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { apiBase, joinLobbyPath } from '$lib/paths';
    import { get } from 'svelte/store';
    import { base } from '$app/paths';
    import { userDataStore, lobbyStore } from '$lib/stores';
    import { goto } from '$app/navigation';

    // Props
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    let token = get(userDataStore).token;

    let code = ["", "", "", ""];
    let errorMessage = false;

    let error= '';

    const errorContainer = 'alert variant-ghost-error p-2 flex justify-center items-center text-center mt-[5%] w-[35vmin] ml-[7%]';
    const errorMessageCode = 'alert-message text-center';

    // Function to handle paste event
    document.addEventListener('paste', handlePaste);
    function handlePaste(event: ClipboardEvent) {
        const clipboardData = event.clipboardData || (window as any).clipboardData;
        const pastedData = clipboardData.getData('Text');

        if (pastedData.length === 4) {
            for (let i = 0; i < 4; i++) {
                code[i] = pastedData[i];
            }
        }
    }

    // Function to write a digit and go ahead
    function handleInput(event: Event, index: number) {
        const target = event.target as HTMLInputElement | null;
        if (!target) return;

        const value = target.value.slice(0, 1);
        code[index] = value;

        
        if (value && index < 3) {
            const nextInput = document.getElementById(`id-${index + 1}`);
            nextInput?.focus();
        }

        
        if (code.join("").length === 4) {
            checkCode();
        }
    }

    // Function to erase a digit and go back
    function handleBackspace(event: KeyboardEvent, index: number) {
        if (event.key === "Backspace" && !code[index] && index > 0) {
            const previousInput = document.getElementById(`id-${index - 1}`);
            previousInput?.focus();
        }
    }

    // Sends a POST request to the server to insert a user into a lobby
    async function joinLobbyFetch(enteredCode : string) {
        try {

			const response = await fetch(joinLobbyPath + enteredCode, {
				method: 'POST',
				headers: {
					'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
				}
			});

			if (!response.ok) {
				throw new Error("Error inserting the user into the lobby");
			}
            
            const data = await response.json();
			console.log("API response (insert the user into the lobby):", data);
            errorMessage = false;
		} catch (err:any) {
            errorMessage = true;
			error = err.message;
            console.log("API error (insert the user into the lobby):", error);
		}
    }

    // Function to check the inserted coide
    async function checkCode() {
        const enteredCode = code.join("");
        await joinLobbyFetch(enteredCode);
        if (errorMessage == false) {
            lobbyStore.update(() => ({
                code: enteredCode,
                host: false
            }));
            goto(base+"/lobby");
            parent.onClose();
        }
    }

    

</script>

{#if $modalStore[0]}
    <div class="modal-form card p-4 w-[44vmin] min-h-[25vmin] shadow-xl">
        <h1 class="text-center text-[5vmin] font-bold mt-[3%]">Join with code</h1>

        <!-- Digit input fields --> 
        <div class="flex gap-2 justify-center mt-[5%]">
            {#each code as digit, index}
                <input
                    id={"id-" + index}
                    type="text"
                    bind:value={code[index]}
                    on:input={(e) => handleInput(e, index)}
                    on:keydown={(e) => handleBackspace(e, index)}
                    maxlength="1"
                    class="w-[8vmin] h-[8vmin] text-3xl text-center border border-gray-300 rounded focus:ring focus:ring-blue-300 focus:outline-none"
                    style="color: black;"
                />
            {/each}
        </div>

        <!-- Error message for non existent code -->
        {#if errorMessage}
            <aside class="{errorContainer}">
                <div class="{errorMessageCode}">
                    Code doesn't exist!
                </div>
            </aside>
        {/if}

        <!-- Cancel button -->
        <div class="mt-[5%] w-[36vmin] ml-[6%]">
            <button class="block btn {parent.buttonPositive} w-full text-lg" on:click={parent.onClose}>Cancel</button>
        </div>
    </div>
{/if}
