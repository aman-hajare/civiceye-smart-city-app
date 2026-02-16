import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatusPill from "../components/StatusPill";
import { getIssues, updateIssueStatus } from "../services/issueService";

const WorkerDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await getIssues({ assigned_to: "me", ordering: "-created_at" });
        setIssues(list);
      } catch (error) {
        console.error("Worker dashboard load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const inProgressCount = useMemo(() => issues.filter((item) => item.status === "IN_PROGRESS").length, [issues]);

  const completeIssue = async (id) => {
    try {
      await updateIssueStatus(id, "RESOLVED");
      setIssues((prev) => prev.map((item) => (item.id === id ? { ...item, status: "RESOLVED" } : item)));
    } catch (error) {
      console.error("Issue completion failed:", error);
    }
  };

  return (
    <DashboardLayout title="Worker Dashboard">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Assigned Issues</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{issues.length}</p>
          <p className="mt-1 text-sm text-slate-500">In progress: {inProgressCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">My Tasks</h3>

          {loading ? (
            <p className="text-sm text-slate-500">Loading assigned issues...</p>
          ) : issues.length === 0 ? (
            <p className="text-sm text-slate-500">No assigned issues.</p>
          ) : (
            <ul className="space-y-3">
              {issues.map((issue) => (
                <li key={issue.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{issue.title}</p>
                    <p className="text-sm text-slate-500">{issue.description || "No description"}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusPill status={issue.status} />
                    <button
                      type="button"
                      disabled={issue.status === "RESOLVED"}
                      onClick={() => completeIssue(issue.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Mark Complete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;
