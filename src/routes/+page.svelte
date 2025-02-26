<svelte:head>
  <style>
    @font-face {
      font-family: 'Pixelify Sans';
      src: url('fonts/PixelifySans-Medium.otf') format('woff');
    }
  </style>
</svelte:head>

<script lang="ts">
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
		border: solid black;
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




<!-- Game logo -->
<img class='logo' src='nogler.png' alt="Nogler" style="margin-top: 50px; width: 950px; height: 400px"/>
<!-- Game description -->
<p class='description' style="font-size: 20px; margin-top: 50px;">
	Card game... Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
	sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
	<br> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
	nisi ut aliquip ex ea commodo consequat. 
</p>
<!-- Button: Start playing-->
<a href="home" class="btn variant-filled" style="margin-top: 50px;">
	<span>Start playing</span>
</a>
<!-- Scroll how to play	-->
<button class='howToPlay' style="margin-top: 150px;" on:click={scrollToBottom}>
	<p>How to play</p>
	<i class="arrow down" style="margin-top: 0;"></i>
</button>

 
 <!-- Card 1: Cards -->
 <div class="card-hover" style="height: 225px; width: 1000px; margin-top: 150px; flex-direction: row;">
     <div style="margin-right: 175px;">
		<h1>Cards</h1>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
			eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
			ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			aliquip ex ea commodo consequat.
		</p>
	</div>
	<img src='' alt='icon' style="margin-right: 250px;">
 </div>
<!-- Card 2: Shop -->
<div class="card-hover" style="flex-direction: row; height: 225px; width: 1000px;">
	<img src='' alt='icon' style="margin-right: 250px;">
	<div>
		<h1>Shop</h1>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
			eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
			ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			aliquip ex ea commodo consequat.
		</p>
	</div>
</div>
<!-- Card Container: align cards in a row -->
<div class="card-container">
     <!-- Card 3: Friends -->
     <div class="card-hover" style="height: 225px; width: 490px;">
         <h1>Friends</h1>
         <p>
             Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
             eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
             ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
             aliquip ex ea commodo consequat.
         </p>
     </div>
     <!-- Card 4: Compete -->
     <div class="card-hover" style="height: 225px; width: 490px;">
         <h1>Compete</h1>
         <p>
             Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
             eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
             ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
             aliquip ex ea commodo consequat.
         </p>
     </div>
</div>