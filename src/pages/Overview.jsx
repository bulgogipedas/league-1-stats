import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AIPanel from "../components/ai/AIPanel.jsx";
import GroupedBarChart from "../components/charts/GroupedBarChart.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import RankTimelineChart from "../components/charts/RankTimelineChart.jsx";
import DataState from "../components/layout/DataState.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Card from "../components/ui/Card.jsx";
import ClubLogo from "../components/ui/ClubLogo.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Tabs from "../components/ui/Tabs.jsx";
import ChartNote from "../components/ui/ChartNote.jsx";
import { useLeagueData } from "../data/useLeagueData.js";
import { number } from "../utils/format.js";

const topTabs = [
  { value: "Goals_total_est", per90: "Goals", label: "Top scorers", digits: 0 },
  { value: "Assists_total_est", per90: "Assists", label: "Top assists", digits: 0 },
  { value: "xG_total_est", per90: "xG", label: "Top xG", digits: 2 },
  { value: "xA_total_est", per90: "xA", label: "Top xA", digits: 2 },
];

function OverviewContent() {
  const { standings, summary, players, matches } = useLeagueData();
  const [sortKey, setSortKey] = useState("Pts");
  const [topMetric, setTopMetric] = useState("Goals_total_est");
  const activeTopTab = topTabs.find((tab) => tab.value === topMetric) || topTabs[0];
  const sortedStandings = useMemo(() => {
    return [...standings].sort((a, b) => (sortKey === "team" ? a.team.localeCompare(b.team) : Number(b[sortKey]) - Number(a[sortKey])));
  }, [standings, sortKey]);
  const topPlayers = useMemo(() => {
    return players
              .filter((player) => Number(player.Min || 0) >= 450)
      .sort((a, b) => Number(b[topMetric] || 0) - Number(a[topMetric] || 0))
      .slice(0, 12);
  }, [players, topMetric]);
  const goalSeries = standings.slice(0, 8).map((team) => {
    let running = 0;
    return {
      name: team.team,
      values: (matches[team.team_slug] || []).map((row) => {
        running += Number(row.goals_for || 0);
        return { x: Number(row.round_number), y: running };
      }),
    };
  });
  const homeAway = standings.map((team) => ({ label: team.team, Home: team.home_win_rate, Away: team.away_win_rate }));
  const rankSeries = useMemo(() => {
    const maxRound = Math.max(...Object.values(matches).flat().map((row) => Number(row.round_number || 0)));
    const watched = standings.slice(0, 8).map((team) => team.team_slug);
    const byRound = [];
    for (let week = 1; week <= maxRound; week += 1) {
      const table = standings.map((team) => {
        const played = matches[team.team_slug]?.filter((row) => Number(row.round_number) <= week) || [];
        const pts = played.reduce((sum, row) => sum + Number(row.points || 0), 0);
        const gf = played.reduce((sum, row) => sum + Number(row.goals_for || 0), 0);
        const ga = played.reduce((sum, row) => sum + Number(row.goals_against || 0), 0);
        return { team: team.team, team_slug: team.team_slug, points: pts, gd: gf - ga, gf };
      }).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
      byRound.push(table.map((row, index) => ({ ...row, week, rank: index + 1 })));
    }
    return standings.filter((team) => watched.includes(team.team_slug)).map((team) => ({
      name: team.team,
      values: byRound.map((table) => table.find((row) => row.team_slug === team.team_slug)).filter(Boolean),
    }));
  }, [matches, standings]);

  return (
    <>
      <PageHeader title="League Overview" description="Standings, team trends, top performers, and league-wide indicators for Liga 1 Indonesia." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total goals" value={number(summary.total_goals)} />
        <StatCard label="Goals per match" value={number(summary.average_goals_per_match, 2)} />
        <StatCard label="Matches played" value={number(summary.total_matches)} />
        <StatCard label="Most prolific" value={summary.most_prolific_team.team} sublabel={`${number(summary.most_prolific_team.GF)} goals`} tone="text-teal" />
        <StatCard label="Best defense" value={summary.best_defense.team} sublabel={`${number(summary.best_defense.GA)} conceded`} tone="text-win" />
        <StatCard label="Highest match xG" value={number(summary.highest_single_match_xg.xG, 2)} sublabel={summary.highest_single_match_xg.team} tone="text-amber" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Standings Table" kicker="League table">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-sm text-muted">
                <tr>{["Pos", "team", "MP", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((key) => <th key={key} className="px-3 py-2"><button type="button" onClick={() => setSortKey(key)}>{key === "team" ? "Club" : key === "W" ? "Wins" : key === "D" ? "Draws" : key === "L" ? "Loses" : key}</button></th>)}<th className="px-3 py-2">Form</th></tr>
              </thead>
              <tbody>
                {sortedStandings.map((row) => (
                  <tr key={row.team_slug} className="border-t border-border">
                    <td className="px-3 py-3 stat-number">{row.Pos}</td>
                    <td className="px-3 py-3">
                      <Link to={`/teams?team=${row.team_slug}`} className="inline-flex items-center gap-2 font-semibold hover:text-teal">
                        <ClubLogo slug={row.team_slug} name={row.team} size="sm" />
                        {row.team}
                      </Link>
                    </td>
                    {["MP", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((key) => <td key={key} className="px-3 py-3 stat-number">{number(row[key])}</td>)}
                    <td className="px-3 py-3"><div className="flex gap-1">{row.form.map((r, i) => <span key={`${r}-${i}`} className={`h-2.5 w-2.5 rounded-full ${r === "W" ? "bg-win" : r === "L" ? "bg-loss" : "bg-draw"}`} />)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Top performers" kicker="Estimated season totals from per-90 source, minimum 450 minutes" action={<Tabs tabs={topTabs} active={topMetric} onChange={setTopMetric} />}>
          <div className="space-y-2">
            {topPlayers.map((player, index) => (
              <div key={`${player.Player}-${player.Team}`} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 border border-border bg-panel px-3 py-2">
                <span className="stat-number text-muted">{index + 1}</span>
                <span>
                  <span className="block text-sm font-semibold">{player.Player}</span>
                  <span className="text-xs text-muted">
                    <Link to={`/teams?team=${standings.find((team) => team.team === player.Team)?.team_slug || ""}`} className="hover:text-teal">{player.Team}</Link>, {player.position_label}, per 90: {number(player[activeTopTab.per90], 2)}
                  </span>
                </span>
                <Badge tone="teal">{number(player[topMetric], activeTopTab.digits)}</Badge>
              </div>
            ))}
          </div>
          <ChartNote>Audit note: player source file is per-90. Counting leaderboards display estimated totals: per90 multiplied by minutes divided by 90. Assists and goals are rounded to whole numbers.</ChartNote>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title="Goals timeline" kicker="Cumulative goals, top eight">
          <LineChart series={goalSeries} />
          <ChartNote>Visualization: multi-series cumulative line chart. Hover each point for team, week, and cumulative goals.</ChartNote>
        </Card>
        <Card title="Home vs away performance" kicker="Grouped bar chart, win rate">
          <GroupedBarChart data={homeAway} keys={["Home", "Away"]} colors={["#0F62FE", "#8D8D8D"]} />
          <ChartNote>Visualization: grouped categorical bar chart. This compares venue splits by team, not total points.</ChartNote>
        </Card>
      </div>
      <div className="mt-4">
        <Card title="Table Rank Timeline" kicker="Top eight current teams, week 1 to latest data">
          <RankTimelineChart series={rankSeries} />
          <ChartNote>Visualization: bump chart. Rank 1 is intentionally placed at the top, so upward movement means improving league position.</ChartNote>
        </Card>
      </div>
      <div className="mt-4">
        <AIPanel
          title="AI Analysis, powered by Qwen via Hugging Face"
          data={standings}
          systemPrompt="You are a professional football analyst covering Liga 1 Indonesia. Provide concise, data-driven analysis in 3-4 paragraphs. Do not use emojis or em dashes."
          buildPrompt={(data) => `Analyze the current Liga 1 standings data as JSON:\n${JSON.stringify(data.slice(0, 18))}`}
          fallback={(data) => {
            const leader = data[0];
            const bestAttack = [...data].sort((a, b) => b.GF - a.GF)[0];
            const bestDefense = [...data].sort((a, b) => a.GA - b.GA)[0];
            return `${leader.team} lead the table with ${leader.Pts} points from ${leader.MP} matches, built on a goal difference of ${leader.GD}. The corrected scoring table now has ${bestAttack.team} as the most productive attack with ${bestAttack.GF} goals, while ${bestDefense.team} own the strongest defensive record with only ${bestDefense.GA} conceded.\n\nThe title picture is tight at the top because the first two teams are separated by ${leader.Pts - data[1].Pts} point. Home and away splits show which teams are genuinely sustainable rather than only strong in one venue.\n\nUse the rank timeline to see when teams actually reached the top positions. It gives better context than a static table because early leaders, mid-season surges, and late collapses are visible week by week.`;
          }}
        />
      </div>
    </>
  );
}

export default function Overview() {
  return <DataState><OverviewContent /></DataState>;
}
