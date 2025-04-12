<script lang="ts">
    import { errorVoucher, voucherDirectory } from "$lib/cardDirectory";
    import { cardAnimation } from "$lib/components/animator";
    import type { Voucher } from "$lib/interfaces";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import { onDestroy, onMount } from "svelte";

    export let voucherId: number; // Main data to show
    export let width: string = "w-full"; // Width of the card
    export let ratio: number = 0.714285; // Ratio of the card
    export let animateCard: boolean = false; // If the card is animated

    let voucher: Voucher;
    // Necesary for avoiding animation errors
    let salt:number = Math.floor(Math.random() * (100000));
    // Animation variables
    let stopAnimation: () => void;
    let voucherImage: HTMLImageElement;

    // If boucher exists we extract the data
    if (voucherId < 0 || voucherId >= voucherDirectory.length) {
        voucher = errorVoucher;
    } else {
        voucher = voucherDirectory[voucherId];
    }

    // Pop up settings

    const popupHover: PopupSettings = {
        event: "hover",
        target: voucher.name+salt,
        placement: "bottom",
    };

    onMount(() => {
        if(animateCard){
            stopAnimation = cardAnimation({elements:[voucherImage]});
        }
	});

    onDestroy(() => {
		if (animateCard && stopAnimation) {
			stopAnimation();
		}
	});

</script>

<div class="{width} min-w-[70px] relative">

    <!--Tooltip-->
    <div class="card p-4 variant-filled-surface w-[200%] border-2 " data-popup={voucher.name+salt}>
        <p>{voucher.name}: {voucher.tooltip}</p>
    </div>

    <!--Voucher image-->
    <img
        bind:this={voucherImage}
        src={voucher.image}
        alt={voucher.name}
        class="{width} min-w-[70px] rounded-[5.46875%] shadow-[5px_15px_10px_rgba(0,0,0,0.5)]"
        style="aspect-ratio: {ratio}; transform-style: preserve-3d;"
        use:popup={popupHover}
    />
</div>