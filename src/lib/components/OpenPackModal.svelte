<script lang="ts">
    import { errorPack, packageDirectory } from "$lib/cardDirectory";
    import type {
        CardItem,
        JokerItem,
        Package,
        PackageItem,
        VoucherItem,
    } from "$lib/interfaces";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import GameCard from "./GameCard.svelte";
    import PackageCard from "./PackageCard.svelte";
    import JokerCard from "./JokerCard.svelte";
    import VoucherCard from "./VoucherCard.svelte";
    import { flip } from "svelte/animate";

    const modalStore = getModalStore();

    let packItem: PackageItem;
    let pack: Package;

    if ($modalStore[0]) {
        packItem = $modalStore[0].meta.packItem;
        if (
            packItem.packageId >= 0 &&
            packItem.packageId < packageDirectory.length
        ) {
            pack = packageDirectory[packItem.packageId];
        } else {
            pack = errorPack;
            pack = errorPack as Package;
        }
    }

    /**
     * It lift the card and marks it has picked 
     * If it was already picked it puts it down
     * @param index
     */
    function onClickCard(index: number) {
        if (pack.chooseAmount === 1)
            packItem.contents.map((cardItem) => (cardItem.picked = false));
        packItem.contents[index].picked = !packItem.contents[index].picked;
    }

    /**
     * Adds the picked card to the game state and closes modal
     */
    function onChoose(){
        if($modalStore[0] && $modalStore[0].meta.state){
            if(pack.contentType === 0){
                toCardItems(packItem.contents).forEach(cardItem => {
                    if(cardItem.picked){
                        // TODO add to deck or smt
                    }
                });
            }else if(pack.contentType === 1){
                toJokerItems(packItem.contents).forEach(jokerItem => {
                    if(jokerItem.picked){
                        $modalStore[0].meta.state.jokers.push(jokerItem);
                    }
                });
            }else{
                toVoucherItems(packItem.contents).forEach(voucherItem => {
                    if(voucherItem.picked){
                        $modalStore[0].meta.state.vouchers.push(voucherItem);
                    }
                });
            }
        }
        modalStore.close();
    }

    // Type inference functions

    function toCardItems(items: unknown[]): CardItem[] {
        return items as CardItem[];
    }

    function toJokerItems(items: unknown[]): JokerItem[] {
        return items as JokerItem[];
    }

    function toVoucherItems(items: unknown[]): VoucherItem[] {
        return items as VoucherItem[];
    }

</script>

<div
    class="w-[45vh] card p-4 grid grid-rows-[1fr_3fr_4fr_1fr] items-center"
>
    {#if $modalStore[0] && pack && packItem}
        <div
            class="w-full card variant-filled-surface text-[2.5vh] leading-none p-2"
        >
            <p>{pack.name}</p>
        </div>

        <div class="relative w-full flex justify-center items-center">
            <img
                alt="star backdrop"
                src="cards/packs/sale_ball.png"
                class="absolute w-[24vh] pulse-shadow"
                style="transform-style: preserve-3d;"
            />
            <PackageCard
                width="w-[16vh]"
                packageId={packItem.packageId}
                animateCard={true}
            />
        </div>

        {#if packItem.contents}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class=" w-full card variant-filled-surface p-3 flex flex-col justify-between">
                <div class="flex gap-3 justify-around">
                    {#if pack.contentType === 0}
                        <!--Normal card type-->
                        {#each toCardItems(packItem.contents) as card, index (card.id)}
                            <div
                                animate:flip={{
                                    duration:
                                        $modalStore[0].meta.animationSpeed,
                                }}
                                class={`transition-transform duration-[${$modalStore[0].meta.animationSpeed * 2}] ease-in-out
                                    ${card.picked ? "translate-y-[-10%]" : ""}`}
                                on:click={() => onClickCard(index)}
                            >
                                <GameCard
                                    width="w-[12vh]"
                                    card={card.card}
                                    animateCard={true}
                                />
                            </div>
                        {/each}
                    {:else if pack.contentType === 1}
                        <!--Joker type-->
                        {#each toJokerItems(packItem.contents) as joker, index (joker.id)}
                            <div
                                animate:flip={{
                                    duration:
                                        $modalStore[0].meta.animationSpeed,
                                }}
                                class={`transition-transform duration-[${$modalStore[0].meta.animationSpeed * 2}] ease-in-out
                                    ${joker.picked ? "translate-y-[-10%]" : ""}`}
                                on:click={() => onClickCard(index)}
                            >
                                <JokerCard
                                    width="w-[12vh]"
                                    jokerId={joker.jokerId}
                                    editionId={joker.edition}
                                    animateCard={true}
                                />
                            </div>
                        {/each}
                    {:else}
                        <!--Voucher type-->
                        {#each toVoucherItems(packItem.contents) as voucher, index (voucher.id)}
                            <div
                                animate:flip={{
                                    duration:
                                        $modalStore[0].meta.animationSpeed,
                                }}
                                class={`transition-transform duration-[${$modalStore[0].meta.animationSpeed * 2}] ease-in-out
                                    ${voucher.picked ? "translate-y-[-10%]" : ""}`}
                                on:click={() => onClickCard(index)}
                            >
                                <VoucherCard
                                    width="w-[12vh]"
                                    voucherId={voucher.voucherId}
                                    animateCard={true}
                                />
                            </div>
                        {/each}
                    {/if}
                </div>
                <div class="mt-[5%] h-[20%]">
                    {#if pack.chooseAmount > 1}
                        Choose up to {pack.chooseAmount}
                    {:else}
                        Choose 1
                    {/if}
                </div>
            </div>
        {/if}

        <div class="w-full flex justify-between gap-3 p-2">
            <button
                class="w-full btn text-[2.5vh] leading-none variant-filled-tertiary"
                on:click={onChoose}
                >Choose</button
            >
            <button
                class="w-full btn text-[2.5vh] leading-none variant-filled-error"
                on:click={() => modalStore.close()}
                >Omit</button
            >
        </div>
    {/if}
</div>

<style>
    .pulse-shadow {
        animation:
            pulseShadow 4s ease-in-out infinite,
            rotate 20s linear infinite;
    }

    @keyframes pulseShadow {
        0%,
        100% {
            filter: drop-shadow(
                0px 0px 25px rgba(var(--color-warning-500) / 1)
            );
        }
        50% {
            filter: drop-shadow(0px 0px 5px rgba(var(--color-warning-500) / 1));
        }
    }

    @keyframes rotate {
        0%{
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
