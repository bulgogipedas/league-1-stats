from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).parent
PUBLIC_DATA = ROOT / "public" / "data"

MATCH_DIR = ROOT / "match analisis"
FORMATION_DIR = ROOT / "formation"
TEAM_DIR = ROOT / "team analisis"
PLAYER_DIR = ROOT / "player"


TEAM_SLUGS = {
    "arema": "arema",
    "bali": "bali",
    "bali utd": "bali",
    "bali united": "bali",
    "bhayangkara": "bhayangkara",
    "borneo": "borneo",
    "dewa": "dewa",
    "dewa utd": "dewa",
    "madura": "madura",
    "madura utd": "madura",
    "malut": "malut",
    "malut utd": "malut",
    "persebaya": "persebaya",
    "persib": "persib",
    "persija": "persija",
    "persijap": "persijap",
    "persik": "persik",
    "persis": "persis",
    "persita": "persita",
    "psbs": "psbs",
    "psim": "psim",
    "psm": "psm",
    "semen padang": "semen-padang",
}

TEAM_DISPLAY = {
    "arema": "Arema FC",
    "bali": "Bali United",
    "bhayangkara": "Bhayangkara",
    "borneo": "Borneo FC",
    "dewa": "Dewa United",
    "madura": "Madura United",
    "malut": "Malut United",
    "persebaya": "Persebaya",
    "persib": "Persib Bandung",
    "persija": "Persija Jakarta",
    "persijap": "Persijap Jepara",
    "persik": "Persik Kediri",
    "persis": "Persis Solo",
    "persita": "Persita Tangerang",
    "psbs": "PSBS Biak",
    "psim": "PSIM Yogyakarta",
    "psm": "PSM Makassar",
    "semen-padang": "Semen Padang",
}

TRUTH_STANDINGS_SOURCE = {
    "name": "Liga Indonesia Baru, BRI Super League 2025-26 standings",
    "url": "https://www.ligaindonesiabaru.com/table/download/88/BRI%20SUPER%20LEAGUE%202025-26/1/0/",
    "published": "2026-05-16",
    "note": "Official downloadable standings snapshot found via public search. Match-level CSVs remain local source for per-match charts.",
}

TRUTH_STANDINGS = [
    {"team_slug": "persib", "Pos": 1, "MP": 32, "W": 23, "D": 6, "L": 3, "GF": 57, "GA": 21, "GD": 36, "Pts": 75},
    {"team_slug": "borneo", "Pos": 2, "MP": 32, "W": 24, "D": 3, "L": 5, "GF": 67, "GA": 30, "GD": 37, "Pts": 75},
    {"team_slug": "persija", "Pos": 3, "MP": 32, "W": 20, "D": 5, "L": 7, "GF": 59, "GA": 28, "GD": 31, "Pts": 65},
    {"team_slug": "dewa", "Pos": 4, "MP": 32, "W": 16, "D": 5, "L": 11, "GF": 44, "GA": 35, "GD": 9, "Pts": 53},
    {"team_slug": "persebaya", "Pos": 5, "MP": 32, "W": 14, "D": 10, "L": 8, "GF": 49, "GA": 35, "GD": 14, "Pts": 52},
    {"team_slug": "malut", "Pos": 6, "MP": 32, "W": 15, "D": 7, "L": 10, "GF": 66, "GA": 45, "GD": 21, "Pts": 52},
    {"team_slug": "bhayangkara", "Pos": 7, "MP": 32, "W": 15, "D": 5, "L": 12, "GF": 45, "GA": 41, "GD": 4, "Pts": 50},
    {"team_slug": "bali", "Pos": 8, "MP": 32, "W": 12, "D": 9, "L": 11, "GF": 52, "GA": 47, "GD": 5, "Pts": 45},
    {"team_slug": "persita", "Pos": 9, "MP": 32, "W": 13, "D": 5, "L": 14, "GF": 36, "GA": 33, "GD": 3, "Pts": 44},
    {"team_slug": "arema", "Pos": 10, "MP": 32, "W": 11, "D": 9, "L": 12, "GF": 45, "GA": 44, "GD": 1, "Pts": 42},
    {"team_slug": "psim", "Pos": 11, "MP": 32, "W": 10, "D": 12, "L": 10, "GF": 40, "GA": 40, "GD": 0, "Pts": 42},
    {"team_slug": "persik", "Pos": 12, "MP": 32, "W": 11, "D": 6, "L": 15, "GF": 41, "GA": 53, "GD": -12, "Pts": 39},
    {"team_slug": "persijap", "Pos": 13, "MP": 32, "W": 9, "D": 7, "L": 16, "GF": 31, "GA": 45, "GD": -14, "Pts": 34},
    {"team_slug": "psm", "Pos": 14, "MP": 32, "W": 8, "D": 10, "L": 14, "GF": 38, "GA": 45, "GD": -7, "Pts": 34},
    {"team_slug": "madura", "Pos": 15, "MP": 32, "W": 8, "D": 8, "L": 16, "GF": 34, "GA": 52, "GD": -18, "Pts": 32},
    {"team_slug": "persis", "Pos": 16, "MP": 32, "W": 6, "D": 10, "L": 16, "GF": 35, "GA": 58, "GD": -23, "Pts": 28},
    {"team_slug": "semen-padang", "Pos": 17, "MP": 32, "W": 5, "D": 5, "L": 22, "GF": 22, "GA": 55, "GD": -33, "Pts": 20},
    {"team_slug": "psbs", "Pos": 18, "MP": 32, "W": 4, "D": 6, "L": 22, "GF": 29, "GA": 83, "GD": -54, "Pts": 18},
]

