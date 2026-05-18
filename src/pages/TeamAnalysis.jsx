import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Line, LineChart as ReLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AIPanel from "../components/ai/AIPanel.jsx";
import GroupedBarChart from "../components/charts/GroupedBarChart.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import ScatterPlot from "../components/charts/ScatterPlot.jsx";
import DataState from "../components/layout/DataState.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Card from "../components/ui/Card.jsx";
import ClubLogo from "../components/ui/ClubLogo.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import ChartNote from "../components/ui/ChartNote.jsx";
import { useLeagueData } from "../data/useLeagueData.js";
import { average, sum } from "../utils/normalizeStats.js";
import { number, resultTone } from "../utils/format.js";

function splitAverage(rows, venue, key) {
  return average(rows.filter((row) => row.Venue === venue), key);
}

function playerLink(player) {
  return `/players?player=${encodeURIComponent(player.Player)}&team=${encodeURIComponent(player.Team)}`;
}

function bestByPosition(squad, pos, count) {
  return squad
    .filter((player) => player.Pos === pos)
    .sort((a, b) => (Number(b.Overall || 0) * 1000 + Number(b.Min || 0)) - (Number(a.Overall || 0) * 1000 + Number(a.Min || 0)))
    .slice(0, count);
}

function TeamContent() {
  const { teams, standings, matches, players } = useLeagueData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teamSlug, setTeamSlug] = useState(teams[0]?.slug || "arema");
  const selectedTeam = teams.find((team) => team.slug === teamSlug);
  const rows = matches[teamSlug] || [];
  const standing = standings.find((item) => item.team_slug === teamSlug) || {};
  const trendData = rows.map((row) => ({ round: row.round_number, rating: row["Avg Rating"], xG: row.xG, passes: row.Passes, recoveries: row["Ball Recoveries"] }));
  const goals = rows.map((row) => ({ label: `R${row.Round}`, Scored: row.goals_for, Conceded: row.goals_against }));
  const homeAway = ["Passes", "Shots", "xG", "Tackles", "Ball Recoveries"].map((metric) => ({ label: metric, Home: splitAverage(rows, "Home", metric), Away: splitAverage(rows, "Away", metric) }));
  const passRatio = rows.map((row) => ({ x: row.round_number, y: Number(row["Opp Half Passes"] || 0) - Number(row["Own Half Passes"] || 0) }));
  const squad = players.filter((player) => player.Team === selectedTeam?.name).sort((a, b) => Number(b.Min || 0) - Number(a.Min || 0));
  const bestXI = [
    ...bestByPosition(squad, "G", 1),
    ...bestByPosition(squad, "D", 4),
    ...bestByPosition(squad, "M", 3),
    ...bestByPosition(squad, "F", 3),
  ].slice(0, 11);
  const leaders = [
    { label: "Top scorer", player: [...squad].sort((a, b) => Number(b.Goals_total_est || b.Goals || 0) - Number(a.Goals_total_est || a.Goals || 0))[0], metric: "Goals_total_est", fallback: "Goals", digits: 0 },
    { label: "Top assist", player: [...squad].sort((a, b) => Number(b.Assists_total_est || b.Assists || b.expected_assists || 0) - Number(a.Assists_total_est || a.Assists || a.expected_assists || 0))[0], metric: "Assists_total_est", fallback: "expected_assists", digits: 0 },
    { label: "Most minutes", player: squad[0], metric: "Min", digits: 0 },
    { label: "Best overall", player: [...squad].sort((a, b) => Number(b.Overall || 0) - Number(a.Overall || 0))[0], metric: "Overall", digits: 1 },
  ];

  useEffect(() => {
    const routedTeam = searchParams.get("team");
    if (routedTeam && teams.some((team) => team.slug === routedTeam)) setTeamSlug(routedTeam);
  }, [searchParams, teams]);

  function chooseTeam(slug) {
    setTeamSlug(slug);
    setSearchParams({ team: slug });
  }

  return (
    <>
      <PageHeader title="Team Analysis" description="Season summaries, team profiles, trends, squad usage, and playing style indicators." />
      <Card title="Team Selector" kicker="18 clubs">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          {teams.map((team) => <button key={team.slug} type="button" onClick={() => chooseTeam(team.slug)} className={`flex min-h-12 items-center gap-2 border px-3 py-3 text-left text-sm ${teamSlug === team.slug ? "border-teal bg-card text-teal" : "border-border bg-panel text-text"}`}><ClubLogo slug={team.slug} name={team.name} size="sm" />{team.name}</button>)}
        </div>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Matches" value={number(standing.MP)} />
        <StatCard label="Wins" value={number(standing.W)} tone="text-win" />
        <StatCard label="Draws" value={number(standing.D)} tone="text-draw" />
        <StatCard label="Losses" value={number(standing.L)} tone="text-loss" />
        <StatCard label="Goals" value={number(standing.GF)} />
        <StatCard label="Conceded" value={number(standing.GA)} />
        <StatCard label="Avg xG" value={number(average(rows, "xG"), 2)} tone="text-amber" />
        <StatCard label="Avg rating" value={number(average(rows, "Avg Rating"), 2)} />
      </div>
      <Card title="Form Guide" kicker="All rounds" className="mt-4">
        <div className="flex flex-wrap gap-1.5">{rows.map((row) => <Badge key={row.match_id} tone={resultTone(row.Result)}>R{row.Round}: {row.Result === "W" ? "Wins" : row.Result === "D" ? "Draws" : "Loses"}</Badge>)}</div>
      </Card>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Card title="Team leaders" kicker="Player contribution snapshot">
          <div className="grid gap-2 sm:grid-cols-2">
            {leaders.map((item) => item.player && (
              <Link key={item.label} to={playerLink(item.player)} className="border border-border bg-panel p-3 hover:border-teal hover:bg-card">
                <p className="text-xs text-muted">{item.label}</p>
                <p className="mt-1 font-semibold">{item.player.Player}</p>
                <p className="text-xs text-muted">{item.player.position_label}, {item.player.Team}</p>
                <p className="stat-number mt-2 text-xl font-light text-teal">{number(item.player[item.metric] ?? item.player[item.fallback] ?? 0, item.digits)}</p>
              </Link>
            ))}
          </div>
        </Card>
        <Card title="Best XI" kicker="Highest rated role balance">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {bestXI.map((player, index) => (
              <Link key={`${player.Player}-${player.Team}`} to={playerLink(player)} className="flex items-center justify-between border border-border bg-panel p-3 text-sm hover:border-teal hover:bg-card">
                <span>
                  <span className="block font-semibold">{index + 1}. {player.Player}</span>
                  <span className="block text-xs text-muted">{player.position_label}, {number(player.Min)} minutes</span>
                </span>
                <span className="stat-number text-teal">{number(player.Overall, 1)}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title="Goals scored vs conceded" kicker="Grouped bar chart, by matchweek"><GroupedBarChart data={goals} keys={["Scored", "Conceded"]} /><ChartNote>Visualization: grouped bars. Hover to inspect exact goals scored and conceded per round.</ChartNote></Card>
        <Card title="Home vs away split" kicker="Grouped bar chart, per match averages"><GroupedBarChart data={homeAway} keys={["Home", "Away"]} /><ChartNote>Visualization: venue split comparison. It shows mean outputs, not totals.</ChartNote></Card>
        <Card title="Attacking profile" kicker="Scatter plot, xG and goals per match"><ScatterPlot data={standings} xKey="xg_per_match" yKey="goals_per_match" selected={teamSlug} /><ChartNote>Visualization: scatter plot. Right side means higher xG rate, top side means higher scoring rate.</ChartNote></Card>
        <Card title="Defensive Profile" kicker="Tackles and interceptions">
          <ScatterPlot data={standings.map((team) => ({ ...team, tackles: average(matches[team.team_slug] || [], "Tackles"), interceptions: average(matches[team.team_slug] || [], "Interceptions") }))} xKey="tackles" yKey="interceptions" selected={teamSlug} />
          <ChartNote>Visualization: defensive action scatter. More actions can mean either pressing activity or more time defending.</ChartNote>
        </Card>
        <Card title="Pass network summary" kicker="Opposition half minus own half passes"><LineChart series={[{ name: selectedTeam?.name, values: passRatio }]} /><ChartNote>Visualization: pass-territory proxy. Positive values suggest more forward-half passing.</ChartNote></Card>
        <Card title="Season Trend Lines" kicker="Rating, xG, passes, recoveries">
          <div className="h-[320px]"><ResponsiveContainer><ReLineChart data={trendData}><XAxis dataKey="round" stroke="var(--text-secondary)" /><YAxis stroke="var(--text-secondary)" /><Tooltip contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--border)", color: "var(--chart-tooltip-text)" }} /><Line dataKey="rating" stroke="var(--chart-blue)" dot={false} /><Line dataKey="xG" stroke="var(--chart-blue-strong)" dot={false} /><Line dataKey="passes" stroke="var(--chart-neutral)" dot={false} /><Line dataKey="recoveries" stroke="var(--win)" dot={false} /></ReLineChart></ResponsiveContainer></div>
        </Card>
      </div>
      <Card title="Squad List" kicker={`${squad.length} players`} className="mt-4">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">{squad.map((player) => <Link to={playerLink(player)} key={`${player.Player}-${player.Team}`} className="border border-border bg-panel p-3 hover:border-teal hover:bg-card"><p className="font-semibold">{player.Player}</p><p className="text-xs text-muted">{player.position_label}, {number(player.Min)} minutes, overall {number(player.Overall, 1)}</p></Link>)}</div>
      </Card>
      <div className="mt-4"><AIPanel title="AI Team Analysis" data={{ team: selectedTeam?.name, standing, form: rows.map((row) => row.Result), homeAway, totals: { goals: sum(rows, "goals_for"), xG: sum(rows, "xG") } }} systemPrompt="Analyze this Liga 1 team's season performance across all statistical dimensions. Write 4 paragraphs covering: attacking output, defensive solidity, playing style, and season assessment. No emojis, no em dashes." buildPrompt={(data) => `Team season data JSON:\n${JSON.stringify(data)}`} fallback={(data) => `${data.team} sit on ${number(data.standing.Pts)} points with a ${number(data.standing.W)} win, ${number(data.standing.D)} draw, ${number(data.standing.L)} loss record. Their goal balance is ${number(data.standing.GF)} scored and ${number(data.standing.GA)} conceded, producing a goal difference of ${number(data.standing.GD)}.\n\nThe attacking profile is ${number(data.totals.goals)} total goals from ${number(data.totals.xG, 2)} cumulative xG in the available data. The home and away split chart shows whether their output is venue-dependent across passes, shots, xG, tackles, and recoveries.\n\nDefensively, the table rank and conceded total give the high-level picture, while the defensive scatter adds context through tackles and interceptions. The form strip is the quickest way to read momentum and volatility across the season.\n\nOverall, this team profile should be read through both results and style indicators. A strong points total with weak process metrics suggests finishing or game-state effects, while stable trend lines usually point to repeatable performance.`} /></div>
    </>
  );
}

export default function TeamAnalysis() {
  return <DataState><TeamContent /></DataState>;
}
