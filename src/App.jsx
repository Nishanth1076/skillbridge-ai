import {
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Projects from "./pages/Projects";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentRegister from "./pages/StudentRegister";
import ClientRegister from "./pages/ClientRegister";
import ForgotPassword from "./pages/ForgotPassword";

import PostProject from "./pages/PostProject";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProjects from "./pages/ClientProjects";

import StudentDashboard from "./pages/StudentDashboard";
import MyApplications from "./pages/MyApplications";
import StudentProfile from "./pages/StudentProfile";

import ProjectDetails from "./pages/ProjectDetails";
import ClientApplications from "./pages/ClientApplications";

import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  // =====================================================
  // HOME NAVBAR
  // Navbar should appear ONLY on Home page.
  // =====================================================

  const showHomeNavbar = location.pathname === "/";

  // =====================================================
  // BACK BUTTON PAGES
  // =====================================================

  const pagesWithBackButton = [
    "/projects",
    "/my-applications",
    "/student-profile",
    "/post-project",
    "/client-projects",
  ];

  const isProjectDetailsPage =
    location.pathname.startsWith("/projects/");

  const isClientApplicationsPage =
    location.pathname.startsWith("/client-projects/") &&
    location.pathname.endsWith("/applications");

  const shouldShowBackButton =
    !loading &&
    !!user &&
    (
      pagesWithBackButton.includes(location.pathname) ||
      isProjectDetailsPage ||
      isClientApplicationsPage
    );

  // =====================================================
  // BACK BUTTON
  // =====================================================

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      {/* =================================================
          HOME NAVBAR
      ================================================= */}

      {showHomeNavbar && <Navbar />}

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      {shouldShowBackButton && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">

          <button
            type="button"
            onClick={handleBack}
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              border
              border-gray-300
              bg-white
              text-gray-700
              rounded-lg
              font-medium
              text-sm
              sm:text-base
              hover:bg-gray-50
              hover:text-blue-600
              hover:border-blue-300
              transition-all
              duration-200
            "
          >
            ← Back
          </button>

        </div>
      )}

      {/* =================================================
          APPLICATION ROUTES
      ================================================= */}

      <Routes>

        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* =================================================
            PROJECTS
        ================================================= */}

        <Route
          path="/projects"
          element={<Projects />}
        />

        {/* =================================================
            PROJECT DETAILS
        ================================================= */}

        <Route
          path="/projects/:projectId"
          element={<ProjectDetails />}
        />

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* =================================================
            REGISTER SELECTION
        ================================================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =================================================
            STUDENT REGISTER
        ================================================= */}

        <Route
          path="/register/student"
          element={<StudentRegister />}
        />

        {/* =================================================
            CLIENT REGISTER
        ================================================= */}

        <Route
          path="/register/client"
          element={<ClientRegister />}
        />

        {/* =================================================
            STUDENT REGISTER
            Alternate route
        ================================================= */}

        <Route
          path="/student-register"
          element={<StudentRegister />}
        />

        {/* =================================================
            CLIENT REGISTER
            Alternate route
        ================================================= */}

        <Route
          path="/client-register"
          element={<ClientRegister />}
        />

        {/* =================================================
            CLIENT DASHBOARD
        ================================================= */}

        <Route
          path="/client-dashboard"
          element={<ClientDashboard />}
        />

        {/* =================================================
            POST PROJECT
        ================================================= */}

        <Route
          path="/post-project"
          element={<PostProject />}
        />

        {/* =================================================
            CLIENT PROJECTS
        ================================================= */}

        <Route
          path="/client-projects"
          element={<ClientProjects />}
        />

        {/* =================================================
            CLIENT APPLICATIONS
        ================================================= */}

        <Route
          path="/client-projects/:projectId/applications"
          element={<ClientApplications />}
        />

        {/* =================================================
            STUDENT DASHBOARD
        ================================================= */}

        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        {/* =================================================
            MY APPLICATIONS
        ================================================= */}

        <Route
          path="/my-applications"
          element={<MyApplications />}
        />

        {/* =================================================
            STUDENT PROFILE
        ================================================= */}

        <Route
          path="/student-profile"
          element={<StudentProfile />}
        />

      </Routes>
    </>
  );
}

export default App;