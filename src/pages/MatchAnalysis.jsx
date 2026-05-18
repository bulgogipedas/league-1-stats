import { useMemo, useState } from "react";
import { Line, LineChart as ReLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AIPanel from "../components/ai/AIPanel.jsx";
import DonutChart from "../components/charts/DonutChart.jsx";
import HorizontalBars from "../components/charts/HorizontalBars.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import RadarChart from "../components/charts/RadarChart.jsx";
import DataState from "../components/layout/DataState.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Card from "../components/ui/Card.jsx";
import ComboBox from "../components/ui/ComboBox.jsx";
import SegmentedControl from "../components/ui/SegmentedControl.jsx";
import ChartNote from "../components/ui/ChartNote.jsx";
import { useLeagueData } from "../data/useLeagueData.js";
import { number, resultLabel, resultTone } from "../utils/format.js";

const compareMetrics = ["Passes", "Shots", "Shots on Target", "xG", "Ball Recoveries", "Tackles", "Aerial Duels Won", "Key Passes", "Crosses", "Fouls Committed"];

function MatchContent() {
  const { teams, matches } = useLeagueData();
  const [teamSlug, setTeamSlug] = useState(teams[0]?.slug || "arema");
  const [result, setResult] = useState("All");
  const [venue, setVenue] = useState("All");
  const teamMatches = matches[teamSlug] || [];
  const teamOptions = teams.map((team) => ({ value: team.slug, label: team.name }));
  const filtered = teamMatches.filter((row) => (result === "All" || row.Result === result) && (venue === "All" || row.Venue === venue));
  const [selectedId, setSelectedId] = useState("");
  const selected = filtered.find((row) => row.match_id === selectedId) || filtered[0] || teamMatches[0];
  const opponentSlug = selected ? teams.find((team) => selected.Opponent?.toLowerCase().includes(team.name.split(" ")[0].toLowerCase()))?.slug : null;
  const opponentMatch = opponentSlug ? (matches[opponentSlug] || []).find((row) => String(row.Round) === String(selected.Round)) : null;
  const comparison = compareMetrics.map((metric) => ({ label: metric, left: Number(selected?.[metric] || 0), right: Number(opponentMatch?.[metric] || 0) }));
  const xgSeries = [{ name: selected?.team || "Team", values: teamMatches.map((row) => ({ x: row.round_number, y: row.xG })) }];
  const passTrend = teamMatches.map((row) => ({ round: row.round_number, accuracy: row.pass_accuracy_pct }));
  const radar = selected ? [{
    name: selected.team,
    color: "#0F62FE",
    values: {
      Attacking: Math.min(100, (Number(selected.Shots || 0) + Number(selected.xG || 0) * 8) * 3),
      Passing: selected.pass_accuracy_pct,
      Defensive: Math.min(100, Number(selected.Clearances || 0) + Number(selected.Interceptions || 0) * 4),
      Duels: Math.min(100, Number(selected["Duels Won"] || 0) * 3),
      Discipline: Math.max(0, 100 - Number(selected["Fouls Committed"] || 0) * 5),
      Possession: Math.min(100, Number(selected.Touches || 0) / 5),
    },
  }] : [];
  const resultData = [
    { label: "Wins", value: teamMatches.filter((row) => row.Result === "W").length },
    { label: "Draws", value: teamMatches.filter((row) => row.Result === "D").length },
    { label: "Loses", value: teamMatches.filter((row) => row.Result === "L").length },
  ];

  return (
    <>
      <PageHeader title="Match Analysis" description="Filter fixtures, inspect match-level stats, compare opponent profiles, and generate professional match reports." />
      <Card title="Match Selector" kicker="Filters">
        <div className="grid gap-3 md:grid-cols-3">
          <ComboBox label="Team" value={teamSlug} onChange={setTeamSlug} options={teamOptions} placeholder="Search team" />
          <SegmentedControl label="Result" value={result} onChange={setResult} options={[{ value: "All", label: "All" }, { value: "W", label: "Wins" }, { value: "D", label: "Draws" }, { value: "L", label: "Loses" }]} />
          <SegmentedControl label="Venue" value={venue} onChange={setVenue} options={[{ value: "All", label: "All" }, { value: "Home", label: "Home" }, { value: "Away", label: "Away" }]} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((row) => (
            <button key={row.match_id} type="button" onClick={() => setSelectedId(row.match_id)} className={`min-h-24 border p-3 text-left ${selected?.match_id === row.match_id ? "border-teal bg-white text-text" : "border-border bg-panel"}`}>
              <div className="flex items-center justify-between"><span className="text-sm font-semibold">{row.Score}</span><Badge tone={resultTone(row.Result)}>{resultLabel(row.Result)}</Badge></div>
              <p className="mt-2 text-sm">{row.team} vs {row.Opponent}</p>
              <p className="mt-1 text-xs text-muted">Rating {number(row["Avg Rating"], 2)}, xG {number(row.xG, 2)}</p>
            </button>
          ))}
        </div>
      </Card>

      {selected && (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card title={`${selected.team} vs ${selected.Opponent}`} kicker={`Round ${selected.Round}, ${selected.Date}`}>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted"><Badge tone={resultTone(selected.Result)}>{resultLabel(selected.Result)}</Badge><span>{selected.Score}</span><span>{selected.Venue}</span><span>xG {number(selected.xG, 2)}</span></div>
              <HorizontalBars data={comparison} />
              <ChartNote>Visualization: diverging comparison bars. Team values extend left in blue, opponent values extend right in gray. Hover any bar for exact values.</ChartNote>
            </Card>
            <Card title="Performance radar" kicker="Selected match"><RadarChart axes={["Attacking", "Passing", "Defensive", "Duels", "Discipline", "Possession"]} series={radar} /><ChartNote>Visualization: radar chart, normalized 0 to 100. It is useful for shape, not ranking exact totals.</ChartNote></Card>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Card title="xG timeline" kicker="Season view"><LineChart series={xgSeries} /><ChartNote>Visualization: match-by-match line chart. Hover points for exact xG.</ChartNote></Card>
            <Card title="Passing Accuracy Trend" kicker="Percentage">
              <div className="h-[300px]"><ResponsiveContainer><ReLineChart data={passTrend}><XAxis dataKey="round" stroke="#525252" /><YAxis stroke="#525252" /><Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E0E0E0", color: "#161616" }} /><Line type="monotone" dataKey="accuracy" stroke="#0F62FE" strokeWidth={2} dot /></ReLineChart></ResponsiveContainer></div>
            </Card>
            <Card title="Result Distribution" kicker="Season"><DonutChart data={resultData} /></Card>
          </div>
          <div className="mt-4">
            <AIPanel title="AI Match Report" data={selected} systemPrompt="Analyze this Liga 1 match data and write a professional match report in 3 paragraphs covering attacking, defensive, and overall performance. No emojis, no em dashes." buildPrompt={(data) => `Match stats JSON:\n${JSON.stringify(data)}`} fallback={(data) => `${data.team} recorded a ${resultLabel(data.Result).toLowerCase()} result against ${data.Opponent}, with the score finishing ${data.Score}. Their attacking output was ${number(data.Shots)} shots, ${number(data["Shots on Target"])} on target, and ${number(data.xG, 2)} xG.\n\nOn the ball, ${data.team} completed ${number(data["Acc. Passes"])} of ${number(data.Passes)} passes for ${number(data.pass_accuracy_pct, 1)} percent accuracy. Key progression came through ${number(data["Key Passes"])} key passes and ${number(data.Crosses)} crosses.\n\nDefensively, the team produced ${number(data.Tackles)} tackles, ${number(data.Interceptions)} interceptions, and ${number(data["Ball Recoveries"])} ball recoveries. The overall profile points to a match defined by ${data.Result === "W" ? "control of decisive moments" : data.Result === "D" ? "balanced phases with limited separation" : "defensive pressure and inefficient attacking returns"}.`} />
          </div>
        </>
      )}
    </>
  );
}

export default function MatchAnalysis() {
  return <DataState><MatchContent /></DataState>;
}
