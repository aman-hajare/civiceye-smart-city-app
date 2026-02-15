import { useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

const ReportIssue = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("POTHOLE");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      navigator.geolocation.getCurrentPosition(async (position) => {
        const formData = new FormData();

        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("latitude", position.coords.latitude);
        formData.append("longitude", position.coords.longitude);

        if (image) {
          formData.append("image", image);
        }

        await axios.post(
          "http://127.0.0.1:8000/api/issues/",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        alert("Issue reported successfully!");
        navigate("/dashboard");

      });

    } catch (error) {
      console.error("Report error:", error);
      alert("Error reporting issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Report New Issue</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4 max-w-xl"
      >
        <input
          type="text"
          placeholder="Issue Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="POTHOLE">Pothole</option>
          <option value="GARBAGE">Garbage</option>
          <option value="STREETLIGHT">Street Light</option>
          <option value="WATER">Water Leakage</option>
          <option value="TRAFFIC">Traffic Signal</option>
          <option value="OTHER">Other</option>
        </select>

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Issue"}
        </button>
      </form>
    </DashboardLayout>
  );
};

export default ReportIssue;
