<script lang="ts">
    import { getModalStore } from "@skeletonlabs/skeleton";
    
    const modalStore = getModalStore();


</script>

{#if $modalStore[0]}
    <div class="modal-form card p-4 w-[450px] shadow-xl space-y-4 text-left">
        <div class="flex justify-between">
            <div class="content-center text-[22px]">Hand types</div>
            <button class="block btn-icon-sm rounded-md font-bold variant-filled text-[18px]" on:click={modalStore.close}>X</button>
        </div>
        {#each $modalStore[0].meta.levels as handType, index}
            <div class="grid grid-cols-[15%_55%_30%] text-center">
                <div class="text-xl card variant-filled-surface">
                    lvl.{handType.lvl}
                </div>
                <div class="text-lg">
                    {handType.name}
                </div> 
                <div class="card variant-filled-surface gap-2 flex justify-between">
                    <div class="card variant-filled-tertiary w-full content-center">
                        {handType.baseBlue}
                    </div>
                    <div>
                        X
                    </div>
                    <div class="card variant-filled-error w-full content-center">
                        {handType.baseRed}
                    </div>
                </div>     
            </div>
        {/each}
    </div>
{/if}