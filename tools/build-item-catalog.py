#!/usr/bin/env python3
"""Build the read-only item encyclopedia from pinned game and image data."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


GAME_PROJECT = "Dimbreath/turnbasedgamedata"
ASSET_PROJECT = "Mar-7th/StarRailRes"
ASSET_LANGUAGES = {
    "th": "th", "en": "en", "zh-CN": "cn", "zh-TW": "cht", "ja": "jp",
    "ko": "kr", "vi": "vi", "id": "id", "es": "es", "fr": "fr",
    "de": "de", "ru": "ru", "pt": "pt",
}
TEXTMAP_TOKENS = {
    "th": ("TH",), "en": ("EN",), "zh-CN": ("CHS",), "zh-TW": ("CHT",),
    "ja": ("JP",), "ko": ("KR",), "vi": ("VI",), "id": ("ID",),
    "es": ("ES",), "fr": ("FR",), "de": ("DE",), "ru": ("RU",), "pt": ("PT",),
}
TEXT_FIELDS = ("ItemName", "ItemDesc", "ItemBGDesc")
ICON_FIELDS = ("ItemIconPath", "ItemCurrencyIconPath", "ItemAvatarIconPath", "ItemFigureIconPath")


def request_bytes(url: str, attempts: int = 4) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "GaC-Srtool-item-catalog/1.0"})
    last_error = None
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                return response.read()
        except (OSError, urllib.error.URLError) as error:
            last_error = error
            if attempt + 1 < attempts:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Could not download {url}: {last_error}")


def request_json(url: str):
    return json.loads(request_bytes(url))


def cache_path(cache_dir: Path, key: str) -> Path:
    return cache_dir / (re.sub(r"[^A-Za-z0-9_.-]+", "_", key) + ".json")


def cached_json(url: str, cache_dir: Path, key: str):
    path = cache_path(cache_dir, key)
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = request_bytes(url)
        temporary = path.with_suffix(".tmp")
        temporary.write_bytes(payload)
        temporary.replace(path)
    return json.loads(path.read_bytes())


def gitlab_api(project: str, endpoint: str) -> str:
    return f"https://gitlab.com/api/v4/projects/{urllib.parse.quote(project, safe='')}/{endpoint}"


def gitlab_raw(project: str, revision: str, file_path: str) -> str:
    encoded = urllib.parse.quote(file_path, safe="")
    return gitlab_api(project, f"repository/files/{encoded}/raw?ref={revision}")


def discover_files(project: str, revision: str, directory: str) -> list[str]:
    names: list[str] = []
    page = 1
    while True:
        query = urllib.parse.urlencode({
            "ref": revision, "path": directory, "recursive": "true", "per_page": 100, "page": page,
        })
        response = request_json(gitlab_api(project, f"repository/tree?{query}"))
        names.extend(entry["path"] for entry in response if entry.get("type") == "blob")
        if len(response) < 100:
            break
        page += 1
        if page > 100:
            raise RuntimeError(f"Unexpectedly large file listing under {directory}")
    return sorted(names)


def fetch_game_json_files(paths: list[str], revision: str, cache_dir: Path) -> dict[str, object]:
    result: dict[str, object] = {}

    def load_one(path: str):
        return path, cached_json(gitlab_raw(GAME_PROJECT, revision, path), cache_dir, f"game_{path}")

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(load_one, path) for path in paths]
        for future in as_completed(futures):
            path, value = future.result()
            result[path] = value
    return result


def parse_rarity(value, index_row=None) -> int | None:
    if isinstance(value, int):
        return value if 1 <= value <= 5 else None
    if index_row and isinstance(index_row.get("rarity"), int):
        rarity = index_row["rarity"]
        return rarity if 1 <= rarity <= 5 else None
    rarity = str(value or "").lower()
    for label, number in (("superrare", 5), ("veryrare", 5), ("rare", 4), ("notnormal", 3), ("normal", 2), ("low", 1)):
        if label in rarity:
            return number
    return None


def item_hash(row: dict, field: str):
    value = row.get(field)
    if isinstance(value, dict):
        value = value.get("Hash")
    if value is None or value == "":
        return None
    return str(value)


def row_image_paths(row: dict) -> list[str]:
    values = []
    for field in ICON_FIELDS:
        value = row.get(field)
        if isinstance(value, str) and value and value not in values:
            values.append(value.replace("\\", "/").lstrip("/"))
    return values


def rows_preference(path: str) -> tuple[int, str]:
    base = Path(path).name
    if base == "ItemConfig.json":
        return 0, path
    if base in ("ItemConfigEquipment.json", "ItemConfigRelic.json"):
        return 1, path
    return 2, path


def resolve_source_icon(game_paths: list[str], category: str, item_id: int, indexes: dict, asset_files: set[str]) -> str | None:
    index_group = {"item": "items", "lightcone": "light_cones", "relic": "relics"}[category]
    index_row = indexes.get("en", {}).get(index_group, {}).get(str(item_id))
    if isinstance(index_row, dict):
        icon = index_row.get("icon")
        if isinstance(icon, str) and icon in asset_files:
            return icon

    for source_path in game_paths:
        candidates: list[str] = []
        if source_path.startswith("SpriteOutput/ItemIcon/LightConeIcons/"):
            candidates.append(f"icon/light_cone/{item_id}.png")
        if source_path.startswith("SpriteOutput/ItemIcon/RelicIcons/"):
            relic_row = indexes.get("en", {}).get("relics", {}).get(str(item_id))
            if isinstance(relic_row, dict):
                candidates.append(relic_row.get("icon", ""))
        if source_path.startswith("SpriteOutput/ItemIcon/"):
            suffix = source_path.removeprefix("SpriteOutput/ItemIcon/")
            candidates.extend((f"icon/item/{suffix}", f"icon/{suffix}"))
        if source_path.startswith("SpriteOutput/AvatarIcon/Avatar/"):
            suffix = source_path.removeprefix("SpriteOutput/AvatarIcon/Avatar/")
            candidates.extend((f"image/character_portrait/{suffix}", f"icon/avatar/{suffix}"))
        if source_path.startswith("SpriteOutput/AvatarRoundIcon/Avatar/"):
            suffix = source_path.removeprefix("SpriteOutput/AvatarRoundIcon/Avatar/")
            candidates.append(f"icon/avatar/{suffix}")
        if source_path.startswith("SpriteOutput/AvatarShopIcon/Avatar/"):
            suffix = source_path.removeprefix("SpriteOutput/AvatarShopIcon/Avatar/")
            candidates.extend((f"icon/avatar/{suffix}", f"image/character_portrait/{suffix}"))
        if source_path.startswith("SpriteOutput/AvatarShopIcon/AvatarSkin/"):
            suffix = source_path.removeprefix("SpriteOutput/AvatarShopIcon/AvatarSkin/")
            candidates.extend((f"image/character_portrait/{suffix}", f"icon/item/Skin/{suffix}"))
        if source_path.startswith("SpriteOutput/ItemIcon/Skin/"):
            suffix = source_path.removeprefix("SpriteOutput/ItemIcon/Skin/")
            candidates.extend((f"icon/item/Skin/{suffix}", f"icon/item/{suffix}"))
        if source_path.startswith("SpriteOutput/ItemFigures/"):
            suffix = source_path.removeprefix("SpriteOutput/ItemFigures/")
            candidates.extend((f"image/item/{suffix}", f"image/items/{suffix}"))
        for candidate in candidates:
            if candidate and candidate in asset_files:
                return candidate
    return None


def read_asset_indexes(revision: str, cache_dir: Path, asset_files: set[str]) -> dict[str, dict[str, dict]]:
    base = f"https://raw.githubusercontent.com/{ASSET_PROJECT}/{revision}/index_new"
    kinds = ("items", "light_cones", "relics")
    indexes: dict[str, dict[str, dict]] = {}
    jobs = {}
    with ThreadPoolExecutor(max_workers=12) as pool:
        for language, asset_language in ASSET_LANGUAGES.items():
            indexes[language] = {}
            for kind in kinds:
                url = f"{base}/{asset_language}/{kind}.json"
                key = f"starrailres_{asset_language}_{kind}"
                jobs[pool.submit(cached_json, url, cache_dir, key)] = (language, kind)
        for future in as_completed(jobs):
            language, kind = jobs[future]
            try:
                data = future.result()
            except RuntimeError:
                # Some locales omit a data family; localized text maps fill its names.
                data = {}
            if not isinstance(data, dict):
                data = {}
            indexes[language][kind] = data
    # The pinned repository tree is the authority for whether an icon URL exists.
    for language in indexes:
        for kind, table in indexes[language].items():
            for row in table.values():
                icon = row.get("icon") if isinstance(row, dict) else None
                if icon and icon not in asset_files:
                    row.pop("icon", None)
    return indexes


def textmap_files_by_language(paths: list[str]) -> dict[str, list[str]]:
    result = {}
    for language, tokens in TEXTMAP_TOKENS.items():
        matched = []
        for path in paths:
            name = Path(path).name.upper()
            if not name.startswith("TEXTMAP") or not name.endswith(".JSON"):
                continue
            token = name[len("TEXTMAP"):-len(".JSON")].split("_")[0]
            if token in tokens:
                matched.append(path)
        result[language] = sorted(matched)
    return result


def localized_textmaps(paths: list[str], revision: str, cache_dir: Path, wanted_hashes: set[str]) -> dict[str, dict[str, str]]:
    maps: dict[str, dict[str, str]] = {language: {} for language in TEXTMAP_TOKENS}
    by_language = textmap_files_by_language(paths)
    for language, files in by_language.items():
        if not files or not wanted_hashes:
            continue
        print(f"Reading {language} text maps ({len(files)} file(s))", flush=True)
        for path in files:
            data = cached_json(gitlab_raw(GAME_PROJECT, revision, path), cache_dir, f"game_{path}")
            if isinstance(data, dict):
                for key in wanted_hashes:
                    value = data.get(key)
                    if isinstance(value, str) and value:
                        maps[language][key] = value
            del data
        print(f"  localized strings: {len(maps[language])}", flush=True)
    return maps


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inventory-config", required=True, type=Path, help="Go resource InventoryItemConfig.json")
    parser.add_argument("--output", type=Path, default=Path("assets/item-catalog.json"))
    parser.add_argument("--cache-dir", type=Path, default=Path(tempfile.gettempdir()) / "gac-srtool-item-catalog-cache")
    args = parser.parse_args()

    inventory = json.loads(args.inventory_config.read_text(encoding="utf-8"))
    game_revision = inventory["source"]["revision"]
    supported_ids = {int(value) for value in inventory["item_ids"]}
    supported_lcs = {int(row["id"]) for row in inventory.get("lightcones", [])}
    supported_relics = {int(row["relic_id"]) for row in inventory.get("relics", [])}
    supported_ids.update(supported_lcs)
    supported_ids.update(supported_relics)
    asset_revision = "dbe8cdfcfb0bf657b9fe1cf92d5537f118ccb487"

    print("Discovering game item tables...", flush=True)
    excel_files = discover_files(GAME_PROJECT, game_revision, "ExcelOutput")
    candidates = [path for path in excel_files if "ItemConfig" in Path(path).name and path.lower().endswith(".json")]
    tables = fetch_game_json_files(candidates, game_revision, args.cache_dir)
    item_rows: dict[int, list[tuple[str, dict]]] = {}
    table_scan = []
    for path in sorted(candidates):
        data = tables[path]
        valid_rows = [row for row in data if isinstance(row, dict) and isinstance(row.get("ID"), int) and row.get("ID") > 0 and isinstance(row.get("ItemMainType"), str)] if isinstance(data, list) else []
        table_scan.append({"table": path, "rows": len(data) if isinstance(data, list) else 0, "itemRows": len(valid_rows)})
        for row in valid_rows:
            item_rows.setdefault(row["ID"], []).append((path, row))
    definition_tables = [row["table"] for row in table_scan if row["itemRows"]]
    if not item_rows:
        raise RuntimeError("No item definition rows were found in ItemConfig tables")
    print(f"Accepted {len(definition_tables)} tables; {sum(row['itemRows'] for row in table_scan)} rows; {len(item_rows)} unique IDs", flush=True)

    print("Reading pinned asset index...", flush=True)
    tree_url = f"https://api.github.com/repos/{ASSET_PROJECT}/git/trees/{asset_revision}?recursive=1"
    tree = request_json(tree_url)
    if tree.get("truncated"):
        raise RuntimeError("Pinned asset tree was truncated; refusing incomplete image coverage")
    asset_files = {entry["path"] for entry in tree.get("tree", []) if entry.get("type") == "blob"}
    indexes = read_asset_indexes(asset_revision, args.cache_dir, asset_files)

    hashes = set()
    for rows in item_rows.values():
        for _, row in rows:
            for field in TEXT_FIELDS:
                value = item_hash(row, field)
                if value:
                    hashes.add(value)
    print(f"Resolving {len(hashes)} game text keys across 13 locales...", flush=True)
    textmap_paths = discover_files(GAME_PROJECT, game_revision, "TextMap")
    textmaps = localized_textmaps(textmap_paths, game_revision, args.cache_dir, hashes)

    existing_item_names = indexes.get("en", {}).get("items", {})
    existing_lc_names = indexes.get("en", {}).get("light_cones", {})
    existing_relic_names = indexes.get("en", {}).get("relics", {})
    merged = []
    name_coverage = {language: 0 for language in ASSET_LANGUAGES}
    description_coverage = {language: 0 for language in ASSET_LANGUAGES}
    background_description_coverage = {language: 0 for language in ASSET_LANGUAGES}
    for item_id in sorted(item_rows):
        source_rows = sorted(item_rows[item_id], key=lambda pair: rows_preference(pair[0]))
        all_rows = [row for _, row in source_rows]
        all_paths = []
        for row in all_rows:
            for path in row_image_paths(row):
                if path not in all_paths:
                    all_paths.append(path)
        preferred = all_rows[0]
        if item_id in supported_lcs:
            category, index_kind = "lightcone", "light_cones"
        elif item_id in supported_relics:
            category, index_kind = "relic", "relics"
        else:
            category, index_kind = "item", "items"
        index_rows = indexes.get("en", {}).get(index_kind, {})
        index_row = index_rows.get(str(item_id), {}) if isinstance(index_rows, dict) else {}
        name_hash = next((item_hash(row, "ItemName") for _, row in source_rows if item_hash(row, "ItemName")), None)
        desc_hash = next((item_hash(row, "ItemDesc") for _, row in source_rows if item_hash(row, "ItemDesc")), None)
        bg_desc_hash = next((item_hash(row, "ItemBGDesc") for _, row in source_rows if item_hash(row, "ItemBGDesc")), None)
        names = {}
        descriptions = {}
        background_descriptions = {}
        for language in ASSET_LANGUAGES:
            locale_index = indexes.get(language, {}).get(index_kind, {})
            locale_row = locale_index.get(str(item_id), {}) if isinstance(locale_index, dict) else {}
            textmap = textmaps.get(language, {})
            name = textmap.get(name_hash) if name_hash else None
            if not name and isinstance(locale_row, dict):
                name = locale_row.get("name")
            if not name and isinstance(index_row, dict):
                name = index_row.get("name")
            if name:
                names[language] = name
                name_coverage[language] += 1
            desc = textmap.get(desc_hash) if desc_hash else None
            if not desc and isinstance(locale_row, dict):
                desc = locale_row.get("desc")
            if desc and language:
                descriptions[language] = desc
                description_coverage[language] += 1
            bg_desc = textmap.get(bg_desc_hash) if bg_desc_hash else None
            if bg_desc:
                background_descriptions[language] = bg_desc
                background_description_coverage[language] += 1

        # Fill sparse locales with the English name only if the source has no localized text.
        english_name = names.get("en") or (index_row.get("name") if isinstance(index_row, dict) else None) or f"Item {item_id}"
        for language in ASSET_LANGUAGES:
            names.setdefault(language, english_name)
        icon = resolve_source_icon(all_paths, category, item_id, indexes, asset_files)
        rarity = parse_rarity(preferred.get("Rarity"), index_row)
        output_row = {
            "id": item_id,
            "category": category,
            "type": preferred.get("ItemMainType", ""),
            "subType": preferred.get("ItemSubType", ""),
            "rarity": rarity,
            "names": names,
            "descriptions": descriptions,
            "backgroundDescriptions": background_descriptions,
            "icon": icon,
            "gameIconPaths": all_paths,
            "sourceTables": sorted({path for path, _ in source_rows}),
            "supported": item_id in supported_ids,
        }
        pile_limit = next((row.get("PileLimit") for _, row in source_rows if isinstance(row.get("PileLimit"), int)), None)
        if pile_limit:
            output_row["pileLimit"] = pile_limit
        if category == "lightcone":
            output_row["path"] = index_row.get("path") if isinstance(index_row, dict) else None
        elif category == "relic":
            if isinstance(index_row, dict):
                output_row["setId"] = int(index_row["set_id"]) if str(index_row.get("set_id", "")).isdigit() else None
                output_row["slot"] = index_row.get("type")
        merged.append(output_row)

    counts = {
        "total": len(merged),
        "definitionRows": sum(row["itemRows"] for row in table_scan),
        "uniqueIds": len(merged),
        "supported": sum(row["supported"] for row in merged),
        "withImages": sum(bool(row["icon"]) for row in merged),
        "withoutConfiguredImage": sum(not row["icon"] for row in merged),
        "withDescriptions": sum(bool(row["descriptions"] or row["backgroundDescriptions"]) for row in merged),
        "nameCoverageByLanguage": name_coverage,
        "descriptionCoverageByLanguage": description_coverage,
        "backgroundDescriptionCoverageByLanguage": background_description_coverage,
        "candidateTables": len(candidates),
        "definitionTables": len(definition_tables),
    }
    output = {
        "source": {
            "gameRepository": f"https://gitlab.com/{GAME_PROJECT}",
            "gameRevision": game_revision,
            "candidateTables": len(candidates),
            "gameTables": definition_tables,
            "tableScan": table_scan,
            "assetRepository": ASSET_PROJECT,
            "assetRevision": asset_revision,
            "assetBaseUrl": f"https://cdn.jsdelivr.net/gh/{ASSET_PROJECT}@{asset_revision}/",
            "assetFallbackBaseUrl": f"https://raw.githubusercontent.com/{ASSET_PROJECT}/{asset_revision}/",
            "languages": list(ASSET_LANGUAGES),
            "notes": "Includes every ItemConfig table with item-definition rows at the pinned game-data revision. Items absent from InventoryItemConfig are browse-only; the catalog does not add or summon items. Icons use only files present in the pinned public StarRailRes tree. gameIconPaths retain the source paths for items without a mapped public icon.",
        },
        "counts": counts,
        "items": merged,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps(counts, ensure_ascii=False, indent=2), flush=True)
    print(f"Wrote {len(merged)} item rows to {args.output}", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # give the CLI one actionable line on network/schema failures
        print(f"item catalog build failed: {error}", file=sys.stderr)
        raise
