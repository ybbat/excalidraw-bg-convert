<script lang="ts">
	import { colord } from 'colord';
	import { target } from './stores';

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let hex = '#';

	const updatedHex = () => {
		// Validate
		const invalidChars = /[^0-9a-f]/gi;
		hex = hex.replace(invalidChars, '');
		hex = '#' + hex;
		// Update other inputs
		if (hex.length !== 4 && hex.length !== 7) return;
		const color = colord(hex);
		target.set(color);
		const rgb = color.toRgb();
		red = rgb.r.toString();
		green = rgb.g.toString();
		blue = rgb.b.toString();
		const hsl = color.toHsl();
		hue = hsl.h.toString();
		sat = hsl.s.toString();
		lig = hsl.l.toString();
	};

	let red = '';
	let green = '';
	let blue = '';

	const updatedRgb = () => {
		// Validate
		const invalidChars = /[^0-9]/gi;
		red = clamp(parseInt(red.replace(invalidChars, '')), 0, 255)
			.toString()
			.replace(invalidChars, '');
		green = clamp(parseInt(green.replace(invalidChars, '')), 0, 255)
			.toString()
			.replace(invalidChars, '');
		blue = clamp(parseInt(blue.replace(invalidChars, '')), 0, 255)
			.toString()
			.replace(invalidChars, '');
		if (!red || !green || !blue) return;

		// Update other inputs
		const color = colord({ r: +red, g: +green, b: +blue });
		target.set(color);
		hex = color.toHex();
		const hsl = color.toHsl();
		hue = hsl.h.toString();
		sat = hsl.s.toString();
		lig = hsl.l.toString();
	};

	let hue = '';
	let sat = '%';
	let lig = '%';

	const updatedHsl = () => {
		// Validate
		const invalidChars = /[^0-9]/gi;
		hue = clamp(parseInt(hue.replace(invalidChars, '')), 0, 360)
			.toString()
			.replace(invalidChars, '');
		sat = clamp(parseInt(sat.replace(invalidChars, '')), 0, 100)
			.toString()
			.replace(invalidChars, '');
		const sat_val = sat;
		sat += '%';
		lig = clamp(parseInt(lig.replace(invalidChars, '')), 0, 100)
			.toString()
			.replace(invalidChars, '');
		const lig_val = lig;
		lig += '%';
		if (!hue || !sat_val || !lig_val) return;

		// Update other inputs
		const color = colord({ h: +hue, s: +sat_val, l: +lig_val });
		target.set(color);
		hex = color.toHex();
		const rgb = color.toRgb();
		red = rgb.r.toString();
		green = rgb.g.toString();
		blue = rgb.b.toString();
	};

	const clamp = (val: number, min: number, max: number) => {
		return Math.min(Math.max(val, min), max);
	};
</script>

<div class="{$$props.class} flex flex-col">
	<div>
		<Label>Hex</Label>
		<Input bind:value={hex} on:input={updatedHex} maxlength={7} class="text-black" />
	</div>
	<div>
		<Label>RGB</Label>
		<div class="flex flex-row">
			<Input bind:value={red} on:input={updatedRgb} class="w-14 text-black" placeholder="R" />
			<Input bind:value={green} on:input={updatedRgb} class="w-14 text-black" placeholder="G" />
			<Input bind:value={blue} on:input={updatedRgb} class="w-14 text-black" placeholder="B" />
		</div>
	</div>
	<div>
		<Label>HSL</Label>
		<div class="flex flex-row">
			<Input bind:value={hue} on:input={updatedHsl} class="w-14 text-black" />
			<Input bind:value={sat} on:input={updatedHsl} class="w-16 text-black" />
			<Input bind:value={lig} on:input={updatedHsl} class="w-16 text-black" />
		</div>
	</div>
</div>
