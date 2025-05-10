<script lang="ts">
    import { colorStore } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	let canvas: HTMLCanvasElement;
	let gl: WebGLRenderingContext;
	let animationFrame: number;

	const vertexShaderSource = `
		attribute vec2 a_position;
		void main() {
			gl_Position = vec4(a_position, 0.0, 1.0);
		}
	`;

	const fragmentShaderSource = `
		precision highp float;

		uniform vec2 iResolution;
		uniform float iTime;
		uniform vec4 uColor1;
		uniform vec4 uColor2;
		uniform vec4 uColor3;

		#define CONTRAST 3.0
		#define LIGTHING 0.5
		#define SPIN_AMOUNT 0.25
		#define PIXEL_FILTER 200.0
		#define SPIN_EASE 1.0

		vec4 effect(vec2 screenSize, vec2 screen_coords) {
			float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
			vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy);
			float uv_len = length(uv);

			float speed = 302.2;
			float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE*20.*(1.*SPIN_AMOUNT*uv_len + (1. - 1.*SPIN_AMOUNT));
			vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
			uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

			uv *= 30.;
			speed = iTime*3.0;
			vec2 uv2 = vec2(uv.x+uv.y);

			for(int i=0; i < 5; i++) {
				uv2 += sin(max(uv.x, uv.y)) + uv;
				uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
				uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
			}

			float contrast_mod = (0.25*CONTRAST + 0.5*SPIN_AMOUNT + 1.2);
			float paint_res = min(2., max(0.,length(uv)*(0.035)*contrast_mod));
			float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
			float c2p = max(0.,1. - contrast_mod*abs(paint_res));
			float c3p = 1. - min(1., c1p + c2p);
			float light = (LIGTHING - 0.2)*max(c1p*5. - 4., 0.) + LIGTHING*max(c2p*5. - 4., 0.);
			return (0.3/CONTRAST)*uColor1 + (1. - 0.3/CONTRAST)*(uColor1*c1p + uColor2*c2p + vec4(c3p*uColor3.rgb, c3p*uColor1.a)) + light;
		}

		void mainImage(out vec4 fragColor, in vec2 fragCoord) {
			vec2 uv = fragCoord / iResolution.xy;
			fragColor = effect(iResolution.xy, uv * iResolution.xy);
		}

		void main() {
			vec4 color;
			mainImage(color, gl_FragCoord.xy);
			gl_FragColor = color;
		}
	`;

	function compileShader(source: string, type: number): WebGLShader {
		const shader = gl.createShader(type)!;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(shader));
			throw new Error("Shader compilation failed");
		}
		return shader;
	}

	function createProgram(vsSource: string, fsSource: string): WebGLProgram {
		const program = gl.createProgram()!;
		const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
		const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			throw new Error("Program linking failed");
		}
		return program;
	}

	let currentColors = get(colorStore);
	let smoothColors = structuredClone(currentColors);

	function lerp(a: number, b: number, t: number) {
		return a + (b - a) * t;
	}

	onMount(() => {
		gl = canvas.getContext("webgl")!;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const program = createProgram(vertexShaderSource, fragmentShaderSource);
		gl.useProgram(program);

		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

		const aPosition = gl.getAttribLocation(program, "a_position");
		gl.enableVertexAttribArray(aPosition);
		gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

		const iResolution = gl.getUniformLocation(program, "iResolution");
		const iTime = gl.getUniformLocation(program, "iTime");
		const uColor1 = gl.getUniformLocation(program, "uColor1");
		const uColor2 = gl.getUniformLocation(program, "uColor2");
		const uColor3 = gl.getUniformLocation(program, "uColor3");

		colorStore.subscribe((newColors) => {
			currentColors = newColors;
		});

		function render(time: number) {
			time *= 0.001;
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.uniform2f(iResolution, canvas.width, canvas.height);
			gl.uniform1f(iTime, time);

			// Suavizado de colores
			for (let i = 0; i < 4; i++) {
				smoothColors.color1[i] = lerp(smoothColors.color1[i], currentColors.color1[i], 0.05);
				smoothColors.color2[i] = lerp(smoothColors.color2[i], currentColors.color2[i], 0.05);
				smoothColors.color3[i] = lerp(smoothColors.color3[i], currentColors.color3[i], 0.05);
			}

			gl.uniform4f(uColor1, ...smoothColors.color1);
			gl.uniform4f(uColor2, ...smoothColors.color2);
			gl.uniform4f(uColor3, ...smoothColors.color3);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			animationFrame = requestAnimationFrame(render);
		}

		animationFrame = requestAnimationFrame(render);

		return () => cancelAnimationFrame(animationFrame);
	});
</script>

<canvas
	bind:this={canvas}
	style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1;"
/>
