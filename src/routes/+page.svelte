<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { userDataStore } from '$lib/stores';

	// If user is cached we boot it to home
	// TODO make it actually login
	if( $userDataStore.token !== "" && $userDataStore.remember){
		goto(base+"/home");
	}


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
	Card game... Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
	sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
	<br> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
	nisi ut aliquip ex ea commodo consequat. 
</p>
<!-- Button: Start playing-->
<a href="{base}/login" class="btn variant-filled p-[1.5vmin]" style="margin-top: 2%; font-size: max(2vmin,15px);">
	<span>Login page</span>
</a>
<a href="{base}/home" class="btn variant-filled p-[1.5vmin]" style="margin-top: 2%; font-size: max(2vmin,15px);">
	<span>Home</span>
</a>
<!-- Scroll how to play	-->
<button class='howToPlay' style="margin-top: 6%; font-size: max(1.5vmin,12px);" on:click={scrollToBottom}>
	<p>How to play</p>
	<i class="arrow down" style="margin-top: 0;"></i>
</button>

 
 <!-- Card 1: Cards -->
 <div class="card-hover" style="height: auto; width: 50vw; margin-top: 10%; display: flex; flex-direction: row; flex-wrap: wrap; align-items: center;">
    <div style="max-width: 85%; flex: 1;">
		<h1 style="font-size: max(2vmin,15px);">Cards</h1>
		<p style="text-justify: inter-word; text-align: justify; font-size: max(1.5vmin,12px);">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
			eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
			ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			aliquip ex ea commodo consequat.
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
			eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
			ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			aliquip ex ea commodo consequat.
		</p>
	</div>
	<img src='icons/pxArt.png' alt='icon' style="height: auto; width:125px; margin-right=2%">
 </div>
<!-- Card 2: Shop -->
<div class="card-hover" style="height: auto; width: 50vw; display: flex; flex-direction: row; flex-wrap: wrap; align-items: center;">
    <img src='icons/pxArt.png' alt='icon' style="height: auto; width:125px; margin-left=2%">
	<div style="max-width: 85%; flex: 1;">
		<h1 style="font-size: max(2vmin,15px);">Shop</h1>
		<p style="text-justify: inter-word; text-align: justify; font-size: max(1.5vmin,12px);">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
			eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
			ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			aliquip ex ea commodo consequat.
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
			eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
			ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			aliquip ex ea commodo consequat.
		</p>
	</div>
 </div>
<!-- Card Container: align cards in a row -->
<div class="card-container" style="width: 50vw; display: flex; justify-content: space-between; margin-top: 10px">
     <!-- Card 3: Friends -->
     <div class="card-hover" style="height: auto; width: 49%; margin: 0px">
         <h1 style="font-size: max(2vmin,15px);">Friends</h1>
         <p style="text-justify: inter-word; text-align: justify; font-size: max(1.5vmin,12px);">
             Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
             eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
             ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
             aliquip ex ea commodo consequat.
         </p>
     </div>
     <!-- Card 4: Compete -->
     <div class="card-hover" style="height: auto; width: 49%; margin: 0px">
         <h1 style="font-size: max(2vmin,15px);">Compete</h1>
         <p style="text-justify: inter-word; text-align: justify; font-size: max(1.5vmin,12px);">
             Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
             eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
             ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
             aliquip ex ea commodo consequat.
         </p>
     </div>
</div>

<style>
    :global(body) {
		background-image: url('/5.jpg') !important;
		margin: 0;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		text-align: center;
		color: black;
		font-family: 'Pixelify Sans';
	}

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

