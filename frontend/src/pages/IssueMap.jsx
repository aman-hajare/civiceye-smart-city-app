import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const IssueMap = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://127.0.0.1:8000/api/issues/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIssues(response.data.results || response.data);
      } catch (error) {
        console.error("Map fetch error:", error);
      }
    };

    fetchIssues();
  }, []);

  const getIcon = (status) => {
    const color =
      status === "RESOLVED"
        ? "green"
        : status === "IN_PROGRESS"
        ? "orange"
        : "red";

    return new L.Icon({
      iconUrl: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
      iconSize: [32, 32],
    });
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Issue Map</h1>

      <div className="h-[600px] rounded-xl overflow-hidden shadow">
        <MapContainer
          center={[23.2599, 77.4126]} // Default center (India)
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {issues.map((issue) => (
            <Marker
              key={issue.id}
              position={[issue.latitude, issue.longitude]}
              icon={getIcon(issue.status)}
            >
              <Popup>
                <strong>{issue.title}</strong>
                <br />
                Category: {issue.category}
                <br />
                Status: {issue.status}
                <br />
                Priority: {issue.priority_score}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </DashboardLayout>
  );
};

export default IssueMap;
