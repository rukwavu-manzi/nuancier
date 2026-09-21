// Construit les 7 niveaux (10 000 couleurs) -> levels.json
const fs = require("fs");
const hex2 = a => a.map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
const rgb = h => { const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const lin = v => (v /= 255) <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
const f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
const lab = h => { const [r, g, b] = rgb(h).map(lin);
  const x = f((r * .4124 + g * .3576 + b * .1805) / .95047), y = f(r * .2126 + g * .7152 + b * .0722), z = f((r * .0193 + g * .1192 + b * .9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]; };
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const usedN = new Set(), usedH = new Set();
const take = list => list.filter(([n, h]) => { const k = norm(n); if (usedN.has(k) || usedH.has(h)) return false; usedN.add(k); usedH.add(h); return true; });

// Niveau 1 : arc-en-ciel
const L1 = take([["Red","FF0000"],["Orange","FF7F00"],["Yellow","FFFF00"],["Green","00FF00"],["Blue","0000FF"],["Indigo","4B0082"],["Violet","7F00FF"]]);
// Niveau 2 : 25 incontournables
const L2 = take([["Black","000000"],["White","FFFFFF"],["Grey","808080"],["Brown","964B00"],["Beige","F5F5DC"],["Pink","FFC0CB"],["Purple","800080"],["Cyan","00FFFF"],["Magenta","FF00FF"],["Maroon","800000"],["Navy","000080"],["Olive","808000"],["Teal","008080"],["Turquoise","40E0D0"],["Gold","FFD700"],["Silver","C0C0C0"],["Coral","FF7F50"],["Salmon","FA8072"],["Lavender","B57EDC"],["Cream","FFFDD0"],["Khaki","C3B091"],["Tan","D2B48C"],["Peach","FFE5B4"],["Mint","98FF98"],["Burgundy","800020"]]);
// Niveau 3 : couleurs nommées CSS (W3C), via le paquet color-name
const src = fs.readFileSync("cn/package/index.js", "utf8");
const css = [...src.matchAll(/^\s*(\w+): \[(\d+), (\d+), (\d+)\]/gm)].map(m => [m[1], hex2([+m[2], +m[3], +m[4]])]);
const TOK = "alice antique white aquamarine aqua azure beige bisque black blanched almond blue violet brown burly wood cadet chartreuse chocolate coral cornflower cornsilk crimson cyan dark goldenrod gray grey green khaki magenta olive orange orchid red salmon sea slate turquoise deep pink sky dim dodger firebrick floral forest fuchsia gainsboro ghost gold honeydew hot indian indigo ivory lavender blush lawn lemon chiffon light lime linen maroon medium purple spring midnight mint cream misty rose moccasin navajo navy old lace drab pale papaya whip peach puff peru plum powder rebecca rosy royal saddle sandy seashell shell sienna silver smoke snow steel tan teal thistle tomato wheat yellow".split(" ").sort((a, b) => b.length - a.length);
const seg = w => { const out = []; let s = w; while (s) { const t = TOK.find(t => s.startsWith(t)); if (!t) throw new Error("seg " + w); out.push(t[0].toUpperCase() + t.slice(1)); s = s.slice(t.length); } return out.join(" "); };
const L3 = take(css.filter(([n]) => !/gray/.test(n) && !["aqua", "fuchsia"].includes(n)).map(([n, h]) => [seg(n), h]));

// Noms lisibles uniquement
const ok = n => /^[A-Za-z' -]+$/.test(n) && n.split(" ").length <= 4 && n.length <= 28;
// Niveau 4 : couleurs célèbres (ont leur propre article sur Wikipédia en anglais)
// Niveau 5 : le reste de la liste Wikipédia (Crayola, Pantone, peintures…)
const wp = JSON.parse(fs.readFileSync("wpen.json", "utf8")).filter(([n]) => ok(n));
const L4 = take(wp.filter(w => w[2]).map(([n, h]) => [n, h]));
const L5 = take(wp.filter(w => !w[2]).map(([n, h]) => [n, h]));
// Niveaux 6 et 7 : color-name-list.
const best = new Set(require("./package/dist/colornames.bestof.json").map(c => c.name));
const full = require("./package/dist/colornames.json").filter(c => ok(c.name))
  .map(c => [c.name, c.hex.slice(1).toUpperCase()]);
const rest = take(full);                       // dédoublonné contre les niveaux 1-3
const TARGET = 10000 - L1.length - L2.length - L3.length - L4.length - L5.length;
// On garde tous les « best of », puis on complète avec les plus éloignées (points les plus lointains en CIELAB)
const chosen = rest.filter(([n]) => best.has(n));
const pool = rest.filter(([n]) => !best.has(n));
const labs = pool.map(([, h]) => lab(h)), dmin = new Float64Array(pool.length).fill(Infinity);
const fixedLabs = [...L1, ...L2, ...L3, ...L4, ...L5, ...chosen].map(([, h]) => lab(h));
for (const p of fixedLabs) for (let i = 0; i < pool.length; i++) { const q = labs[i], d = (p[0]-q[0])**2 + (p[1]-q[1])**2 + (p[2]-q[2])**2; if (d < dmin[i]) dmin[i] = d; }
while (chosen.length < TARGET) {
  let bi = -1, bd = -1;
  for (let i = 0; i < pool.length; i++) if (dmin[i] > bd) { bd = dmin[i]; bi = i; }
  chosen.push(pool[bi]); const p = labs[bi]; dmin[bi] = -1;
  for (let i = 0; i < pool.length; i++) { if (dmin[i] < 0) continue; const q = labs[i], d = (p[0]-q[0])**2 + (p[1]-q[1])**2 + (p[2]-q[2])**2; if (d < dmin[i]) dmin[i] = d; }
}
// Difficulté : un mot < deux mots < trois ou plus ; « best of » avant le reste ; nom court avant nom long
const score = ([n]) => { const w = n.split(" ").length; return (best.has(n) ? 0 : 3) + Math.min(w, 3) * 2 + n.length / 30; };
chosen.sort((a, b) => score(a) - score(b) || a[0].localeCompare(b[0]));
const L6 = chosen.slice(0, 3000), L7 = chosen.slice(3000);
const levels = [L1, L2, L3, L4, L5, L6, L7];
console.log("tailles:", levels.map(l => l.length).join(" / "), "total:", levels.flat().length);
console.log("L3 ex:", L3.slice(0, 6).map(x => x[0]).join(", "));
for (const [i, l] of levels.entries()) if (i >= 3) console.log(`L${i + 1} ex:`, l.filter((_, j) => j % Math.floor(l.length / 6) === 0).slice(0, 6).map(x => x[0]).join(", "));
console.log("Twilight Meadow niveau:", levels.findIndex(l => l.some(([n]) => n === "Twilight Meadow")) + 1);
fs.writeFileSync("levels.json", JSON.stringify(levels.map(l => l.map(([n, h]) => `${n}:${h}`).join("|"))));
