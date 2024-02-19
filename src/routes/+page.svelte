<script lang="ts">
	import ColourPicker from './ColourPicker.svelte';
	import { target } from './stores';
	import { Colord, colord, extend } from 'colord';
	import labPlugin from 'colord/plugins/lab';
	extend([labPlugin]);
	import { transform, approx_backwards, gen_readable } from '$lib/colour-utils';
	import { Toggle } from '$lib/components/ui/toggle';
	import * as Card from '$lib/components/ui/card';

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

<svelte:head>
	<title>Excalidraw Colour Convert</title>
	<meta
		name="description"
		content="Aims to find a colour input for Excalidraw such that it is close to the target when switched to dark mode."
	/>
</svelte:head>
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
		<Card.Root class="w-1/4 p-3">
			<Card.Header>Select target colour</Card.Header>
			<Card.Content>
				<ColourPicker />
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Right -->
	<div
		class="flex flex-1 items-center justify-center align-middle"
		style:background-color={displayExcal ? excalCol.toHex() : trans_guess.toHex()}
		style:color={displayExcal ? gen_readable(excalCol).toHex() : gen_readable(trans_guess).toHex()}
	>
		<Card.Root class="w-72 p-3 bg-blend-overlay">
			<Card.Header>Best Guess</Card.Header>
			<Card.Description class="break p-3">
				This side of the page showcases the
				{#if displayExcal}
					target
				{:else}
					guess
				{/if}
				colour after Excalidraw's transformation.
			</Card.Description>

			<Card.Content>
				<Toggle
					on:click={() => (displayExcal = !displayExcal)}
					class="m-3 ring-2 ring-zinc-900 hover:ring-4">Preview Guess</Toggle
				>
				<p>Guess hex: {guess.toHex()}</p>
			</Card.Content>
		</Card.Root>
	</div>
</div>