POSITION_LABELS = {
    "D": "Defender",
    "M": "Midfielder",
    "F": "Forward",
    "G": "Goalkeeper",
}

NUMERIC_COLUMNS = {
    "Min",
    "MP",
    "Avg Rating",
    "Passes",
    "Acc. Passes",
    "Long Balls",
    "Acc. Long Balls",
    "Assists",
    "Own Half Passes",
    "Acc. Own Half Passes",
    "Opp Half Passes",
    "Acc. Opp Half Passes",
    "Crosses",
    "Acc. Crosses",
    "Key Passes",
    "Aerial Duels Lost",
    "Aerial Duels Won",
    "Duels Lost",
    "Duels Won",
    "Challenges Lost",
    "Contests",
    "Contests Won",
    "Shots",
    "Shots on Target",
    "Shots off Target",
    "Shots Blocked",
    "Goals",
    "Hit Woodwork",
    "Big Chances Missed",
    "xG",
    "expected_assists",
    "Clearances",
    "Blocked Shots",
    "Interceptions",
    "Ball Recoveries",
    "Tackles",
    "Tackles Won",
    "Dispossessed",
    "Fouls Drawn",
    "Fouls Committed",
    "Offsides",
    "Pen. Conceded",
    "Pen. Won",
    "Own Goals",
    "Crosses Not Claimed",
    "High Claims",
    "Saves (Box)",
    "Saves",
    "Sweeper Actions",
    "Acc. Sweeper Actions",
    "Touches",
    "Unsuccessful Touches",
    "Possession Lost",
    "Overall",
    "Distribution",
    "Duels",
    "Shooting",
    "Defensive",
    "Discipline",
    "Goalkeeping",
    "Possession & Control",
}


def clean_text(value: str | None) -> str:
    return (value or "").replace("\ufeff", "").replace("–", "-").replace("—", "-").strip()


def as_number(value):
    value = clean_text(value)
    if value == "":
        return 0
    value = value.replace("%", "").replace(",", "")
    try:
        number = float(value)
    except ValueError:
        return clean_text(value)
    return int(number) if number.is_integer() else number


def safe_div(numerator: float, denominator: float) -> float:
    return round((numerator / denominator) if denominator else 0, 4)


def slugify_name(name: str) -> str:
    source = clean_text(name).lower()
    source = source.replace("fc", "").replace("united", "utd").replace("samarinda", "")
    source = re.sub(r"[^a-z0-9]+", " ", source).strip()
    for key, slug in sorted(TEAM_SLUGS.items(), key=lambda item: len(item[0]), reverse=True):
        if key in source:
            return slug
    return re.sub(r"[^a-z0-9]+", "-", clean_text(name).lower()).strip("-")


def display_name(slug: str) -> str:
    return TEAM_DISPLAY.get(slug, slug.replace("-", " ").title())


