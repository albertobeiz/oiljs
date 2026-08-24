// ---------------------------------------------------------------
// THE STYLES — nine ways of making the same drawing, in order.
//
// A STYLE is a medium (`tone / skin / edge`, see `src/media.js`) that
// answers for a whole way of painting rather than for one material.
// It gets the same three questions every medium gets — what is this
// mass made of, what colour is this skin, how does this shape close —
// and it may overrule the character's own colours to answer them,
// which the six materials never do.
//
// Adding one = a file here + a line below. Nothing else in the
// project needs to know: `media.js` merges them, both crowds list
// them, `styles.html` is the contact sheet, and BOTH HANDS draw them
// — a style is written in the shared vocabulary (`s.stroke`,
// `s.hatchFill`, `s.ctx`…), so the graphite engine and the p5.brush
// one each render it their own way.
//
// They are listed by ERA, because that is the only order that makes
// the sheet read as one thing.
// ---------------------------------------------------------------
import gothic from './gothic.js';
import renaissance from './renaissance.js';
import baroque from './baroque.js';
import ukiyoe from './ukiyoe.js';
import impressionism from './impressionism.js';
import expressionism from './expressionism.js';
import cubism from './cubism.js';
import dadaism from './dadaism.js';
import surrealism from './surrealism.js';

// ---- the GROUND -------------------------------------------------
// A style is painted on its own paper, and the paper is the first
// technical fact of every one of these media — a gothic panel is
// brilliant white gesso, a Caravaggio is a red-brown BOLE ground that
// the darks simply are, a ukiyo-e sheet is warm hōsho washi, an
// impressionist canvas is white lead priming (which is WHY the
// colour is high-key), a Braque is grey-buff. Nine movements painted
// on one cream sheet arrive as four shades of tea; nine grounds
// separate them before a single mark is made.
//
// A style may declare `ground` on its own export; this is the
// fallback for the ones that have not. Pages that show ONE style at a
// time — the sheet's rows, the timeline's clusters — lay it behind
// the characters. `crowd.html` deliberately does not: the crowd is
// drawai's own page and its paper is cream.
export const GROUNDS = {
  gothic:        [246, 244, 236],   // gesso, brilliant and slightly chalky
  renaissance:   [214, 199, 170],   // toned ochre priming
  baroque:       [118, 76, 58],     // bole — the darks ARE the ground
  ukiyoe:        [240, 231, 205],   // hōsho washi, warm
  impressionism: [247, 245, 240],   // lead white priming, cool and bright
  expressionism: [233, 226, 210],   // cheap newsprint-grey proofing paper
  cubism:        [206, 197, 178],   // grey-buff canvas
  dadaism:       [225, 216, 192],   // yellowing newsprint
  surrealism:    [232, 228, 220],   // smooth academic priming, almost neutral
};

export const groundOf = m => (m && (m.ground || GROUNDS[m.id])) || null;

export const STYLE_LIST = [
  gothic, renaissance, baroque, ukiyoe, impressionism,
  expressionism, cubism, dadaism, surrealism,
];

export const STYLES = Object.fromEntries(STYLE_LIST.map(s => [s.id, s]));
export const STYLE_IDS = STYLE_LIST.map(s => s.id);
