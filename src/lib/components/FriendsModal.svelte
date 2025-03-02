<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { userDataStore } from '$lib/stores';
    import  AvatarDisplay  from "./AvatarDisplay.svelte";
    import { avatarDirectory } from "$lib/avatarsDirectory";
	import { flip } from 'svelte/animate';

    // Props
    /** Exposes parent props to this component. */
    export let parent: SvelteComponent;

    interface listItem {
        key: number
        username: string
        icon: number
    }

    // Value of the username search bar
    let usernameSearch: string;
    // Array of saved users, only icon and username
    let savedFriends: listItem[];
    // Array of pending user requests, only icon and username
    let pendingRequests: listItem[];
    // Text of the Add button, used to change it to "..." while it process
    let AddText: string = "Add";


    /**
     * Removes from the savedFriends list the index
     * @param index
     * @async
     */
    async function removeFriend(index:number){
        let auxUsername:string = savedFriends[index].username;
        savedFriends[index].username = "Removing..."
        savedFriends=savedFriends;
        await sleep(2000);
        savedFriends.splice(index,1);
        savedFriends = savedFriends;
    }

    /**
     * Removes from the pending list the index
     * @param index
     * @async
     */
    async function removeRequest(index:number){
        let auxUsername:string = pendingRequests[index].username;
        pendingRequests[index].username = "Removing..."
        pendingRequests=pendingRequests;
        await sleep(2000);
        pendingRequests.splice(index,1);
        pendingRequests = pendingRequests;
    }

    /**
     * Adds the username on the search bar to the pendingRequests list
     * @async
     */
    async function clickOnAdd() {
        AddText = "...";
        await sleep(2000);
        let newFriendRequest: listItem = {username:usernameSearch,icon:1,key:pendingRequests.length};
        pendingRequests = [...pendingRequests, newFriendRequest];
        AddText = "Add";
    }

    /**
     * Dummy function to sleep ms while we wait or backend to have the API ready
     * @param ms
     */
     function sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Test data while we wait for endpoints
    savedFriends = [
        {username:"Victor",icon:1,key:0},
        {username:"Emilliano",icon:2,key:1},
        {username:"Jogue",icon:3,key:2},
        {username:"Ruben",icon:4,key:3},
        {username:"Jota",icon:1,key:4},
        {username:"Josemi",icon:2,key:5},
        {username:"Yago",icon:3,key:6},
        {username:"Nicolas",icon:4,key:7},

    ]
    pendingRequests = [
        {username:"Solana",icon:5,key:0},
        {username:"Diego",icon:6,key:1},
        {username:"Elias",icon:7,key:2},
        {username:"Zanos",icon:8,key:3},
        {username:"Raul",icon:5,key:4},
        {username:"Tristan",icon:6,key:5},
    ]
    

</script>

<!-- @component Friends modal to send/eliminate friend requests and show/eliminate saved friends -->
<div class="modal-form card p-4 w-[450px] shadow-xl space-y-4 text-left">
    <!--Top row, title and cross button-->
    <div class="flex justify-between">
        <div class="content-center text-[22px]">Add friend</div>
        <button class="block btn-icon-sm rounded-md font-bold variant-filled text-[18px]" on:click={parent.onClose}>X</button>
    </div>
    <!--Search box and Add button-->
    <div class="flex gap-[15px] justify-between">
        <input class="input" type="text" placeholder="Type username here" bind:value={usernameSearch}/>
        <button class="btn variant-filled" on:click={clickOnAdd}>{AddText}</button>
    </div>
    <!--Title and vertical scroll for saved friends-->
    <div class="content-center text-[18px]">Save friends</div>
    <div class="h-52 overflow-y-auto p-2">
        {#each savedFriends as friend, index (friend.key)}
            <div animate:flip class="flex mb-2 gap-3">
                <!--on:click funtions need to be anonimus so a landa function is necesary-->
                <button class="btn-icon-sm rounded-md font-bold variant-filled text-[15px]" on:click={() => {removeFriend(index)}}>X</button>
                <div class="content-center"><AvatarDisplay icon={friend.icon} width={35}/></div>
                <div class="content-center text-[22px]">{friend.username}</div>
            </div>
        {/each}
    </div>
    <!--Title and vertical scroll for pending friend requests-->
    <div class="content-center text-[18px]">Pending friend requests</div>
    <div class="h-52 overflow-y-auto p-2">
        {#each pendingRequests as request, index (request.key)}
            <div animate:flip class="flex mb-2 gap-3">
                <!--on:click funtions need to be anonimus so a landa function is necesary-->
                <button class="btn-icon-sm rounded-md font-bold variant-filled text-[15px]" on:click={() => {removeRequest(index)}}>X</button>
                <div class="content-center"><AvatarDisplay icon={request.icon} width={35}/></div>
                <div class="content-center text-[22px]">{request.username}</div>
            </div>
        {/each}
    </div>
</div>