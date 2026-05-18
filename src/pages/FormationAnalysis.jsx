import { useMemo, useState } from "react";
import AIPanel from "../components/ai/AIPanel.jsx";
import GroupedBarChart from "../components/charts/GroupedBarChart.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import PitchViz from "../components/charts/PitchViz.jsx";
import DataState from "../components/layout/DataState.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import ComboBox from "../components/ui/ComboBox.jsx";
import ChartNote from "../components/ui/ChartNote.jsx";
import { useLeagueData } from "../data/useLeagueData.js";
import { average, sum } from "../utils/normalizeStats.js";
import { number } from "../utils/format.js";

function FormationContent() {
  const { teams, formations, matches, players } = useLeagueData();
  const [teamSlug, setTeamSlug] = useState(teams[0]?.slug || "arema");
  const [matchKey, setMatchKey] = useState("season");
  const selectedTeam = teams.find((team) => team.slug === teamSlug);
  const teamFormations = formations[teamSlug] || [];
  const teamMatches = matches[teamSlug] || [];
  const selectedMatch = matchKey === "season" ? null : teamFormations.find((row) => String(row.Rd) === matchKey);
  const formation = selectedMatch?.Formation || Object.entries(teamFormations.reduce((acc, row) => ({ ...acc, [row.Formation]: (acc[row.Formation] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0]?.[0] || "4-3-3";
  const squad = players.filter((player) => player.Team === selectedTeam?.name).sort((a, b) => Number(b.Min || 0) - Number(a.Min || 0)).slice(0, 11);
  const frequency = useMemo(() => Object.entries(teamFormations.reduce((acc, row) => { acc[row.Formation] = (acc[row.Formation] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]), [teamFormations]);
  const formationOutcomes = useMemo(() => Object.values(teamFormations.reduce((acc, row) => {
    const name = row.Formation || "Unknown";
    const match = teamMatches.find((item) => String(item.Round) === String(row.Rd));
    const result = row.Result || match?.Result || "D";
    if (!acc[name]) acc[name] = { formation: name, matches: 0, W: 0, D: 0, L: 0, goalsFor: 0, goalsAgainst: 0, xG: 0 };
    acc[name].matches += 1;
    acc[name][result] = (acc[name][result] || 0) + 1;
    acc[name].goalsFor += Number(match?.goals_for || row.goals_for || 0);
    acc[name].goalsAgainst += Number(match?.goals_against || row.goals_against || 0);
    acc[name].xG += Number(match?.xG || row.xG || 0);
    return acc;
  }, {})).map((row) => ({
    ...row,
    winRate: row.matches ? (row.W / row.matches) * 100 : 0,
    xGPerMatch: row.matches ? row.xG / row.matches : 0,
  })).sort((a, b) => b.matches - a.matches || b.winRate - a.winRate), [teamFormations, teamMatches]);
  const attackDirection = [
    { label: "Left", Value: Math.round(average(teamMatches, "Crosses") * 0.42) },
    { label: "Center", Value: Math.round(average(teamMatches, "Opp Half Passes") * 0.18) },
    { label: "Right", Value: Math.round(average(teamMatches, "Crosses") * 0.39) },
  ];
  const pressing = [{ name: "PPDA proxy", values: teamMatches.map((row) => ({ x: row.round_number, y: Number(row.Tackles || 0) + Number(row.Interceptions || 0) })) }];
  const crosses = [{ name: "Crosses", values: teamMatches.map((row) => ({ x: row.round_number, y: row.Crosses })) }, { name: "Accurate crosses", values: teamMatches.map((row) => ({ x: row.round_number, y: row["Acc. Crosses"] })) }];
  const setPieces = { cornersProxy: Math.round(sum(teamMatches, "Crosses") * 0.18), penaltiesWon: sum(teamMatches, "Pen. Won"), penaltiesConceded: sum(teamMatches, "Pen. Conceded"), ownGoals: sum(teamMatches, "Own Goals") };
  const teamOptions = teams.map((team) => ({ value: team.slug, label: team.name }));
  const matchOptions = [{ value: "season", label: "Season average" }, ...teamFormations.map((row) => ({ value: String(row.Rd), label: `Round ${row.Rd}`, meta: `${row.Score}, ${row.Formation}` }))];

  return (
    <>
      <PageHeader title="Formation Analysis" description="Formation usage, tactical tendencies, pressing proxy, crossing trends, and pitch visualisation." />
      <Card title="Team and Match Selector" kicker="Tactical context">
        <div className="grid gap-3 md:grid-cols-2">
          <ComboBox label="Team" value={teamSlug} onChange={setTeamSlug} options={teamOptions} placeholder="Search team" />
          <ComboBox label="Match" value={matchKey} onChange={setMatchKey} options={matchOptions} placeholder="Search round or formation" />
        </div>
      </Card>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Formation visualizer" kicker={`Shape: ${formation}`}><PitchViz formation={formation} players={squad} /><ChartNote>Visualization: pitch map proxy. Player locations are estimated from formation slots, not tracking data.</ChartNote></Card>
        <Card title="Formation Frequency" kicker="Season usage">
          <div className="space-y-2">{frequency.map(([name, value]) => {
            const outcome = formationOutcomes.find((item) => item.formation === name);
            return (
              <div key={name} className="border border-border bg-panel p-3">
                <div className="flex items-center justify-between"><span className="font-semibold">{name}</span><span className="stat-number text-teal">{number(value)} matches</span></div>
                {outcome && <p className="mt-1 text-xs text-muted">Wins {number(outcome.W)}, draws {number(outcome.D)}, loses {number(outcome.L)}, win rate {number(outcome.winRate, 1)}%</p>}
              </div>
            );
          })}</div>
        </Card>
      </div>
      <Card title="Formation outcome analysis" kicker="Results by tactical shape" className="mt-4">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[680px] text-sm sm:min-w-[760px]">
            <thead className="text-left text-sm text-muted"><tr>{["Formation", "Matches", "Wins", "Draws", "Loses", "Win rate", "GF", "GA", "Avg xG"].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr></thead>
            <tbody>
              {formationOutcomes.map((row) => (
                <tr key={row.formation} className="border-t border-border">
                  <td className="px-3 py-3 font-semibold">{row.formation}</td>
                  <td className="px-3 py-3 stat-number">{number(row.matches)}</td>
                  <td className="px-3 py-3 stat-number text-win">{number(row.W)}</td>
                  <td className="px-3 py-3 stat-number text-draw">{number(row.D)}</td>
                  <td className="px-3 py-3 stat-number text-loss">{number(row.L)}</td>
                  <td className="px-3 py-3 stat-number">{number(row.winRate, 1)}%</td>
                  <td className="px-3 py-3 stat-number">{number(row.goalsFor)}</td>
                  <td className="px-3 py-3 stat-number">{number(row.goalsAgainst)}</td>
                  <td className="px-3 py-3 stat-number">{number(row.xGPerMatch, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="Corners proxy" value={number(setPieces.cornersProxy)} />
        <StatCard label="Penalties won" value={number(setPieces.penaltiesWon)} />
        <StatCard label="Penalties conceded" value={number(setPieces.penaltiesConceded)} tone="text-loss" />
        <StatCard label="Own goals" value={number(setPieces.ownGoals)} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title="Attacking direction" kicker="Approximated distribution"><GroupedBarChart data={attackDirection} keys={["Value"]} colors={["#0F62FE"]} /><ChartNote>Visualization: categorical bar chart, estimated from available passing and crossing proxies.</ChartNote></Card>
        <Card title="Pressing intensity" kicker="Tackles plus interceptions"><LineChart series={pressing} /><ChartNote>Visualization: proxy trend line. Higher values mean more defensive actions, not official PPDA.</ChartNote></Card>
        <Card title="Cross analysis" kicker="Attempted vs accurate"><LineChart series={crosses} /><ChartNote>Visualization: two-series line chart. Hover points for attempted and accurate crosses by round.</ChartNote></Card>
      </div>
      <div className="mt-4"><AIPanel title="AI Tactical Analysis" data={{ team: selectedTeam?.name, formation, frequency, formationOutcomes, attackDirection, pressing: pressing[0].values, crosses, setPieces }} systemPrompt="You are a tactical analyst. Based on this data, describe the team's tactical setup, pressing behavior, and attacking patterns in 3 paragraphs. No emojis, no em dashes." buildPrompt={(data) => `Tactical data JSON:\n${JSON.stringify(data)}`} fallback={(data) => `${data.team} most commonly profile around a ${data.formation} structure in the current selection. The outcome table shows which shapes produced wins, draws, and loses, so tactical usage can be judged by both volume and result quality.\n\nPressing intensity is approximated by tackles plus interceptions per match. Higher spikes indicate games where the team defended forward or faced more transition volume, while lower values usually point to deeper control phases or reduced defensive events.\n\nThe attacking direction and crossing charts should be read as approximations because detailed event locations are not available. Even so, the distribution helps identify whether the side leans toward wide delivery, central progression, or a mixed attacking pattern.`} /></div>
    </>
  );
}

export default function FormationAnalysis() {
  return <DataState><FormationContent /></DataState>;
}
