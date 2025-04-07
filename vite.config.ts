import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// setting server.hmr.overlay to false in order to avoid the overlay of the browser during development
export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	server: {
		hmr: {
			overlay: false
		}
	}
});