import { transform } from '$lib/colour-utils';
import { Colord, colord, extend } from 'colord';
import labPlugin from 'colord/plugins/lab';
extend([labPlugin]);

onmessage = async (e: MessageEvent) => {
	const target = colord(e.data.target);
	const guess = colord(e.data.guess);

	const cost = cost_fn(target);
	simulated_annealing(cost, guess);
};

const cost_fn = (target: Colord) => {
	return (guess: Colord) => target.delta(transform(guess));
};

// Honestly the search space isn't really big enough or local minima-y enough to need this, but it's fun
const simulated_annealing = (
	cost_fn: (p: Colord) => number,
	start: Colord,
	cooling_rate: number = 0.95,
	n_iters: number = 1000
) => {
	let current = start;
	let current_cost = cost_fn(current);
	let best = current;
	let best_cost = current_cost;

	let temperature = 1;
	let iter = 0;
	while (iter++ < n_iters) {
		const neighbour = generate_neighbour(current);
		const neighbour_cost = cost_fn(neighbour);
		const delta = neighbour_cost - current_cost;
		if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
			current = neighbour;
			current_cost = neighbour_cost;
			if (current_cost < best_cost) {
				best = current;
				best_cost = current_cost;
				postMessage({ best: best.toHex() });
			}
		}
		temperature *= cooling_rate;
	}
	return best;
};

const generate_neighbour = (c: Colord): Colord => {
	const rgb = c.toRgb();
	const dimension = Math.floor(Math.random() * 3);
	const change = Math.floor(Math.random() * 3) - 1;
	const new_col = { ...rgb };
	if (dimension === 0) new_col.r += change;
	if (dimension === 1) new_col.g += change;
	if (dimension === 2) new_col.b += change;
	return colord(new_col);
};

export {};
