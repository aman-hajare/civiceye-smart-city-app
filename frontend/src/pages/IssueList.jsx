import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";

const IssueList = () => {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch issues
        const issueResponse = await axios.get(
          `http://127.0.0.1:8000/api/issues/?status=${statusFilter}&search=${search}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch workers
        const workerResponse = await axios.get(
          "http://127.0.0.1:8000/api/users/?role=WORKER",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIssues(issueResponse.data.results || issueResponse.data);
        setWorkers(workerResponse.data.results || workerResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter, search]);

  // 🔥 Update Status
  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://127.0.0.1:8000/api/issues/${id}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id ? { ...issue, status: newStatus } : issue
        )
      );

    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // 🔥 Update Assignment
  const updateAssignment = async (id, workerId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://127.0.0.1:8000/api/issues/${id}/`,
        { assigned_to: workerId || null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id
            ? { ...issue, assigned_to: workerId }
            : issue
        )
      );

    } catch (error) {
      console.error("Assignment error:", error);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">All Issues</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All</option>
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>

        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />
      </div>

      {loading ? (
        <p className="text-center p-6">Loading issues...</p>
      ) : issues.length === 0 ? (
        <p className="text-center p-6 text-gray-500">
          No issues found.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Image</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assign Worker</th>
                <th className="p-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{issue.id}</td>
                  <td className="p-3">{issue.title}</td>
                  <td className="p-3">{issue.category}</td>

                  {/* Image */}
                  <td className="p-3">
                    {issue.image ? (
                      <img
                        src={
                          issue.image.startsWith("http")
                            ? issue.image
                            : `http://127.0.0.1:8000${issue.image}`
                        }
                        alt="issue"
                        className="w-16 h-16 object-cover rounded cursor-pointer"
                        onClick={() => {
                          const imageUrl = issue.image.startsWith("http")
                            ? issue.image
                            : `http://127.0.0.1:8000${issue.image}`;
                          window.open(imageUrl, "_blank");
                        }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <select
                      value={issue.status}
                      onChange={(e) =>
                        updateStatus(issue.id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </td>

                  {/* Assignment */}
                  <td className="p-3">
                    <select
                      value={issue.assigned_to || ""}
                      onChange={(e) =>
                        updateAssignment(issue.id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Unassigned</option>
                      {workers.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.username}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3 font-bold">
                    {issue.priority_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default IssueList;
