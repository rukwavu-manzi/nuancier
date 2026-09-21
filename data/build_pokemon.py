# Construit pokemon.json : 1025 Pokémon (nom FR, types, catégorie FR), rangés par génération.
# Source : PokéAPI (github.com/PokeAPI/pokeapi, données CSV).
import csv, json
FR = "5"
names, genus = {}, {}
for r in csv.DictReader(open("pokemon_species_names.csv", encoding="utf8")):
    if r["local_language_id"] == FR:
        names[int(r["pokemon_species_id"])] = r["name"]; genus[int(r["pokemon_species_id"])] = r["genus"]
gen, evo = {}, {}
for r in csv.DictReader(open("pokemon_species.csv", encoding="utf8")):
    gen[int(r["id"])] = int(r["generation_id"])
    evo[int(r["id"])] = int(r["evolves_from_species_id"]) if r["evolves_from_species_id"] else 0
# Taille (dm) et poids (hg) de la forme par défaut
size = {int(r["species_id"]): (int(r["height"]), int(r["weight"])) for r in csv.DictReader(open("pokemon.csv", encoding="utf8")) if r["is_default"] == "1"}
# Description : la plus récente en français
flavor = {}
for r in csv.DictReader(open("pokemon_species_flavor_text.csv", encoding="utf8")):
    if r["language_id"] == FR:
        sid, v = int(r["species_id"]), int(r["version_id"])
        if sid not in flavor or v > flavor[sid][0]:
            flavor[sid] = (v, " ".join(r["flavor_text"].replace("\f", " ").split()))
types = {}
for r in csv.DictReader(open("pokemon_types.csv", encoding="utf8")):
    pid = int(r["pokemon_id"])
    if pid in gen: types.setdefault(pid, []).append((int(r["slot"]), int(r["type_id"])))
tnames = {int(r["type_id"]): r["name"] for r in csv.DictReader(open("type_names.csv", encoding="utf8")) if r["local_language_id"] == FR}
ids = sorted(gen)
assert ids == list(range(1, len(ids) + 1)), "ids non contigus"
levels = [[] for _ in range(max(gen.values()))]
for i in ids:
    t = [tid for _, tid in sorted(types[i])]
    h, w = size.get(i, (0, 0))
    levels[gen[i] - 1].append([i, names[i], t, genus[i], h, w, evo[i], flavor.get(i, (0, ""))[1]])
used_types = sorted({x for l in levels for e in l for x in e[2]})
out = {"types": {t: tnames[t] for t in used_types}, "levels": levels}
json.dump(out, open("pokemon.json", "w", encoding="utf8"), ensure_ascii=False)
print("Pokémon:", len(ids), "par génération:", [len(l) for l in levels])
print("types:", out["types"])
print(levels[0][24], "|", levels[8][-1][:7])
print("sans description:", sum(1 for l in levels for e in l if not e[7]))
