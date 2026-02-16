import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatusPill from "../components/StatusPill";
import { getIssues } from "../services/issueService";

const UserDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await getIssues({ reported_by: "me", ordering: "-created_at" });
        setIssues(list);
      } catch (error) {
        console.error("User dashboard load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <DashboardLayout title="User Dashboard">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">My Reported Issues</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{issues.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Recent Reports</h3>

          {loading ? (
            <p className="text-sm text-slate-500">Loading your issues...</p>
          ) : issues.length === 0 ? (
            <p className="text-sm text-slate-500">No reported issues yet.</p>
          ) : (
            <ul className="space-y-3">
              {issues.slice(0, 8).map((issue) => (
                <li key={issue.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{issue.title}</p>
                    <p className="text-sm text-slate-500">{issue.category || "General"}</p>
                  </div>
                  <StatusPill status={issue.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
