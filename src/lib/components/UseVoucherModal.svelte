<script lang="ts">
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { flip } from "svelte/animate";
    import GameCard from "./GameCard.svelte";
    import JokerCard from "./JokerCard.svelte";
    import PackageCard from "./PackageCard.svelte";
    import VoucherCard from "./VoucherCard.svelte";
    import type { Player, Voucher, VoucherItem } from "$lib/interfaces";
    import { voucherDirectory } from "$lib/cardDirectory";
    import type { SvelteComponent } from "svelte";
    import AvatarDisplay from "./AvatarDisplay.svelte";

    const modalStore = getModalStore();

    let voucher: Voucher;
    let vId: number;

    let pickedUsers:boolean[] = Array(10).fill(false);

    const mockPlayers: Player[] = [
        { key: 0, username: "Username", icon: 1, host: false },
        { key: 1, username: "User", icon: 2, host: false },
        { key: 2, username: "Username Long", icon: 3, host: false },
        { key: 3, username: "Username2", icon: 4, host: false },
        { key: 4, username: "A", icon: 5, host: false },
        { key: 5, username: "Username s", icon: 6, host: false },
        { key: 6, username: "Username f", icon: 0, host: false },
        { key: 7, username: "Username h", icon: 1, host: false },
    ];

    /*
    const cutN: number = 1;
    mockPlayers.splice(-cutN);
    */

    if ($modalStore[0]) {
        if ($modalStore[0].meta.voucherId) {
            vId = $modalStore[0].meta.voucherId;
            if (vId > 0 && vId < voucherDirectory.length) {
                voucher = voucherDirectory[vId];
            }
        }
    }

    function onClickUser(index:number){
        const numPicked:number = pickedUsers.filter((x) => x).length;
        if (pickedUsers[index] || (voucher.targetCount && numPicked < voucher.targetCount)){
            pickedUsers[index] = !pickedUsers[index];
        }
    }

    function onUse() {
        if ($modalStore[0].response) $modalStore[0].response(true);
        modalStore.close();
    }
</script>

<div class="h-[45vh] w-[70vh] card p-4 grid grid-cols-[2fr_3fr] items-center">
    {#if $modalStore[0] && voucher}
        <div class="flex flex-col justify-between h-full">
            <!--Voucher name-->
            <div class="text-[2.5vh] leading-none">
                {voucher.name}
            </div>

            <!--Voucher image-->
            <div class="relative w-full flex justify-center items-center">
                <img
                    alt="star backdrop"
                    src="cards/vouchers/sale_ball.png"
                    class="absolute w-[24vh] pulse-shadow"
                    style="transform-style: preserve-3d;"
                />
                <VoucherCard
                    width="w-[16vh]"
                    voucherId={vId}
                    animateCard={true}
                />
            </div>

            <!--Action buttons-->
            <div class="w-full flex justify-between gap-3 p-2">
                <button
                    class="w-full btn text-[2.5vh] leading-none variant-filled-secondary"
                    on:click={onUse}>Use</button
                >
                <button
                    class="w-full btn text-[2.5vh] leading-none variant-filled-error"
                    on:click={() => modalStore.close()}>Close</button
                >
            </div>
        </div>

        <!--Players-->
        <div class="w-full h-full flex flex-col gap-2 text-[1.5vh] leading-none">
            {#if voucher.targetCount && voucher.targetCount >1 }
                <div>
                    Choose up to {voucher.targetCount}
                </div>
            {:else}
                <div>
                    Choose 1
                </div>
            {/if}
            <div class="w-full h-full grid grid-cols-2 gap-4 content-center p-[5%]">
                {#each mockPlayers as player,index (player.key)}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class={`card flex flex-col items-center gap-[2%] p-[5%] transition-all duration-[500ms] ease-in-out 
                    ${
                        pickedUsers[index]
                        ? "variant-filled-secondary scale-[1.03]"
                        : "variant-filled-surface scale-100"
                    }`}
                    on:click={() => onClickUser(index)}>
                        <div>
                            <AvatarDisplay icon={player.icon} width={-1} classAdd="w-[4vh] aspect-square"/>
                        </div>
                        <div>
                            {player.username}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .pulse-shadow {
        animation:
            pulseShadow 8s ease-in-out infinite,
            rotate 60s linear infinite;
    }

    @keyframes pulseShadow {
        0%,
        100% {
            filter: drop-shadow(
                0px 0px 35px rgba(var(--color-secondary-500) / 1)
            );
        }
        50% {
            filter: drop-shadow(0px 0px 15px rgba(var(--color-secondary-500) / 1));
        }
    }

    @keyframes rotate {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(-180deg);
        }
        100% {
            transform: rotate(-360deg);
        }
    }
</style>
