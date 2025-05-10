<script lang="ts">
    import type { Vec4 } from '$lib/interfaces';
    import { colorStore } from '$lib/stores';
	import { get } from 'svelte/store';

	let localColors = structuredClone(get(colorStore)); // copia inicial

	function handleColorChange(key: keyof typeof localColors, event: Event) {
		const hex = (event.target as HTMLInputElement).value;
		const rgb = hexToVec4(hex);
		localColors[key] = rgb;
		colorStore.set({ ...localColors }); // actualiza la store
	}

	function vec4ToHex([r, g, b]: Vec4): string {
		return (
			'#' +
			[r, g, b]
				.map((c) => Math.round(c * 255).toString(16).padStart(2, '0'))
				.join('')
		);
	}

	function hexToVec4(hex: string): Vec4 {
		const bigint = parseInt(hex.slice(1), 16);
		const r = ((bigint >> 16) & 255) / 255;
		const g = ((bigint >> 8) & 255) / 255;
		const b = (bigint & 255) / 255;
		return [r, g, b, 1.0];
	}
</script>

<style>
	.controller {
		position: fixed;
		top: 1rem;
		left: 1rem;
		background: rgba(0, 0, 0, 0.5);
		padding: 1rem;
		border-radius: 0.5rem;
		color: white;
		font-family: sans-serif;
	}
	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
</style>

<div class="controller">
	<label>
		Color 1:
		<input type="color" value="{vec4ToHex(localColors.color1)}" on:input="{(e) => handleColorChange('color1', e)}" />
	</label>
	<label>
		Color 2:
		<input type="color" value="{vec4ToHex(localColors.color2)}" on:input="{(e) => handleColorChange('color2', e)}" />
	</label>
	<label>
		Color 3:
		<input type="color" value="{vec4ToHex(localColors.color3)}" on:input="{(e) => handleColorChange('color3', e)}" />
	</label>
</div>
