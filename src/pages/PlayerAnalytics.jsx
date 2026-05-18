import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AIPanel from "../components/ai/AIPanel.jsx";
import RadarChart from "../components/charts/RadarChart.jsx";
import DataState from "../components/layout/DataState.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Card from "../components/ui/Card.jsx";
import ComboBox from "../components/ui/ComboBox.jsx";
import ChartNote from "../components/ui/ChartNote.jsx";
import { useLeagueData } from "../data/useLeagueData.js";
import { number, positionLabel } from "../utils/format.js";
import { percentileRank } from "../utils/percentileRank.js";

const sortOptions = ["Overall", "Goals", "xG", "expected_assists", "Tackles", "Key Passes"];
const axes = ["Overall", "Distribution", "Duels", "Shooting", "Defensive", "Discipline", "Possession & Control"];
const metricsByPos = {
  F: ["Goals", "xG", "Shots on Target", "Key Passes", "expected_assists", "Contests Won", "Big Chances Missed"],
  M: ["Key Passes", "expected_assists", "Passes", "pass_accuracy_pct", "Ball Recoveries", "Tackles", "Fouls Drawn"],
  D: ["Clearances", "Interceptions", "Aerial Duels Won", "Tackles Won", "Ball Recoveries", "Duels Won", "Passes"],
  G: ["Saves", "Sweeper Actions", "Acc. Sweeper Actions", "High Claims"],
};

function similarityScore(a, b, metrics) {
  return metrics.reduce((total, metric) => {
    const av = Number(a?.[metric] || 0);
    const bv = Number(b?.[metric] || 0);
    const scale = Math.max(Math.abs(av), Math.abs(bv), 1);
    return total + Math.abs(av - bv) / scale;
  }, 0);
}

