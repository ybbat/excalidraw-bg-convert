<script lang="ts">
	import ColourPicker from './ColourPicker.svelte';
	import { target } from './stores';
	import { Colord, colord, extend } from 'colord';
	import labPlugin from 'colord/plugins/lab';
	extend([labPlugin]);
	import { transform, approx_backwards } from '$lib/colour-utils';

	import { onMount } from 'svelte';

	let excalCol = transform($target);
	let guess = approx_backwards($target);

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

	target.subscribe((t) => {
		if (t && t.isValid()) {
			excalCol = transform(t);
			guess = approx_backwards(t);
			syncWorker?.postMessage({ target: t.toHex(), guess: guess.toHex() });
		}
	});
</script>

<ColourPicker />
<p>Target: {$target.toHex()}</p>
<p>Excal col (ish): {excalCol.toHex()} - diff from target {$target.delta(excalCol)}</p>
<p>
	Approximation: {guess.toHex()} - after transform {transform(guess).toHex()} - diff from target {$target.delta(
		transform(guess)
	)}
</p>

<label>
	Haven't figured out the name of this butotn yet
	<button on:click={() => (displayExcal = !displayExcal)}>Boo!</button>
</label>

<div class="flex h-screen">
	<!-- Left -->
	<div class="flex-1" style="background-color: {$target.toHex()}"></div>

	<!-- Right -->
	<div
		class="flex-1 bg-slate-200"
		style="background-color: {displayExcal ? excalCol.toHex() : transform(guess).toHex()}"
	></div>
</div>
