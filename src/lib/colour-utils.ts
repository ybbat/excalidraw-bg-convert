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

const luminance = (c: Colord) => {
    const rgb = c.toRgb();
    return 0.2126729 * ((rgb.r/255.) ** 2.4) + 0.7151522 * ((rgb.g/255.)**2.4) + 0.0721750 * ((rgb.b/255.)**2.4);

}

const clamp = (y: number) => {
    const exp = 1.414;
    const thresh = 0.022;

    if (y >= thresh) {
        return y;
    } else {
        return y + (thresh - y) ** exp;
    }
}

// https://raw.githubusercontent.com/Myndex/apca-w3/master/images/APCAw3_0.1.17_APCA0.0.98G.svg
const apca_contrast = (fg: Colord, bg: Colord) => {
    const fg_lum = clamp(luminance(fg));
    const bg_lum = clamp(luminance(bg));

    const lightness_diff_norm = bg_lum**0.56 - fg_lum**0.57;
    const lightness_diff_rev = bg_lum**0.65 - fg_lum**0.62;

    const r_scale = 1.14
    const p_in = 0.0005

    const C = (() => {
        if (Math.abs(bg_lum - fg_lum) < p_in) {
            return 0.0;
        } else if (fg_lum < bg_lum) {
            return lightness_diff_norm * r_scale;
        } else {
            return lightness_diff_rev * r_scale;
        }
    })();

    const w_offset = 0.027;
    const p_out = 0.1;

    const contrast = (() => {
        if (Math.abs(C) < p_out) {
            return 0.0;
        } else if (C > 0){
            return C - w_offset;
        } else {
            return C + w_offset;
        }
    })();

    return contrast * 100;
}

// Could do some more optimisation, but almost all of the time white/black are
// the best contrasting colours for a given background
export const gen_readable = (bg: Colord) => {
	const cost_fn = (fg: Colord) => {
        return -Math.abs(apca_contrast(fg, bg));
    }

	const fg_white = colord('#ffffff');
	const fg_black = colord('#000000');

	if (cost_fn(fg_white) < cost_fn(fg_black)) {
		return fg_white;
	} else {
		return fg_black;
	}
}