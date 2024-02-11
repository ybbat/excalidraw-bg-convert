<script lang="ts">
	import { colord } from 'colord';
	import { colour } from './stores';

	let hex = '#';

	const updatedHex = () => {
		// Validate
		const invalidChars = /[^0-9a-f]/gi;
		hex = hex.replace(invalidChars, '');
		hex = '#' + hex;
		// Update other inputs
		const color = colord(hex);
		colour.set(color);
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
		colour.set(color);
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
		lig = clamp(parseInt(lig.replace(invalidChars, '')), 0, 100)
			.toString()
			.replace(invalidChars, '');
		if (!hue || !sat || !lig) return;

		// Update other inputs
		const color = colord({ h: +hue, s: +sat, l: +lig });
		colour.set(color);
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

<label>
	Hex
	<input bind:value={hex} maxlength="7" on:input={updatedHex} />
</label>
<label>
	RGB
	<input bind:value={red} on:input={updatedRgb} />
	<input bind:value={green} on:input={updatedRgb} />
	<input bind:value={blue} on:input={updatedRgb} />
</label>
<label>
	HSL
	<input bind:value={hue} on:input={updatedHsl} />
	<input bind:value={sat} on:input={updatedHsl} />
	<input bind:value={lig} on:input={updatedHsl} />
</label>
