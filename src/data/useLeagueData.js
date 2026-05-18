import { create } from "zustand";

const base = "/data";
const apiBase = import.meta.env.VITE_API_BASE_URL;

function getDataAsOf(matches) {
  const dates = Object.values(matches)
    .flat()
    .map((row) => new Date(row.Date))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (!dates.length) return null;
  const latest = new Date(Math.max(...dates.map((date) => date.getTime())));
  return latest.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

async function getJson(path) {
  const response = await fetch(`${base}${path}`);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
}

async function getApiBootstrap() {
  const response = await fetch(`${apiBase}/bootstrap`);
  if (!response.ok) throw new Error(`Unable to load API bootstrap: ${response.status}`);
  return response.json();
}

export const useLeagueStore = create((set, get) => ({
  loading: false,
  error: null,
  loaded: false,
  standings: [],
  summary: null,
  players: [],
  playerPerformance: [],
  teams: [],
  matches: {},
  formations: {},
  teamAnalysis: {},
  dataAsOf: null,
  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true, error: null });
    try {
      if (apiBase) {
        try {
        const api = await getApiBootstrap();
        set({
          standings: api.standings,
          summary: api.summary,
          players: api.players,
          playerPerformance: api.playerPerformance || api.players,
            teams: api.teams,
            matches: api.matches,
            formations: api.formations,
            teamAnalysis: api.teamAnalysis,
            dataAsOf: getDataAsOf(api.matches || {}),
            loaded: true,
            loading: false,
          });
          return;
        } catch (apiError) {
          console.info("Falling back to static JSON data", apiError.message);
        }
      }
      const [manifest, standings, summary, players, playerPerformance] = await Promise.all([
        getJson("/manifest.json"),
        getJson("/standings.json"),
        getJson("/league_summary.json"),
        getJson("/players_merged.json"),
        getJson("/player_performance.json"),
      ]);
      const teams = manifest.teams;
      const matchPairs = await Promise.all(teams.map(async (team) => [team.slug, await getJson(`/match_analysis/${team.slug}.json`)]));
      const formationPairs = await Promise.all(teams.map(async (team) => [team.slug, await getJson(`/formation/${team.slug}.json`)]));
      const teamAnalysisPairs = await Promise.all(teams.map(async (team) => [team.slug, await getJson(`/team_analysis/${team.slug}.json`)]));
      const matches = Object.fromEntries(matchPairs);
      set({
        standings,
        summary,
        players,
        playerPerformance,
        teams,
        matches,
        formations: Object.fromEntries(formationPairs),
        teamAnalysis: Object.fromEntries(teamAnalysisPairs),
        dataAsOf: getDataAsOf(matches),
        loaded: true,
        loading: false,
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));

export function useLeagueData() {
  const store = useLeagueStore();
  return store;
}
