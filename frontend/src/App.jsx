// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import AdminDashboard from "./pages/AdminDashboard";
// import Login from "./pages/Login";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/dashboard" element={<AdminDashboard />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import UserDashboard from "./pages/UserDashboard";
import IssueList from "./pages/IssueList";

function App() {
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/issues" element={<IssueList />} />

        {role === "ADMIN" && (
          <Route path="/dashboard" element={<AdminDashboard />} />
        )}

        {role === "WORKER" && (
          <Route path="/dashboard" element={<WorkerDashboard />} />
        )}

        {role === "USER" && (
          <Route path="/dashboard" element={<UserDashboard />} />
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



