<script lang="ts">
    import { suitColorDirectory, suitDirectory } from "$lib/cardDirectory";
    import type { Card, Suit } from "$lib/interfaces";

	export let card:Card;
	export let width: string = "w-full";
	export let ratio: number = 0.714285;
	let suitColor:string;
	let suitImage:string;
	let alt:string;

	// If suits exist we extract the color and image
	let s:Suit|undefined = suitDirectory.find((s:Suit) => s.name === card.suit);
	if(s !== undefined){
		suitColor = suitColorDirectory[s.color];
		suitImage = s.image;
		alt = card.rank+s.name;
	}else{
		suitColor = suitColorDirectory[0];
		suitImage = "icon/missing.png";
		alt="Default image";
	}

</script>

<div
	class="{width} bg-white rounded-[5.46875%] grid grid-cols-[1fr_4fr_1fr] place-items-center"
	style="aspect-ratio: {ratio};"
>
	<div class="mt-[30%] h-full text-[150%]">
		<div class="font-bold {suitColor}">
			{card.rank}
		</div>
		<img src={suitImage} alt={alt} class="w-[70%] ml-[15%]"/>
	</div>

	<img src="icons/pxArt.png" alt="a" class="w-full"/>

	<div class="pt-[30%] h-full transform rotate-180 text-[150%]">
		<div class="font-bold {suitColor}">
			{card.rank}
		</div>
		<img src={suitImage} alt={alt} class="w-[70%] ml-[15%]"/>
	</div>
</div>
