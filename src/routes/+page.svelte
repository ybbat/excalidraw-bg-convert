<script lang="ts">
	import ColourPicker from './ColourPicker.svelte';
	import { colour } from './stores';

	colour.subscribe((c) => {
		console.log(c);
	});
</script>

<ColourPicker />
<p>{JSON.stringify($colour)}</p>
