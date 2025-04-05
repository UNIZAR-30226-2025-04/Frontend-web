<script lang="ts">
    import { boucherDirectory } from "$lib/cardDirectory";
    import type { Boucher } from "$lib/interfaces";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";

    export let boucherId: number;
    export let width: string = "w-full";
    export let ratio: number = 0.714285;
    let boucher: Boucher;
    // Necesary for avoiding animation errors
    let salt:number = Math.floor(Math.random() * (100000));

    if (boucherId < 0 || boucherId >= boucherDirectory.length) {
        boucher = boucherDirectory[0];
    } else {
        boucher = boucherDirectory[boucherId];
    }

    const popupHover: PopupSettings = {
        event: "hover",
        target: boucher.name+salt,
        placement: "bottom",
    };

</script>

<div class="{width} min-w-[70px] relative">

    <div class="card p-4 variant-filled-tertiary w-[200%]" data-popup={boucher.name+salt}>
        <p>{boucher.name}: {boucher.tooltip}</p>
        <div class="arrow variant-filled-tertiary" />
    </div>

    <img
        src={boucher.image}
        alt={boucher.name}
        class="{width} min-w-[70px] rounded-[5.46875%]"
        style="aspect-ratio: {ratio};"
        use:popup={popupHover}
    />
</div>