<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { userDataStore } from '$lib/stores';
    import { onMount } from 'svelte';
    import { loginFetch } from '$lib/fetch/loginFetch';
    import { getDrawerStore, type DrawerSettings } from '@skeletonlabs/skeleton';
    import GameCard from '$lib/components/GameCard.svelte';
    import VoucherCard from '$lib/components/VoucherCard.svelte';

	onMount(async () => {
		// If user is cached and wants to be remembered we log in and get info
		if( $userDataStore.token !== "" && $userDataStore.remember === true){
			try{
				await loginFetch($userDataStore.email,$userDataStore.password,true);
				goto(base+"/home");
			}catch(err:any){
				console.log(err.message);
				// If it fails we don't try again
				userDataStore.update(user => ({
					...user,
					remember: false
				}));
			}
		}
	});
		


	function scrollToBottom() {
	  const targetPosition = document.body.scrollHeight;
	  const startPosition = window.scrollY;
	  const distance = targetPosition - startPosition;
	  const duration = 1000;
	  let startTime: number | null = null;
  
	  function scrollAnimation(currentTime: number) {
		if (!startTime) startTime = currentTime;
		const timeElapsed = currentTime - startTime;
		const progress = Math.min(timeElapsed / duration, 1);
		const ease = progress < 0.5
		  ? 2 * progress * progress
		  : 1 - Math.pow(-2 * progress + 2, 2) / 2;
		
		window.scrollTo(0, startPosition + (distance * ease));
		if (timeElapsed < duration) {
		  requestAnimationFrame(scrollAnimation);
		}
	  }
  
	  requestAnimationFrame(scrollAnimation);
	}
</script>


<!-- Game logo -->
<img class='logo' src='nogler2.png' alt="Nogler" style="margin-top: 2vh; height: 40vmin; width: auto"/>
<!-- Game description -->
<p class='description' style="font-size: max(2vmin,15px); margin-top: 4%; margin-right: 10%; margin-left: 10%; ">
	Play against your friends in this cross platform Balatro inspired card game
</p>
<!-- Button: Start playing-->
<a href="{base}/login" class="btn variant-filled p-[1.5vmin]" style="margin-top: 2%; font-size: max(2vmin,15px);">
	<span>Login page</span>
</a>

<!-- Scroll how to play	-->
<button class='howToPlay' style="margin-top: 6%; font-size: max(1.5vmin,12px);" on:click={scrollToBottom}>
	<p>How to play</p>
	<i class="arrow down" style="margin-top: 0;"></i>
</button>

 
 <!-- Card 1: Cards -->
 <div class="card-hover gap-3" style="height: auto; width: 50vw; margin-top: 10%; display: flex; flex-direction: row; flex-wrap: wrap; align-items: center;">
    <div style="max-width: 85%; flex: 1;">
		<h1 style="font-size: max(2vmin,15px);">Cards & Jokers</h1>
		<p style="text-justify: inter-word; text-align: justify; font-size: max(1.5vmin,12px);">
			In Nogler, your main objective is to build the strongest poker hands using a standard deck of playing cards—but the real depth comes from the jokers. 
			These special cards don't go into your hand; instead, they sit beside it and passively enhance your plays. 
			Some jokers multiply your score when certain hands are played, others give bonuses for using specific suits, and some completely bend the rules of the game. 
			With hundreds of possible combinations, jokers open up endless strategic possibilities, allowing you to tailor your deck to your personal playstyle or to counter your opponents' tactics.
		</p>
	</div>
	<GameCard width="125px" card={{
		rank:"A",
		suit:"h",
		faceUp:true,
		overlay:0
	}} animateCard={true}/>
 </div>
<!-- Card 2: Shop -->
<div class="card-hover gap-3" style="height: auto; width: 50vw; display: flex; flex-direction: row; flex-wrap: wrap; align-items: center;">
	<VoucherCard voucherId={0} width="w-[125px]" animateCard={true}/>
	<div style="max-width: 85%; flex: 1;">
		<h1 style="font-size: max(2vmin,15px);">Shop</h1>
		<p style="text-justify: inter-word; text-align: justify; font-size: max(1.5vmin,12px);">
			Between rounds, players enter the Shop, a key phase where strategy takes shape. 
			Here, you can spend your winnings to buy new jokers, consumables, or card packs. 
			Each item can drastically change the flow of the game: jokers offer passive boosts, consumables let you sabotage opponents or gain temporary advantages, and card packs provide a randomized mix of both. 
			Managing your resources wisely in the Shop is crucial—not just for building your own power, but for staying one step ahead of everyone else.
		</p>
	</div>
 </div>
<!-- Card Container: align cards in a row -->
<div class="card-container" style="width: 50vw; display: flex; justify-content: space-between; margin-top: 10px">
     <!-- Card 3: Friends -->
     <div class="card-hover" style="height: auto; width: 49%; margin: 0px">
         <h1 style="font-size: max(2vmin,15px);">Friends</h1>
         <p style="text-justify: inter-word; text-align: justify; font-size: max(1.5vmin,12px);">
			Nogler lets you bring your friends into the fun with a built-in friend system. 
			Add players, send and accept friend requests, and easily invite them to private matches—because games are always better with good company.
         </p>
     </div>
     <!-- Card 4: Compete -->
     <div class="card-hover" style="height: auto; width: 49%; margin: 0px">
         <h1 style="font-size: max(2vmin,15px);">Compete</h1>
         <p style="text-justify: inter-word; text-align: justify; font-size: max(1.5vmin,12px);">
			Step into the competition with Nogler's real-time multiplayer mode. Face off against other players in intense, strategic matches—only the smartest and boldest will climb to the top. 
			Compete, adapt, and prove you've got what it takes to win.
         </p>
     </div>
</div>

<style>
	.btn:hover{
		background-color:#007BFF
	}

	.arrow {
		border: solid rgb(255, 255, 255);
		border-width: 0 3px 3px 0;
		display: inline-block;
		padding: 3px;
	}

	.howToPlay {
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.howToPlay:hover {
		transform: scale(1.1);
		color: #007BFF;
	}

	.howToPlay:hover p {
		font-weight: bold;
	}

	.howToPlay:hover .arrow {
		border-color: #007BFF;
	}

	.down {
		transform: rotate(45deg);
		-webkit-transform: rotate(45deg);
	}

	.card-hover {
        width: 300px;
        height: 300px;
        margin: 10px;
        background-color: #f0f0f0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20px;
		border-radius: 10px;
    }

    .card-hover h1 {
        text-align: left;
        margin: 0;
		font-size: 25px;
		color: black;
    }

    .card-hover p {
        text-align: left;
        margin-top: 15px;
        flex-grow: 1;
		font-size: 18px;
		color: rgb(83, 83, 83);
    }

    .card-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
		margin-bottom: 100px;
    }


</style>