function PlayerContent() {
  const { players, teams } = useLeagueData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("All");
  const [pos, setPos] = useState("All");
  const [minutes, setMinutes] = useState(450);
  const [sortBy, setSortBy] = useState("Overall");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [compareKey, setCompareKey] = useState("");
  const filtered = useMemo(() => players.filter((player) =>
    player.Player.toLowerCase().includes(query.toLowerCase()) &&
    (team === "All" || player.Team === team) &&
    (pos === "All" || player.Pos === pos) &&
    Number(player.Min || 0) >= minutes
  ).sort((a, b) => Number(b[sortBy] || 0) - Number(a[sortBy] || 0)), [players, query, team, pos, minutes, sortBy]);
  const pageRows = filtered.slice((page - 1) * 20, page * 20);
  const active = selected || pageRows[0];
  const compare = players.find((player) => `${player.Player}|${player.Team}` === compareKey);
  const samePos = players.filter((player) => player.Pos === active?.Pos);
  const radarSeries = active ? [
    { name: active.Player, color: "#0F62FE", values: Object.fromEntries(axes.map((axis) => [axis, Number(active[axis] || 0)])) },
    ...(compare ? [{ name: compare.Player, color: "#8D8D8D", values: Object.fromEntries(axes.map((axis) => [axis, Number(compare[axis] || 0)])) }] : []),
  ] : [];
  const metricList = metricsByPos[active?.Pos] || metricsByPos.M;
  const comparisonMetrics = [...new Set(["Min", "MP", "Overall", ...axes, ...metricList])];
  const recommendedComparisons = active ? players
    .filter((player) => player.Pos === active.Pos && `${player.Player}|${player.Team}` !== `${active.Player}|${active.Team}` && Number(player.Min || 0) >= 450)
    .map((player) => ({
      player,
      score: similarityScore(active, player, ["Overall", "Min", ...metricList.slice(0, 5)]),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 6) : [];
  const teamOptions = [{ value: "All", label: "All teams" }, ...teams.map((item) => ({ value: item.name, label: item.name }))];
  const compareOptions = players
    .filter((p) => p.Pos === active?.Pos && p.Player !== active?.Player)
    .map((p) => ({ value: `${p.Player}|${p.Team}`, label: p.Player, meta: `${p.Team}, ${number(p.Min)} minutes, overall ${number(p.Overall, 1)}` }));
  const comparisonSummary = compare ? [
    { label: "Overall gap", value: number(Number(active.Overall || 0) - Number(compare.Overall || 0), 1), tone: Number(active.Overall || 0) >= Number(compare.Overall || 0) ? "text-teal" : "text-loss" },
    { label: "Minutes gap", value: number(Number(active.Min || 0) - Number(compare.Min || 0)), tone: "text-text" },
    { label: "Role metric edge", value: `${metricList.filter((metric) => Number(active[metric] || 0) > Number(compare[metric] || 0)).length}/${metricList.length}`, tone: "text-teal" },
    { label: "Same-position sample", value: number(samePos.length), tone: "text-text" },
  ] : [
    { label: "Overall", value: number(active?.Overall || 0, 1), tone: "text-teal" },
    { label: "Minutes", value: number(active?.Min || 0), tone: "text-text" },
    { label: "Role metrics", value: number(metricList.length), tone: "text-text" },
    { label: "Position sample", value: number(samePos.length), tone: "text-text" },
  ];

  useEffect(() => {
    if (compare && compare.Pos !== active?.Pos) setCompareKey("");
  }, [active?.Player, active?.Team, active?.Pos, compare?.Pos]);

  useEffect(() => {
    const playerName = searchParams.get("player");
    const teamName = searchParams.get("team");
    if (!playerName) return;
    const routedPlayer = players.find((player) => player.Player === playerName && (!teamName || player.Team === teamName));
    if (routedPlayer) {
      setSelected(routedPlayer);
      setQuery(playerName);
    }
  }, [players, searchParams]);

  function choosePlayer(player) {
    setSelected(player);
    setSearchParams({ player: player.Player, team: player.Team });
  }

  return (
    <>
      <PageHeader title="Player Analytics" description="Search, filter, rank, profile, and compare Liga 1 players by performance scores and per 90 production." />
      <Card title="Player Search and Filter" kicker="Controls">
        <div className="grid gap-3 lg:grid-cols-6">
          <label className="lg:col-span-2"><span className="mb-1 block text-xs text-muted">Player search</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a player name" className="min-h-12 w-full border border-border bg-panel px-3 py-2 text-sm" aria-label="Search player" /></label>
          <ComboBox label="Team" value={team} onChange={setTeam} options={teamOptions} placeholder="Search team" />
          <ComboBox label="Position" value={pos} onChange={setPos} options={[{ value: "All", label: "All positions" }, { value: "G", label: "Goalkeepers" }, { value: "D", label: "Defenders" }, { value: "M", label: "Midfielders" }, { value: "F", label: "Forwards" }]} placeholder="Search position" />
          <ComboBox label="Sort metric" value={sortBy} onChange={setSortBy} options={sortOptions.map((item) => ({ value: item, label: item }))} placeholder="Search metric" />
          <label className="text-xs text-muted">Min minutes: {minutes}<input type="range" min="0" max="2700" step="90" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-2 w-full" /></label>
        </div>
      </Card>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card title="Player Rankings" kicker={`${filtered.length} players`}>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[680px] text-sm sm:min-w-[760px]">
              <thead className="text-left text-sm text-muted"><tr>{["Rank", "Player", "Team", "Pos", "Min", "MP", "Overall", sortBy].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
              <tbody>{pageRows.map((player, index) => {
                const isActive = active?.Player === player.Player && active?.Team === player.Team;
                return <tr key={`${player.Player}-${player.Team}`} onClick={() => choosePlayer(player)} className={`cursor-pointer border-t border-border hover:bg-panel ${isActive ? "bg-panel" : ""}`}><td className="px-3 py-3 stat-number">{(page - 1) * 20 + index + 1}</td><td className="px-3 py-3 font-semibold">{player.Player}</td><td className="px-3 py-3">{player.Team}</td><td className="px-3 py-3">{positionLabel(player.Pos)}</td><td className="px-3 py-3 stat-number">{number(player.Min)}</td><td className="px-3 py-3 stat-number">{number(player.MP)}</td><td className="px-3 py-3 stat-number">{number(player.Overall, 1)}</td><td className="px-3 py-3 stat-number">{number(player[sortBy], 2)}</td></tr>;
              })}</tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setPage(Math.max(1, page - 1))} className="min-h-12 border border-border px-4 py-3 text-sm">Prev</button><button type="button" onClick={() => setPage(page + 1)} className="min-h-12 border border-border px-4 py-3 text-sm">Next</button></div>
        </Card>
        {active && (
          <Card title={active.Player} kicker={`${active.Team}, ${positionLabel(active.Pos)}`} action={<Badge tone="teal">Overall {number(active.Overall, 1)}</Badge>}>
            <div className="grid gap-3 text-sm sm:grid-cols-3"><span>Minutes: <b className="stat-number">{number(active.Min)}</b></span><span>Matches: <b className="stat-number">{number(active.MP)}</b></span><span>Position: <b>{positionLabel(active.Pos)}</b></span></div>
            <div className="mt-4"><ComboBox label="Compare player" value={compareKey} onChange={setCompareKey} options={[{ value: "", label: "No comparison selected" }, ...compareOptions]} placeholder="Search same-position player" /></div>
            {recommendedComparisons.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Recommended comparisons</p>
                  <p className="text-xs text-muted">Same position, similar role profile</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {recommendedComparisons.map(({ player, score }) => {
                    const key = `${player.Player}|${player.Team}`;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCompareKey(key)}
                        className={`border p-3 text-left text-sm transition hover:border-teal hover:bg-panel ${compareKey === key ? "border-teal bg-panel" : "border-border bg-white"}`}
                      >
                        <span className="block font-semibold">{player.Player}</span>
                        <span className="block text-xs text-muted">{player.Team}, {number(player.Min)} minutes</span>
                        <span className="mt-2 block text-xs text-muted">Similarity score: <b className="stat-number text-text">{number(100 - Math.min(99, score * 18), 0)}</b></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {comparisonSummary.map((item) => (
                <div key={item.label} className="border border-border bg-panel p-3">
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className={`stat-number mt-2 text-xl font-light ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <RadarChart axes={axes} series={radarSeries} />
            <ChartNote>Visualization: radar chart for seven normalized performance scores. Hover vertices for exact values, then use the comparison table below for precise scouting decisions.</ChartNote>
            <div className="space-y-2">{metricList.map((metric) => {
              const pct = percentileRank(samePos, active[metric], metric);
              const comparePct = compare ? percentileRank(samePos, compare[metric], metric) : null;
              return (
                <div key={metric}>
                  <div className="mb-1 flex justify-between text-xs"><span>{metric}</span><span className="stat-number">{pct} percentile{comparePct !== null ? ` vs ${comparePct}` : ""}</span></div>
                  <div className="relative h-3 rounded bg-panel">
                    <div className="absolute left-0 top-0 h-3 rounded bg-teal" style={{ width: `${pct}%` }} title={`${active.Player}: ${number(active[metric], 2)}, ${pct} percentile`} />
                    {comparePct !== null && <div className="absolute top-0 h-3 w-1 rounded bg-amber" style={{ left: `${comparePct}%` }} title={`${compare.Player}: ${number(compare[metric], 2)}, ${comparePct} percentile`} />}
                  </div>
                </div>
              );
            })}</div>
            {compare && (
              <div className="-mx-4 mt-4 overflow-x-auto border border-border px-4 sm:mx-0 sm:px-0">
                <div className="border-b border-border bg-panel px-3 py-2">
                  <p className="text-sm font-semibold">Comparison board</p>
                  <p className="text-xs text-muted">Exact values, role metrics, and the current edge for each stat.</p>
                </div>
                <table className="w-full min-w-[520px] text-sm sm:min-w-[560px]">
                  <thead className="bg-panel text-left text-sm text-muted"><tr><th className="px-3 py-2">Metric</th><th className="px-3 py-2">{active.Player}</th><th className="px-3 py-2">{compare.Player}</th><th className="px-3 py-2">Edge</th></tr></thead>
                  <tbody>
                    {comparisonMetrics.map((metric) => {
                      const av = Number(active[metric] || 0);
                      const bv = Number(compare[metric] || 0);
                      return <tr key={metric} className="border-t border-border"><td className="px-3 py-2 text-muted">{metric}</td><td className="px-3 py-2 stat-number">{number(av, 2)}</td><td className="px-3 py-2 stat-number">{number(bv, 2)}</td><td className="px-3 py-2">{av === bv ? "Even" : av > bv ? active.Player : compare.Player}</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">{Object.entries(active).filter(([, v]) => typeof v === "number").slice(0, 24).map(([k, v]) => <div key={k} className="flex justify-between rounded border border-border bg-panel px-2 py-1"><span className="text-muted">{k}</span><span className="stat-number">{number(v, 2)}</span></div>)}</div>
          </Card>
        )}
      </div>
      {active && <div className="mt-4"><AIPanel title="AI Player Scout Report" data={{ player: active, compare }} systemPrompt="You are a professional football scout analyzing a Liga 1 Indonesia player. Write a scout report in 3 paragraphs: strengths, weaknesses, and overall assessment. Be specific about the numbers. No emojis, no em dashes." buildPrompt={(data) => `Player comparison JSON:\n${JSON.stringify(data)}`} fallback={(data) => {
        const p = data.player;
        const c = data.compare;
        if (!c) return `${p.Player} profiles as a ${positionLabel(p.Pos).toLowerCase()} for ${p.Team}, with ${number(p.Min)} minutes and an overall score of ${number(p.Overall, 1)}. His strongest visible indicators are ${metricList.map((metric) => `${metric}: ${number(p[metric], 2)}`).slice(0, 4).join(", ")}.\n\nThe production profile should be read in position context. Percentile bars compare him only with Liga 1 players in the same role, so the output is more meaningful than a raw league-wide ranking.\n\nSelect a comparison player to convert this into a direct scout comparison with exact values and metric edges.`;
        return `${p.Player} and ${c.Player} are compared in the same positional group, so the radar and percentile bars are role-adjusted. ${p.Player} has an overall score of ${number(p.Overall, 1)} across ${number(p.Min)} minutes, while ${c.Player} has ${number(c.Overall, 1)} across ${number(c.Min)} minutes.\n\nThe direct comparison table shows the exact edge by metric. In the key role metrics, ${metricList.map((metric) => `${metric}: ${number(p[metric], 2)} vs ${number(c[metric], 2)}`).slice(0, 5).join(", ")}.\n\nFor recruitment use, prioritize the metrics that match the tactical job. The better player is not only the higher overall score, but the one whose strongest edges fit the required role.`;
      }} /></div>}
    </>
  );
}

export default function PlayerAnalytics() {
  return <DataState><PlayerContent /></DataState>;
}
