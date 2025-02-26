import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte'],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess()],

	/*
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		paths : {
			base: process.env.NODE_ENV === 'production' ? '/sveltekit-github-pages' : '',

		}
	}
	*/
	kit: {
		adapter: adapter({
			pages: 'sveltekit-github-pages', // Carpeta de salida para GitHub Pages
			assets: 'sveltekit-github-pages', // Carpeta de assets estáticos
			fallback: 'index.html' // Necesario para SPA en GitHub Pages
		})
	}

};
export default config;
