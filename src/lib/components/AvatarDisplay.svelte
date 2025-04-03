<script lang="ts">
    import { avatarDirectory } from "$lib/avatarsDirectory";

    export let icon: number = 1;
    export let width: number = 100;
    export let classW: string = "";

</script>

{#if (icon <= 0 || icon > avatarDirectory.length)}
    {#if classW !== ""}
    <img
        src="icons/missing.png"
        alt="Missing"
        style="border-radius: 100%;"
        class={`w-${classW} aspect-square object-cover`}
    />
    {:else}
    <img
        src="icons/missing.png"
        alt="Missing"
        style="width: {width}px; height: {width}px; border-radius: 100%;"
    />
    {/if}
{:else}
    {#if classW !== ""}
        <img
            src={avatarDirectory[icon - 1].link}
            alt={avatarDirectory[icon - 1].name}
            style="border-radius: 100%;"
            class={`w-${classW} aspect-square object-cover`}
        />
    {:else}
        <img
            src={avatarDirectory[icon - 1].link}
            alt={avatarDirectory[icon - 1].name}
            style="width: {width}px; height: {width}px; border-radius: 100%;"
        />
    {/if}
{/if}
