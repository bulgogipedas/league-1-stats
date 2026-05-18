import { useEffect } from "react";
import { useLeagueData } from "../../data/useLeagueData.js";
import Skeleton from "../ui/Skeleton.jsx";

export default function DataState({ children }) {
  const { load, loading, error, loaded, dataAsOf } = useLeagueData();
  useEffect(() => {
    load();
  }, [load]);
  if (loading || !loaded) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    );
  }
  if (error) return <div className="border border-loss bg-white p-4 text-loss">{error.message}</div>;
  return (
    <>
      <div className="mb-5 border border-border bg-panel px-4 py-3 text-sm text-muted">
        Data snapshot: available match files are static and run until <span className="font-semibold text-text">{dataAsOf || "the latest imported match"}</span>. This is not live streaming data.
      </div>
      {children}
    </>
  );
}
