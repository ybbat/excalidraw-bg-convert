import { Colord, colord } from 'colord';
import { matrix, add, multiply, subtract, identity, cos, sin, pi, Matrix } from 'mathjs';

const invert = (col: Colord, amount: number = 1.0): Colord => {
	let rgb = { r: col['parsed']['r'], g: col['parsed']['g'], b: col['parsed']['b'] };
	rgb.r = amount * (255 - rgb.r) + (1 - amount) * rgb.r;
	rgb.g = amount * (255 - rgb.g) + (1 - amount) * rgb.g;
	rgb.b = amount * (255 - rgb.b) + (1 - amount) * rgb.b;
	return colord(rgb);
};

const reverse_invert_93 = (target: Colord): Colord => {
	let rgb = { r: target['parsed']['r'], g: target['parsed']['g'], b: target['parsed']['b'] };
	rgb.r = (236.15 - rgb.r) / 0.86;
	rgb.g = (236.15 - rgb.g) / 0.86;
	rgb.b = (236.15 - rgb.b) / 0.86;
	return colord(rgb);
};

// https://www.w3.org/TR/filter-effects/#feColorMatrixElement
const hue_rotate = (col: Colord, angle: number): Colord => {
	// colord.toRgb rounds so just use internal values
	let rgba_mat = matrix([
		[col['parsed']['r']],
		[col['parsed']['g']],
		[col['parsed']['b']],
		[col['parsed']['a']],
		[1]
	]);
	const rad = (angle * pi) / 180;

	// Constant matrices
	const a = matrix([
		[0.213, 0.715, 0.072],
		[0.213, 0.715, 0.072],
		[0.213, 0.715, 0.072]
	]);
	const b = matrix([
		[0.787, -0.715, -0.072],
		[-0.213, 0.285, -0.072],
		[-0.213, -0.715, 0.928]
	]);
	const c = matrix([
		[-0.213, -0.715, 0.928],
		[0.143, 0.14, -0.283],
		[-0.787, 0.715, 0.072]
	]);
	// This gives a00 through a22 (3x3 matrix top left)
	const terms = add(add(a, multiply(cos(rad), b)), multiply(sin(rad), c));
	// TS didn't like the resize on identity, but it always returns a matrix with this param so cast to Matrix
	const hue_rotate = subtract(
		add(identity(5), terms.resize([5, 5])),
		(identity(3) as Matrix).resize([5, 5])
	);
	let transformed = multiply(hue_rotate, rgba_mat);

	let rgb = { r: transformed.get([0, 0]), g: transformed.get([1, 0]), b: transformed.get([2, 0]) };
	return colord(rgb);
};

export const transform = (col: Colord): Colord => {
	return hue_rotate(invert(col, 0.93), 180);
};

export const approx_backwards = (target: Colord): Colord => {
	// Undo rotation
	const unrotated = hue_rotate(target, 180);
	// We want a colour that gives this value when inverted(0.93)
	const approx = reverse_invert_93(unrotated);

	return approx;
};
