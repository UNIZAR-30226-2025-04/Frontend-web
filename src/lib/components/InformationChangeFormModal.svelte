<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import type { ProfileChangeFormData } from "$lib/interfaces";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { userDataStore } from '$lib/stores';
    import  AvatarDisplay  from "./AvatarDisplay.svelte";

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    // Form Data
    let username: string = $userDataStore.username;
    let avatar: number = $userDataStore.icon;
    let password1: string, password2: string;

    // Error code data
    let errorCode:boolean[] = [];

    // We've created a custom submit function to pass the response and close the modal.
    function onFormSubmit(): void {
        errorCode[0] = false; // This username already exists
        errorCode[1] = false; // Username must follow this directives ...
        errorCode[2] = false; // Password must follow this directives ...
        errorCode[3] = password1 !== password2; // Password doesn't match

        if (errorCode.every((v) => v === false)){
            let formData: ProfileChangeFormData = {
                image: avatar,name: username,password: null
            }
            if(password1 !== ""){
                formData.password = password1;
            }
            alert("TODO make the form submit the changes");
            modalStore.close();
        }
        errorCode = errorCode;
    }

    // Tailwind classes
    const errorContainer = 'alert variant-ghost-error p-2';
    const errorMessage = 'alert-message text-left'

</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
    <form class="modal-form card p-4 w-400 shadow-xl space-y-4">
        <div class="flex">
            <AvatarDisplay icon={avatar} width={100}/>
            <label class="label text-left">
                <span>Avatar</span>
                <select bind:value={avatar} class="select">
                    <option value="1">Avatar 1</option>
                    <option value="2">Avatar 2</option>
                    <option value="3">Avatar 3</option>
                    <option value="4">Avatar 4</option>
                    <option value="5">Avatar 5</option>
                </select>
            </label>
        </div>
        <label class="label text-left">
            <span>Username</span>
            <input
                class="input"
                type="text"
                bind:value={username}
                placeholder="Enter name..."
            />
            {#if errorCode[0]}
                <aside class="{errorContainer}">
                    <div class="{errorMessage}">
                        This username already exists
                    </div>
                </aside>
            {/if}
            {#if errorCode[1]}
                <aside class="{errorContainer}">
                    <div class="{errorMessage}">
                        Username must follow this directives ... TODO
                    </div>
                </aside>
            {/if}
        </label>
        <label class="label text-left">
            <span>Password</span>
            <input
                class="input"
                type="password"
                bind:value={password1}
                placeholder="Your new password..."
            />
            {#if errorCode[2]}
                <aside class="{errorContainer}">
                    <div class="{errorMessage}">
                        Password must follow this directives ... TODO
                    </div>
                </aside>
            {/if}
        </label>
        <label class="label text-left">
            <span>Repeat your password</span>
            <input
                class="input"
                type="password"
                bind:value={password2}
                placeholder="Your new password..."
            />
            {#if errorCode[3]}
                <aside class="{errorContainer}">
                    <div class="{errorMessage}">
                        Password doesn't match
                    </div>
                </aside>
            {/if}
        </label>
        
        <div class="flex justify-center gap-6">
			<button class="block btn {parent.buttonNeutral}" on:click={onFormSubmit}>Change</button>
			<button class="block btn {parent.buttonNeutral}" on:click={parent.onClose}>Log off</button>
			<button class="block btn {parent.buttonPositive}" on:click={parent.onClose}>Cancel</button>
	    </div>
    </form>
    
{/if}
