<script lang="ts">
    import { avatarDirectory } from "$lib/avatarsDirectory";

    export let icon: number = 1;
    export let width: number = 100;
    export let classW: string = "";

    if (icon <= 0 || icon > avatarDirectory.length) {
        icon = 1;
    }
</script>

{#if classW !== ""}
    {#if icon <= 0}
        <img
            src={avatarDirectory[0].link}
            alt={avatarDirectory[0].name}
            style="border-radius: 100%;"
            class={`w-${classW} aspect-square object-cover`}
        />
    {:else}
        <img
            src={avatarDirectory[icon - 1].link}
            alt={avatarDirectory[icon - 1].name}
            style="border-radius: 100%;"
            class={`w-${classW} aspect-square object-cover`}
        />
    {/if}
{:else if icon <= 0}
    <img
        src={avatarDirectory[0].link}
        alt={avatarDirectory[0].name}
        style="width: {width}px; height: {width}px; border-radius: 100%;"
    />
{:else}
    <img
        src={avatarDirectory[icon - 1].link}
        alt={avatarDirectory[icon - 1].name}
        style="width: {width}px; height: {width}px; border-radius: 100%;"
    />
{/if}
