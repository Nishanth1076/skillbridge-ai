import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import RegisterSelection from "./pages/RegisterSelection";
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
import EditProject from "./pages/EditProject";

import MyApplications from "./pages/MyApplications";

import GoogleRoleSelection from "./pages/GoogleRoleSelection";

import BackButton from "./pages/BackButton";

function App() {
  const location = useLocation();

  const showHomeNavbar =
    location.pathname === "/";

  return (
    <>
      {showHomeNavbar && <Navbar />}

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* AUTHENTICATION */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<RegisterSelection />}
        />

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

        {/* GOOGLE ROLE SELECTION */}
        <Route
          path="/google-role-selection"
          element={<GoogleRoleSelection />}
        />

        {/* STUDENT MODULE */}
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

        {/* CLIENT MODULE */}
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

        {/* EDIT PROJECT */}
        <Route
          path="/edit-project/:projectId"
          element={<EditProject />}
        />

        {/* PROJECT MODULE */}
        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/projects/:projectId"
          element={<ProjectDetails />}
        />

        {/* BACK */}
        <Route
          path="/back"
          element={<BackButton />}
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<BackButton />}
        />

      </Routes>
    </>
  );
}

export default App;