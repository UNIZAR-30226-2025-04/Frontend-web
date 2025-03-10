<script lang="ts">
    import { avatarDirectory } from "$lib/avatarsDirectory";

    // Wich one of the icons to use
    export let icon:number = 1;
    // How big is the image
    export let width:number = 100;

    if (icon < 0 || icon >= avatarDirectory.length){
        icon = 1;
    }

</script>

<img 
    src={avatarDirectory[icon-1].link} 
    alt={avatarDirectory[icon-1].name} 
    style="width: {width}px; height: {width}px; border-radius: 100%;"
/>