def read_csv(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        return [dict(row) for row in csv.DictReader(handle)]


def normalize_row(row: dict) -> dict:
    normalized = {}
    for key, value in row.items():
        key = clean_text(key)
        normalized[key] = as_number(value) if key in NUMERIC_COLUMNS else clean_text(value)
    return normalized


def parse_score(score: str) -> tuple[int, int]:
    parts = [int(part) for part in re.findall(r"\d+", clean_text(score))]
    if len(parts) < 2:
        return 0, 0
    return parts[0], parts[1]


def parse_home_away_score(score: str, venue: str) -> tuple[int, int]:
    home_goals, away_goals = parse_score(score)
    return (home_goals, away_goals) if venue == "Home" else (away_goals, home_goals)


def add_derived(row: dict) -> dict:
    row["pass_accuracy_pct"] = round(safe_div(row.get("Acc. Passes", 0), row.get("Passes", 0)) * 100, 1)
    row["points"] = {"W": 3, "D": 1, "L": 0}.get(row.get("Result"), 0)
    row["points_per_match"] = row["points"]
    row["xg_difference"] = round(row.get("xG", 0) - row.get("goals_against", 0), 2)
    row["shot_conversion_rate"] = round(safe_div(row.get("Goals", 0), row.get("Shots", 0)) * 100, 1)
    row["tackle_success_rate"] = round(safe_div(row.get("Tackles Won", 0), row.get("Tackles", 0)) * 100, 1)
    return row


def normalize_player_rows(rows: list[dict]) -> list[dict]:
    output = []
    for raw in rows:
        row = normalize_row(raw)
        pos = clean_text(row.get("Pos"))
        team_slug = slugify_name(row.get("Team", ""))
        row["original_team"] = row.get("Team", "")
        row["Team"] = display_name(team_slug)
        row["team_slug"] = team_slug
        row["position_label"] = POSITION_LABELS.get(pos, pos)
        row["pass_accuracy_pct"] = round(safe_div(row.get("Acc. Passes", 0), row.get("Passes", 0)) * 100, 1)
        row["shot_conversion_rate"] = round(safe_div(row.get("Goals", 0), row.get("Shots", 0)) * 100, 1)
        row["tackle_success_rate"] = round(safe_div(row.get("Tackles Won", 0), row.get("Tackles", 0)) * 100, 1)
        minutes_factor = row.get("Min", 0) / 90 if isinstance(row.get("Min", 0), (int, float)) else 0
        for metric in [
            "Goals",
            "Assists",
            "Shots",
            "Shots on Target",
            "Key Passes",
            "Tackles",
            "Interceptions",
            "Ball Recoveries",
            "Saves",
        ]:
            row[f"{metric}_total_est"] = round(row.get(metric, 0) * minutes_factor, 0)
        if "expected_assists" in row:
            row["xA"] = row["expected_assists"]
            row["xA_total_est"] = round(row.get("expected_assists", 0) * minutes_factor, 2)
        if "xG" in row:
            row["xG_total_est"] = round(row.get("xG", 0) * minutes_factor, 2)
        output.append(row)
    return output


def merge_players(per90: list[dict], performance: list[dict]) -> list[dict]:
    perf_index = {(row.get("Player"), row.get("Team")): row for row in performance}
    merged = []
    for row in per90:
        key = (row.get("Player"), row.get("Team"))
        perf = perf_index.get(key, {})
        combined = {**row}
        for metric in ["Overall", "Distribution", "Duels", "Shooting", "Defensive", "Discipline", "Goalkeeping", "Possession & Control"]:
            combined[metric] = perf.get(metric, 0)
        merged.append(combined)
    return merged


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def process_match_files() -> tuple[dict[str, list[dict]], list[dict]]:
    by_team = {}
    all_rows = []
    for path in sorted(MATCH_DIR.glob("*.csv")):
        slug = slugify_name(path.stem)
        team_name = display_name(slug)
        rows = []
        for index, raw in enumerate(read_csv(path), start=1):
            row = normalize_row(raw)
            row["team"] = team_name
            row["team_slug"] = slug
            row["match_id"] = f"{slug}-{row.get('Round', index)}"
            row["goals_for"], row["goals_against"] = parse_score(row.get("Score", ""))
            row["goal_difference"] = row["goals_for"] - row["goals_against"]
            row["round_number"] = int(row.get("Round") or index)
            row = add_derived(row)
            rows.append(row)
            all_rows.append(row)
        rows.sort(key=lambda item: item.get("round_number", 0))
        by_team[slug] = rows
        write_json(PUBLIC_DATA / "match_analysis" / f"{slug}.json", rows)
    return by_team, all_rows


def process_simple_dir(source: Path, output_name: str) -> None:
    for path in sorted(source.glob("*.csv")):
        slug = slugify_name(path.stem)
        rows = [normalize_row(row) for row in read_csv(path)]
        for row in rows:
            row["team"] = display_name(slug)
            row["team_slug"] = slug
            if "Score" in row and "Venue" not in row and "Home" in row and "Away" in row:
                own_is_home = slugify_name(row.get("Home", "")) == slug
                row["Venue"] = "Home" if own_is_home else "Away"
                row["goals_for"], row["goals_against"] = parse_home_away_score(row.get("Score", ""), row["Venue"])
        write_json(PUBLIC_DATA / output_name / f"{slug}.json", rows)


def build_standings(match_rows_by_team: dict[str, list[dict]]) -> list[dict]:
    standings = []
    for slug, rows in match_rows_by_team.items():
        stat = {
            "team": display_name(slug),
            "team_slug": slug,
            "MP": len(rows),
            "W": sum(1 for row in rows if row.get("Result") == "W"),
            "D": sum(1 for row in rows if row.get("Result") == "D"),
            "L": sum(1 for row in rows if row.get("Result") == "L"),
            "GF": sum(row.get("goals_for", 0) for row in rows),
            "GA": sum(row.get("goals_against", 0) for row in rows),
            "Pts": sum(row.get("points", 0) for row in rows),
            "form": [row.get("Result") for row in rows[-5:]],
            "home_win_rate": round(safe_div(sum(1 for row in rows if row.get("Venue") == "Home" and row.get("Result") == "W"), sum(1 for row in rows if row.get("Venue") == "Home")) * 100, 1),
            "away_win_rate": round(safe_div(sum(1 for row in rows if row.get("Venue") == "Away" and row.get("Result") == "W"), sum(1 for row in rows if row.get("Venue") == "Away")) * 100, 1),
            "goals_per_match": round(safe_div(sum(row.get("goals_for", 0) for row in rows), len(rows)), 2),
            "xg_per_match": round(safe_div(sum(row.get("xG", 0) for row in rows), len(rows)), 2),
            "avg_rating": round(safe_div(sum(row.get("Avg Rating", 0) for row in rows), len(rows)), 2),
        }
        stat["GD"] = stat["GF"] - stat["GA"]
        standings.append(stat)
    standings.sort(key=lambda row: (row["Pts"], row["GD"], row["GF"], row["team"]), reverse=True)
    for index, row in enumerate(standings, start=1):
        row["Pos"] = index
    return standings


def apply_truth_standings(local_standings: list[dict]) -> tuple[list[dict], list[dict]]:
    local_by_slug = {row["team_slug"]: row for row in local_standings}
    synced = []
    audit_rows = []
    for truth in TRUTH_STANDINGS:
        local = local_by_slug.get(truth["team_slug"], {})
        row = {**local, **truth}
        row["team"] = display_name(truth["team_slug"])
        row["source"] = "official_standings"
        row["form"] = local.get("form", [])
        row["home_win_rate"] = local.get("home_win_rate", 0)
        row["away_win_rate"] = local.get("away_win_rate", 0)
        row["goals_per_match"] = round(safe_div(row["GF"], row["MP"]), 2)
        row["xg_per_match"] = local.get("xg_per_match", 0)
        row["avg_rating"] = local.get("avg_rating", 0)
        synced.append(row)
        diffs = {
            key: {"raw": local.get(key), "official": truth.get(key)}
            for key in ["MP", "W", "D", "L", "GF", "GA", "GD", "Pts", "Pos"]
            if local.get(key) != truth.get(key)
        }
        audit_rows.append({
            "team_slug": truth["team_slug"],
            "team": display_name(truth["team_slug"]),
            "status": "review" if diffs else "aligned",
            "diffs": diffs,
            "local": {key: local.get(key) for key in ["Pos", "MP", "W", "D", "L", "GF", "GA", "GD", "Pts"]},
            "official": truth,
        })
    return synced, audit_rows


def build_league_summary(standings: list[dict], all_matches: list[dict]) -> dict:
    unique_matches = {(row.get("Date"), min(row.get("team_slug"), slugify_name(row.get("Opponent"))), max(row.get("team_slug"), slugify_name(row.get("Opponent")))) for row in all_matches}
    highest_xg = max(all_matches, key=lambda row: row.get("xG", 0), default={})
    return {
        "total_goals": sum(row["GF"] for row in standings),
        "total_matches": len(unique_matches),
        "average_goals_per_match": round(safe_div(sum(row["GF"] for row in standings), len(unique_matches)), 2),
        "most_prolific_team": max(standings, key=lambda row: row.get("GF", 0), default={}),
        "best_defense": min(standings, key=lambda row: row.get("GA", 0), default={}),
        "highest_single_match_xg": {
            "team": highest_xg.get("team"),
            "opponent": highest_xg.get("Opponent"),
            "round": highest_xg.get("Round"),
            "xG": highest_xg.get("xG", 0),
        },
        "source": TRUTH_STANDINGS_SOURCE,
    }


def build_data_audit(local_standings: list[dict], truth_audit: list[dict], players: list[dict]) -> dict:
    suspicious_per90 = []
    for player in players:
        for metric in ["Goals", "Assists", "xG", "expected_assists"]:
            value = player.get(metric, 0)
            if isinstance(value, (int, float)) and 0 < value < 1:
                suspicious_per90.append({
                    "player": player.get("Player"),
                    "team": player.get("Team"),
                    "metric": metric,
                    "per90": value,
                    "estimated_total": player.get(f"{metric}_total_est") or player.get("xA_total_est"),
                })
                break
    return {
        "standings_source": TRUTH_STANDINGS_SOURCE,
        "standings_policy": "Official standings override local aggregate table. Match-level charts still use local CSV match files.",
        "standings_comparison": truth_audit,
        "player_metric_policy": "player-metrics per 90 minutes.csv is a rate table. UI leaderboards must display estimated totals for counting metrics and per90 as secondary context.",
        "player_per90_examples": suspicious_per90[:25],
        "local_standings_before_sync": local_standings,
    }


def build_formation_summary() -> None:
    for path in sorted(FORMATION_DIR.glob("*.csv")):
        slug = slugify_name(path.stem)
        rows = [normalize_row(row) for row in read_csv(path)]
        counts = Counter(row.get("Formation") for row in rows if row.get("Formation"))
        output = []
        for row in rows:
            row["team"] = display_name(slug)
            row["team_slug"] = slug
            row["formation_frequency"] = counts.get(row.get("Formation"), 0)
            output.append(row)
        write_json(PUBLIC_DATA / "formation" / f"{slug}.json", output)


def main() -> None:
    PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
    match_rows_by_team, all_matches = process_match_files()
    local_standings = build_standings(match_rows_by_team)
    standings, truth_audit = apply_truth_standings(local_standings)
    write_json(PUBLIC_DATA / "standings.json", standings)
    write_json(PUBLIC_DATA / "league_summary.json", build_league_summary(standings, all_matches))

    per90 = normalize_player_rows(read_csv(PLAYER_DIR / "player-metrics per 90 minutes.csv"))
    performance = normalize_player_rows(read_csv(PLAYER_DIR / "player-performace.csv"))
    write_json(PUBLIC_DATA / "player_per90.json", per90)
    write_json(PUBLIC_DATA / "player_performance.json", performance)
    write_json(PUBLIC_DATA / "players_merged.json", merge_players(per90, performance))
    write_json(PUBLIC_DATA / "data_audit.json", build_data_audit(local_standings, truth_audit, per90))

    process_simple_dir(TEAM_DIR, "team_analysis")
    build_formation_summary()

    manifest = {
        "teams": [{"slug": slug, "name": display_name(slug)} for slug in sorted(match_rows_by_team)],
        "position_labels": POSITION_LABELS,
    }
    write_json(PUBLIC_DATA / "manifest.json", manifest)
    print(f"Exported {len(standings)} teams, {len(all_matches)} team match rows, {len(per90)} players")


if __name__ == "__main__":
    main()
