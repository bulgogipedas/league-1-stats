import { pool, query } from "./db.js";

const port = Number(process.env.PORT || 8787);

function ok(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

function raw(row) {
  return row.raw || row;
}

async function bootstrap() {
  const [teams, standings, summary, players, playerPerformance, matches, formations, teamMetrics] = await Promise.all([
    query("select slug, name from teams order by name"),
    query("select raw from standings order by position"),
    query("select payload from league_summary where id = true"),
    query("select raw from players order by minutes desc nulls last"),
    query("select raw from players order by minutes desc nulls last"),
    query("select team_slug, raw from matches order by team_slug, round_number"),
    query("select team_slug, raw from formations order by team_slug, round_number"),
    query("select team_slug, raw from team_metrics order by team_slug, metric"),
  ]);

  const groupByTeam = (rows) => rows.reduce((acc, row) => {
    acc[row.team_slug] ||= [];
    acc[row.team_slug].push(raw(row));
    return acc;
  }, {});

  return {
    teams: teams.rows,
    standings: standings.rows.map(raw),
    summary: summary.rows[0]?.payload || {},
    players: players.rows.map(raw),
    playerPerformance: playerPerformance.rows.map(raw),
    matches: groupByTeam(matches.rows),
    formations: groupByTeam(formations.rows),
    teamAnalysis: groupByTeam(teamMetrics.rows),
    source: "postgres",
  };
}

async function route(request) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return ok({});
  try {
    if (url.pathname === "/api/health") {
      const ping = await query("select now() as now");
      return ok({ ok: true, database: "postgres", now: ping.rows[0].now });
    }
    if (url.pathname === "/api/bootstrap") return ok(await bootstrap());
    if (url.pathname === "/api/standings") {
      const result = await query("select raw from standings order by position");
      return ok(result.rows.map(raw));
    }
    if (url.pathname === "/api/players") {
      const limit = Math.min(Number(url.searchParams.get("limit") || 200), 1000);
      const result = await query("select raw from players order by minutes desc nulls last limit $1", [limit]);
      return ok(result.rows.map(raw));
    }
    if (url.pathname.startsWith("/api/teams/")) {
      const [, , , slug, child] = url.pathname.split("/");
      if (child === "matches") {
        const result = await query("select raw from matches where team_slug = $1 order by round_number", [slug]);
        return ok(result.rows.map(raw));
      }
      if (child === "formations") {
        const result = await query("select raw from formations where team_slug = $1 order by round_number", [slug]);
        return ok(result.rows.map(raw));
      }
      const result = await query("select * from team_season_summary where slug = $1", [slug]);
      return ok(result.rows[0] || null);
    }
    return ok({ error: "Not found" }, 404);
  } catch (error) {
    console.error(error);
    return ok({ error: error.message }, 500);
  }
}

Bun.serve({ port, fetch: route });

console.log(`Liga 1 API running on http://127.0.0.1:${port}`);

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
