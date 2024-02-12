<script lang="ts">
	import ColourPicker from './ColourPicker.svelte';
	import { target } from './stores';
	import { Colord, colord, extend } from 'colord';
	import labPlugin from 'colord/plugins/lab';
	extend([labPlugin]);
	import { transform, approx_backwards, gen_readable } from '$lib/colour-utils';
	import { Toggle } from '$lib/components/ui/toggle';

	import { onMount } from 'svelte';

	let excalCol = transform($target);
	let guess = approx_backwards($target);

	$: trans_guess = transform(guess);

	let syncWorker: Worker | undefined = undefined;

	const onWorkerMessage = (e: MessageEvent) => {
		guess = colord(e.data.best);
	};

	const loadWorker = async () => {
		const SyncWorker = await import('$lib/find-col.worker?worker');
		syncWorker = new SyncWorker.default();

		syncWorker.onmessage = onWorkerMessage;
	};

	onMount(loadWorker);

	let displayExcal = true;

	let interval: number | undefined = undefined;

	let n = 0;

	target.subscribe((t) => {
		if (t && t.isValid()) {
			excalCol = transform(t);
			guess = approx_backwards(t);
			syncWorker?.postMessage({ target: t.toHex(), guess: guess.toHex() });
			clearInterval(interval);

			interval = setInterval(() => {
				n++;
				// Try the optimisation strategy n times
				if (n > 20) {
					clearInterval(interval);
				}
				syncWorker?.postMessage({ target: t.toHex(), guess: guess.toHex() });
			}, 250);
		}
	});

	$: bg = `linear-gradient(to right, ${gen_readable($target).toHex()} 50%, ${gen_readable(
		displayExcal ? excalCol : trans_guess
	).toHex()} 50%)`;
</script>

<!-- Rerender when bg gradient changes not ideal but needed (I think) to fix some css ordering funkyness -->
{#key bg}
	<div
		class="align-center pointer-events-none absolute left-1/2 flex h-screen -translate-x-1/2 flex-col items-center text-center"
		style:background={bg}
		style:background-clip="text"
		style:-webkit-background-clip="text"
		style:-webkit-text-fill-color="transparent"
	>
		<h1
			class="pointer-events-auto mt-3 scroll-m-20 justify-center text-4xl font-extrabold tracking-tight lg:text-5xl"
		>
			Excalidraw Colour Convert
		</h1>
		<div class="hidden lg:contents">
			<p class="pointer-events-auto mt-6 leading-7">
				By default Excalidraw will transform the colour of your selected colour when you switch to
				dark mode, with no way to override this behaviour. This application aims to provide a colour
				to input such that after the transformations it will be as close as possible to your desired
				colour.
			</p>
		</div>
	</div>
{/key}

<div class="flex h-screen">
	<!-- Left -->
	<div
		class="flex flex-1 flex-col items-center justify-center align-middle text-white"
		style:background-color={$target.toHex()}
		style:color={gen_readable($target).toHex()}
	>
		<div class="">
			<h2>Select target colour</h2>
			<ColourPicker />
		</div>
	</div>

	<!-- Right -->
	<div
		class="flex flex-1 items-center justify-center align-middle"
		style:background-color={displayExcal ? excalCol.toHex() : trans_guess.toHex()}
		style:color={displayExcal ? gen_readable(excalCol).toHex() : gen_readable(trans_guess).toHex()}
	>
		<div class="">
			{#if displayExcal}
				<p>Transform of target</p>
			{:else}
				<p>Transform of guess</p>
			{/if}
			<Toggle on:click={() => (displayExcal = !displayExcal)} class="m-6">Preview Guess</Toggle>
			<p>Guess hex: {guess.toHex()}</p>
		</div>
	</div>
</div>
