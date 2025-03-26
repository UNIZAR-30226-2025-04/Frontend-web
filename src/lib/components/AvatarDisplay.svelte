<script lang="ts">
    import { avatarDirectory } from "$lib/avatarsDirectory";

    // Wich one of the icons to use
    export let icon:number = 1;
    // How big is the image
    export let width:number = 100;
    // Class for tailwind width
    export let classW:string = "";

    if (icon <= 0 || icon > avatarDirectory.length){
        icon = 1;
    }


</script>

{#if classW !== ""}
    <img 
    src={avatarDirectory[icon-1].link} 
    alt={avatarDirectory[icon-1].name} 
    style="border-radius: 100%;"
    class="w-{classW} aspect-square object-cover"
    />
{:else}
    <img 
        src={avatarDirectory[icon-1].link} 
        alt={avatarDirectory[icon-1].name} 
        style="width: {width}px; height: {width}px; border-radius: 100%;"
    />
{/if}
