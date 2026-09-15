import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "../context/AuthContext";

function ClientDashboard() {
  const navigate = useNavigate();

  const { user, profile, loading, logout } = useAuth();

  // =========================================
  // CHECK CLIENT AUTHENTICATION
  // =========================================
  useEffect(() => {
    if (!loading && (!user || profile?.role !== "client")) {
      navigate("/login", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  // =========================================
  // LOGOUT
  // =========================================
  const handleLogout = async () => {
    try {
      await logout();

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Client logout error:", error);
    }
  };

  // =========================================
  // LOADING
  // =========================================
  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* =========================================
            HEADER
        ========================================= */}
        <div className="mb-10">

          <p className="font-semibold uppercase tracking-wide text-blue-600">
            Client Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900 md:text-5xl">
            Welcome,{" "}
            {profile.Company_Name ||
              profile.Contact_Person ||
              "Client"}{" "}
            👋
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            Post projects, manage your requirements and connect with
            talented students.
          </p>

        </div>

        {/* =========================================
            DASHBOARD CARDS
        ========================================= */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* =========================================
              POST PROJECT
          ========================================= */}
          <Link
            to="/post-project"
            className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl transition-transform duration-300 group-hover:scale-110">
              ➕
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Post a Project
            </h2>

            <p className="mt-3 leading-6 text-gray-600">
              Create a new freelance project and find students with
              the right skills for your requirements.
            </p>

            <p className="mt-6 font-semibold text-blue-600">
              Post Project →
            </p>
          </Link>

          {/* =========================================
              MY PROJECTS
          ========================================= */}
          <Link
            to="/client-projects"
            className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl transition-transform duration-300 group-hover:scale-110">
              📁
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              My Projects
            </h2>

            <p className="mt-3 leading-6 text-gray-600">
              View the projects you have posted and manage project
              details and student applications.
            </p>

            <p className="mt-6 font-semibold text-blue-600">
              Manage Projects →
            </p>
          </Link>

          {/* =========================================
              PROFILE
          ========================================= */}
          <Link
            to="/client-profile"
            className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl transition-transform duration-300 group-hover:scale-110">
              👤
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Company Profile
            </h2>

            <p className="mt-3 leading-6 text-gray-600">
              Manage your company information, contact details and
              profile information.
            </p>

            <p className="mt-6 font-semibold text-blue-600">
              View Profile →
            </p>
          </Link>

        </div>

        {/* =========================================
            CLIENT WORKSPACE
        ========================================= */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-gray-900">
            Your Client Workspace
          </h2>

          <p className="mt-2 text-gray-600">
            Everything you need to post projects, find skilled students
            and manage your freelance requirements.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">

            {/* STEP 01 */}
            <div>
              <p className="text-4xl font-bold text-blue-600">
                01
              </p>

              <h3 className="mt-3 font-semibold text-gray-900">
                Post Projects
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Describe your project requirements, required skills,
                budget and deadline.
              </p>
            </div>

            {/* STEP 02 */}
            <div>
              <p className="text-4xl font-bold text-blue-600">
                02
              </p>

              <h3 className="mt-3 font-semibold text-gray-900">
                Review Applications
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                View students who apply for your projects and check
                their skills and profiles.
              </p>
            </div>

            {/* STEP 03 */}
            <div>
              <p className="text-4xl font-bold text-blue-600">
                03
              </p>

              <h3 className="mt-3 font-semibold text-gray-900">
                Connect & Hire
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Connect with suitable students and choose the right
                candidate for your project.
              </p>
            </div>

          </div>
        </div>

        {/* =========================================
            QUICK ACTIONS
        ========================================= */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <Link
            to="/post-project"
            className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-4 font-semibold text-blue-700 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-100"
          >
            + Create New Project
          </Link>

          <Link
            to="/client-projects"
            className="rounded-xl border border-gray-200 bg-white px-6 py-4 font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:text-blue-600"
          >
            View My Projects →
          </Link>

        </div>

        {/* =========================================
            ACCOUNT / LOGOUT
        ========================================= */}
        <div className="mt-8 flex justify-end">

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-red-200 px-6 py-3 font-semibold text-red-600 transition-all duration-300 hover:-translate-y-1 hover:bg-red-50"
          >
            Logout
          </button>

        </div>

      </div>
    </main>
  );
}

export default ClientDashboard;