<script lang="ts">
	import { writable, derived } from 'svelte/store';
	import { colord } from 'colord';

	const hex = writable<string>();

	const clamp = (val: number, min: number, max: number) => {
		return Math.min(Math.max(val, min), max);
	};

	const red = writable<number>();
	const green = writable<number>();
	const blue = writable<number>();

	const rgb = derived([red, green, blue], ([$red, $green, $blue]) => {
		red.set(clamp($red, 0, 255));
		green.set(clamp($green, 0, 255));
		blue.set(clamp($blue, 0, 255));
		return { r: $red, g: $green, b: $blue };
	});

	const hue = writable<number>();
	const sat = writable<number>();
	const lum = writable<number>();

	const hsl = derived([hue, sat, lum], ([$hue, $sat, $lum]) => {
		hue.set(clamp($hue, 0, 360));
		sat.set(clamp($sat, 0, 100));
		lum.set(clamp($lum, 0, 100));
		return { h: $hue, s: $sat, l: $lum };
	});

	let hexInput = () => {
		let col = colord($hex);
		if (col.isValid()) {
			let convRgb = col.toRgb();
			red.set(convRgb.r);
			green.set(convRgb.g);
			blue.set(convRgb.b);

			let convHsl = col.toHsl();
			hue.set(convHsl.h);
			sat.set(convHsl.s);
			lum.set(convHsl.l);
		} else {
			red.set(NaN);
			green.set(NaN);
			blue.set(NaN);

			hue.set(NaN);
			sat.set(NaN);
			lum.set(NaN);
		}
	};

	let rgbInput = () => {
		let col = colord($rgb);
		if (col.isValid()) {
			hex.set(col.toHex());

			let convHsl = col.toHsl();
			hue.set(convHsl.h);
			sat.set(convHsl.s);
			lum.set(convHsl.l);
		} else {
			hex.set('');

			hue.set(NaN);
			sat.set(NaN);
			lum.set(NaN);
		}
	};

	let hslInput = () => {
		let col = colord($hsl);
		if (col.isValid()) {
			hex.set(col.toHex());

			let convRgb = col.toRgb();
			red.set(convRgb.r);
			green.set(convRgb.g);
			blue.set(convRgb.b);
		} else {
			hex.set('');

			red.set(NaN);
			green.set(NaN);
			blue.set(NaN);
		}
	};
</script>

<label>
	Hex
	<input bind:value={$hex} on:input={hexInput} />
</label>
<label>
	RGB
	<input type="number" bind:value={$red} on:input={rgbInput} />
	<input type="number" bind:value={$green} on:input={rgbInput} />
	<input type="number" bind:value={$blue} on:input={rgbInput} />
</label>
<label>
	HSL
	<input type="number" bind:value={$hue} on:input={hslInput} />
	<input type="number" bind:value={$sat} on:input={hslInput} />
	<input type="number" bind:value={$lum} on:input={hslInput} />
</label>
