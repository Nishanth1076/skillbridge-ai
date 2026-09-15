import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import StudentRegister from "./pages/StudentRegister";
import ClientRegister from "./pages/ClientRegister";

import StudentDashboard from "./pages/StudentDashboard";
import ClientDashboard from "./pages/ClientDashboard";

import StudentProfile from "./pages/StudentProfile";
import ClientProfile from "./pages/ClientProfile";

import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";

import PostProject from "./pages/PostProject";
import ClientProjects from "./pages/ClientProjects";
import ClientApplications from "./pages/ClientApplications";

import MyApplications from "./pages/MyApplications";

import GoogleRoleSelection from "./pages/GoogleRoleSelection";

import BackButton from "./pages/BackButton";

function App() {
  const location = useLocation();

  const showHomeNavbar = location.pathname === "/";

  return (
    <>
      {showHomeNavbar && <Navbar />}

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Registration */}
        <Route
          path="/student-register"
          element={<StudentRegister />}
        />

        <Route
          path="/register/student"
          element={<StudentRegister />}
        />

        <Route
          path="/client-register"
          element={<ClientRegister />}
        />

        {/* Google Login */}
        <Route
          path="/google-role-selection"
          element={<GoogleRoleSelection />}
        />

        {/* Student */}
        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student-profile"
          element={<StudentProfile />}
        />

        <Route
          path="/my-applications"
          element={<MyApplications />}
        />

        {/* Client */}
        <Route
          path="/client-dashboard"
          element={<ClientDashboard />}
        />

        <Route
          path="/client-profile"
          element={<ClientProfile />}
        />

        <Route
          path="/post-project"
          element={<PostProject />}
        />

        <Route
          path="/client-projects"
          element={<ClientProjects />}
        />

        <Route
          path="/client-projects/:projectId/applications"
          element={<ClientApplications />}
        />

        {/* Projects */}
        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/projects/:projectId"
          element={<ProjectDetails />}
        />

        {/* Back Button */}
        <Route
          path="/back"
          element={<BackButton />}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<BackButton />}
        />
      </Routes>
    </>
  );
}

export default App;