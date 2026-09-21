# Construit pokemon.json : 1025 Pokémon (nom FR, types, catégorie FR), rangés par génération.
# Source : PokéAPI (github.com/PokeAPI/pokeapi, données CSV).
import csv, json
FR = "5"
names, genus = {}, {}
for r in csv.DictReader(open("pokemon_species_names.csv", encoding="utf8")):
    if r["local_language_id"] == FR:
        names[int(r["pokemon_species_id"])] = r["name"]; genus[int(r["pokemon_species_id"])] = r["genus"]
gen = {int(r["id"]): int(r["generation_id"]) for r in csv.DictReader(open("pokemon_species.csv", encoding="utf8"))}
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
    levels[gen[i] - 1].append([i, names[i], t, genus[i]])
used_types = sorted({x for l in levels for e in l for x in e[2]})
out = {"types": {t: tnames[t] for t in used_types}, "levels": levels}
json.dump(out, open("pokemon.json", "w", encoding="utf8"), ensure_ascii=False)
print("Pokémon:", len(ids), "par génération:", [len(l) for l in levels])
print("types:", out["types"])
print(levels[0][24], "|", levels[8][-1])
