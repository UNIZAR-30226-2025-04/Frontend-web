<script lang="ts">
    import { avatarDirectory } from "$lib/avatarsDirectory";

    export let icon: number = 1;
    export let width: number = 100;
    export let classAdd: string = "";

</script>

{#if (icon <= 0 || icon > avatarDirectory.length)}
    <img
        src="icons/bot.gif"
        alt="Missing"
        style="width: {width}px; height: {width}px; border-radius: 100%;"
        class={classAdd}
    />
{:else}
        <img
            src={avatarDirectory[icon - 1].link}
            alt={avatarDirectory[icon - 1].name}
            style="width: {width}px; height: {width}px; border-radius: 100%;"
            class={classAdd}
        />
{/if}
