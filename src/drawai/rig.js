// ---------------------------------------------------------------
// THE RECIPE — one integer in, a character's full JSON description out.
//
// Vendored from drawai. Its buildCharacter (recipe -> THREE meshes) is
// deliberately absent: oiljs draws the parts flat instead, in
// src/subject.js. What survives here is the seeding — which is the part
// that must not drift, since it is what makes a seed mean one face.
//
//   recipe = {
//     seed,                       // one integer; the whole character
//     media,                      // 'graphite' | 'ink' | 'watercolor' | ...
//     color: 'auto'|'plain'|'color',
//     parts: { [id]: { params, lock?, rr? } }
//   }
//
// `params` is what the editor edits and what makes a character
// itself. `rr` is a per-part reroll counter: bumping it re-derives
// only that part from the seed. `lock` keeps a part through a global
// regenerate.
//
// The recipe is the ONLY state. Same JSON in, same character out,
// on any machine — that is what makes these usable in a game.
// ---------------------------------------------------------------
import { makeRng, hashStr } from './rng.js';
import { PARTS, PART_BY_ID } from './parts/index.js';
import { castingFor, pickBase } from './species.js';

export { PARTS };

export function newRecipe(seed = (Math.random() * 1e9) | 0) {
  return { seed, species: 'human', base: 'biped', color: 'auto', media: 'graphite', parts: {} };
}

const partRng = (recipe, id) =>
  makeRng(hashStr(`${recipe.seed}:${id}:${recipe.parts[id]?.rr || 0}`));

// A part's gen() is handed a CASTING helper scoped to that part: it
// answers pick/range/chance with the species' opinion when it has one
// and the part's own default when it does not. The species only ever
// biases GENERATION — once params exist they are plain numbers, so a
// saved recipe rebuilds identically without it.
const castFor = recipe => castingFor(recipe.species);

// fill in whatever is missing — a new recipe, or an old recipe from
// before a part type existed
export function ensureParams(recipe) {
  recipe.media ??= 'graphite';
  recipe.species ??= 'human';
  // the species decides what it most likely stands on
  recipe.base ||= pickBase(recipe.species, makeRng(hashStr(`${recipe.seed}:base`)));
  const cast = castFor(recipe);
  for (const def of PARTS) {
    const slot = recipe.parts[def.id] ??= {};
    slot.params ??= def.gen(partRng(recipe, def.id), cast(def.id));
  }
}

export function rerollPart(recipe, id) {
  const slot = recipe.parts[id];
  slot.rr = (slot.rr || 0) + 1;
  slot.params = PART_BY_ID[id].gen(partRng(recipe, id), castFor(recipe)(id));
}

// re-derive every unlocked part (a new seed, a new species, or the
// same one again)
export function regenUnlocked(recipe, seed = recipe.seed) {
  recipe.seed = seed;
  const cast = castFor(recipe);
  for (const def of PARTS) {
    const slot = recipe.parts[def.id] ??= {};
    if (slot.lock && slot.params) continue;
    slot.rr = 0;
    slot.params = def.gen(partRng(recipe, def.id), cast(def.id));
  }
}
