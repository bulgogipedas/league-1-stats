import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { closePool, query } from "./db.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "public", "data");

async function json(path) {
  return JSON.parse(await readFile(join(dataDir, path), "utf8"));
}

function n(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

async function loadSchema() {
  const sql = await readFile(join(root, "backend", "schema.sql"), "utf8");
  await query(sql);
}

async function resetTables() {
  await query("truncate table team_metrics, formations, players, matches, standings, teams, league_summary restart identity cascade");
}

async function insertTeams(teams) {
  for (const team of teams) {
    await query(
      "insert into teams(slug, name) values($1, $2) on conflict(slug) do update set name = excluded.name",
      [team.slug, team.name]
    );
  }
}

async function insertStandings(rows) {
  for (const row of rows) {
    await query(
      `insert into standings(
        team_slug, position, matches_played, wins, draws, loses, goals_for, goals_against,
        goal_difference, points, form, home_win_rate, away_win_rate, goals_per_match,
        xg_per_match, avg_rating, raw
      ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17::jsonb)`,
      [
        row.team_slug,
        row.Pos,
        row.MP,
        row.W,
        row.D,
        row.L,
        row.GF,
        row.GA,
        row.GD,
        row.Pts,
        JSON.stringify(row.form || []),
        n(row.home_win_rate),
        n(row.away_win_rate),
        n(row.goals_per_match),
        n(row.xg_per_match),
        n(row.avg_rating),
        JSON.stringify(row),
      ]
    );
  }
}

async function insertMatches(teams) {
  for (const team of teams) {
    const rows = await json(`match_analysis/${team.slug}.json`);
    for (const row of rows) {
      await query(
        `insert into matches(
          match_id, team_slug, round_number, match_date, match_label, score, venue, opponent,
          result, avg_rating, passes, accurate_passes, pass_accuracy_pct, shots,
          shots_on_target, goals, xg, goals_for, goals_against, goal_difference, points,
          tackles, tackles_won, ball_recoveries, interceptions, key_passes, crosses, raw
        ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28::jsonb)`,
        [
          row.match_id,
          row.team_slug,
          row.round_number,
          row.Date || null,
          row.Match,
          row.Score,
          row.Venue,
          row.Opponent,
          row.Result,
          n(row["Avg Rating"]),
          n(row.Passes),
          n(row["Acc. Passes"]),
          n(row.pass_accuracy_pct),
          n(row.Shots),
          n(row["Shots on Target"]),
          n(row.Goals),
          n(row.xG),
          n(row.goals_for),
          n(row.goals_against),
          n(row.goal_difference),
          n(row.points),
          n(row.Tackles),
          n(row["Tackles Won"]),
          n(row["Ball Recoveries"]),
          n(row.Interceptions),
          n(row["Key Passes"]),
          n(row.Crosses),
          JSON.stringify(row),
        ]
      );
    }
  }
}

async function insertPlayers() {
  const rows = await json("players_merged.json");
  for (const row of rows) {
    await query(
      `insert into players(
        player, team_slug, team, pos, position_label, minutes, matches_played, overall,
        distribution, duels, shooting, defensive, discipline, goalkeeping, possession_control,
        goals, xg, xa, assists, passes, accurate_passes, pass_accuracy_pct, shots,
        shots_on_target, tackles, tackles_won, clearances, interceptions, ball_recoveries,
        saves, raw
      ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31::jsonb)
      on conflict(player, team) do update set raw = excluded.raw`,
      [
        row.Player,
        row.team_slug,
        row.Team,
        row.Pos,
        row.position_label,
        n(row.Min),
        n(row.MP),
        n(row.Overall),
        n(row.Distribution),
        n(row.Duels),
        n(row.Shooting),
        n(row.Defensive),
        n(row.Discipline),
        n(row.Goalkeeping),
        n(row["Possession & Control"]),
        n(row.Goals),
        n(row.xG),
        n(row.xA),
        n(row.Assists),
        n(row.Passes),
        n(row["Acc. Passes"]),
        n(row.pass_accuracy_pct),
        n(row.Shots),
        n(row["Shots on Target"]),
        n(row.Tackles),
        n(row["Tackles Won"]),
        n(row.Clearances),
        n(row.Interceptions),
        n(row["Ball Recoveries"]),
        n(row.Saves),
        JSON.stringify(row),
      ]
    );
  }
}

async function insertFormations(teams) {
  for (const team of teams) {
    const rows = await json(`formation/${team.slug}.json`);
    for (const row of rows) {
      await query(
        `insert into formations(
          team_slug, round_number, home, away, score, formation, opponent_formation,
          result, goals_for, goals_against, formation_frequency, raw
        ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)`,
        [
          row.team_slug,
          n(row.Rd),
          row.Home,
          row.Away,
          row.Score,
          row.Formation,
          row["Opp Formation"],
          row.Result,
          n(row.goals_for),
          n(row.goals_against),
          n(row.formation_frequency),
          JSON.stringify(row),
        ]
      );
    }
  }
}

async function insertTeamMetrics(teams) {
  for (const team of teams) {
    const rows = await json(`team_analysis/${team.slug}.json`);
    for (const row of rows) {
      await query(
        `insert into team_metrics(team_slug, metric, team_value, league_avg, rank, raw)
         values($1,$2,$3,$4,$5,$6::jsonb)
         on conflict(team_slug, metric) do update set team_value = excluded.team_value, league_avg = excluded.league_avg, rank = excluded.rank, raw = excluded.raw`,
        [row.team_slug, row.Metric, String(row.Team ?? ""), String(row["League Avg"] ?? ""), String(row.Rank ?? ""), JSON.stringify(row)]
      );
    }
  }
}

async function main() {
  const manifest = await json("manifest.json");
  const standings = await json("standings.json");
  const summary = await json("league_summary.json");
  await loadSchema();
  await resetTables();
  await insertTeams(manifest.teams);
  await insertStandings(standings);
  await insertMatches(manifest.teams);
  await insertPlayers();
  await insertFormations(manifest.teams);
  await insertTeamMetrics(manifest.teams);
  await query(
    `insert into league_summary(id, payload) values(true, $1::jsonb)
     on conflict(id) do update set payload = excluded.payload, updated_at = now()`,
    [JSON.stringify(summary)]
  );
  const counts = await query(`
    select
      (select count(*) from teams) as teams,
      (select count(*) from matches) as matches,
      (select count(*) from players) as players,
      (select count(*) from formations) as formations,
      (select count(*) from team_metrics) as team_metrics
  `);
  console.table(counts.rows);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closePool);
