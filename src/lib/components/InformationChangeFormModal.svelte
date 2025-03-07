<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import type { ProfileChangeFormData, UserData } from "$lib/interfaces";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { userDataStore } from '$lib/stores';
    import  AvatarDisplay  from "./AvatarDisplay.svelte";
    import { avatarDirectory } from "$lib/avatarsDirectory";
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { get } from "svelte/store";


    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    // Form data, it shows username and stored icon so it needs some initializing
    //let username: string = get(userDataStore).username;
    let username: string = get(userDataStore).username;
    let avatar: number = get(userDataStore).icon || 1;
    // Not initalized, if they are empty when "Change" is pressed we don't change the password of user
    let password1: string, password2: string;

    // Error code data, if error i is triggered errorCode[i] = true
    let errorCode:boolean[] = [];

    // Test that's displayed on the change button to show that the form is waiting for a response
    let ChangeButtonText = "Change";

    /**
     * It checks for errors and if there are'nt any it calls the API to change the user's data
     * @async
    */
    async function onFormSubmit(){
        errorCode[0] = false; // This username already exists
        errorCode[1] = false; // Username must follow this directives ...
        errorCode[2] = false; // Password must follow this directives ...
        errorCode[3] = password1 !== password2; // Password doesn't match

        if (errorCode.every((v) => v === false)){
            ChangeButtonText = "...";
            let formData: ProfileChangeFormData = {
                image: avatar,name: username,password: null
            }
            if(password1 !== ""){
                formData.password = password1;
            }
            await sleep(2000);
            modalStore.close();
            alert("TODO make the form submit the changes");
        }
        errorCode = errorCode;
    }

    /**
     * Deletes all data saved on the user and boots it to the landing page (/)
     * @async
     */
    async function onLogOff(){
        const logOffData:UserData = {
            username: "",
            email: "",
            password: "",
            icon: 1,
            token: "",
            remember: false
        };
        userDataStore.set(logOffData);
        // Needs to wait to update the store , I don't know exactly why
        await new Promise(resolve => setTimeout(resolve, 0));
        goto(base+"/");
        modalStore.close();
    }

    /**
     * Dummy function to sleep ms while we wait or backend to have the API ready
     * @param ms
     */
    function sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    // Style classes for the error message and the containers that hold it
    const errorContainer = 'alert variant-ghost-error p-2';
    const errorMessage = 'alert-message text-left'

</script>

<!-- @component This creates a form with built-in function to change the user data in the bd and in the store. -->

{#if $modalStore[0]}
    <form class="modal-form card p-4 w-400 shadow-xl space-y-4">
        <!--Avatar section-->
        <div class="flex">
            <AvatarDisplay icon={avatar} width={100}/>
            <label class="label text-left ml-10 mt-5">
                <span>Avatar</span>
                <select bind:value={avatar} class="select">
                    {#each avatarDirectory as v,i}
                        <option value="{i+1}">{v.name}</option>
                    {/each}
                </select>
            </label>
        </div>
        <!--Username section-->
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
        <!--Password section-->
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
        <!--Password repeat check section-->
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
        <!--Button section-->
        <div class="flex gap-6 justify-stretch">
			<button class="block btn {parent.buttonNeutral} w-full" on:click={onFormSubmit}>{ChangeButtonText}</button>
			<button class="block btn {parent.buttonNeutral} w-full" on:click={onLogOff}>Log off</button>
			<button class="block btn {parent.buttonPositive} w-full" on:click={parent.onClose}>Cancel</button>
	    </div>
    </form>
    
{/if}
