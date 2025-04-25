<script lang="ts">
    import type { GameEndInfo } from "$lib/interfaces";
    import { gameEndStore } from "$lib/stores";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { get } from "svelte/store";


    const modalStore = getModalStore();

    const info:GameEndInfo = get(gameEndStore);

    function onExit(){
        modalStore.close();
    }

</script>


<div class="card p-6 w-[18vw] shadow-xl space-y-4">
    <!--Image of crown-->
    <div class="relative w-full flex justify-center items-center mt-4">
        <img
            alt="star backdrop"
            src="cards/vouchers/sale_ball.png"
            class="absolute w-[17vh] pulse-shadow"
            style="transform-style: preserve-3d;"
        />
        <img 
            alt="Joker hat"
            src="joker-hat.svg"
            class="w-[15vh] z-50"
        />
    </div>

    <!--Title-->
    <div class="text-6xl-r">YOU LOSE!</div>
    
    
    <!--Info card-->
    <div class="card variant-filled-surface p-4">
        <div class="text-3xl-r">
            {info.winner}
        </div>
        <div class="card text-2xl-r p-5">
            Points
            <div class="text-5xl-r p-3">
                {info.points}
            </div>
        </div>
    </div>
    
    <button class="btn variant-filled-tertiary text-4xl-r" on:click={onExit}>
        Home
    </button>

</div>
    
<style>
    .text-6xl-r {
		font-size: 5vh;
		line-height: 1;
	}

	.text-5xl-r {
		font-size: 4.5vh;
		line-height: 1;
	}

	.text-4xl-r {
		font-size: 3vh;
		line-height: 1;
	}

	.text-3xl-r {
		font-size: 2.5vh;
		line-height: 1;
	}

	.text-2xl-r {
		font-size: 2vh;
		line-height: 1;
	}

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