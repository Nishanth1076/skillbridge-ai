import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const navigate = useNavigate();

  const { user, profile, loading, logout } = useAuth();

  // Check whether the user is logged in as a student
  useEffect(() => {
    if (!loading && (!user || profile?.role !== "student")) {
      navigate("/login", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  // Logout from Firebase
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading while Firebase checks the login state
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-blue-600 font-semibold tracking-wide uppercase">
            Student Dashboard
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            Welcome, {profile.Name || "Student"} 👋
          </h1>

          <p className="text-gray-600 text-lg mt-3">
            Discover projects, build your experience and grow your freelance
            career.
          </p>
        </div>

        {/* DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* BROWSE PROJECTS */}
          <Link
            to="/projects"
            className="group bg-white border border-gray-200 rounded-2xl p-7 shadow-sm
            transition-all duration-300
            hover:-translate-y-2 hover:shadow-xl hover:border-blue-200"
          >
            <div
              className="w-14 h-14 rounded-xl bg-blue-50 flex items-center
              justify-center text-2xl mb-6
              transition-transform duration-300 group-hover:scale-110"
            >
              📁
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Browse Projects
            </h2>

            <p className="text-gray-600 mt-3 leading-6">
              Explore freelance projects posted by clients and find
              opportunities matching your skills.
            </p>

            <p className="text-blue-600 font-semibold mt-6">
              Explore Projects →
            </p>
          </Link>

          {/* MY APPLICATIONS */}
          <Link
            to="/my-applications"
            className="group bg-white border border-gray-200 rounded-2xl p-7 shadow-sm
            transition-all duration-300
            hover:-translate-y-2 hover:shadow-xl hover:border-blue-200"
          >
            <div
              className="w-14 h-14 rounded-xl bg-blue-50 flex items-center
              justify-center text-2xl mb-6
              transition-transform duration-300 group-hover:scale-110"
            >
              📋
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              My Applications
            </h2>

            <p className="text-gray-600 mt-3 leading-6">
              Track the projects you have applied for and monitor your
              application status.
            </p>

            <p className="text-blue-600 font-semibold mt-6">
              View Applications →
            </p>
          </Link>

          {/* MY PROFILE */}
          <Link
            to="/student-profile"
            className="group bg-white border border-gray-200 rounded-2xl p-7 shadow-sm
            transition-all duration-300
            hover:-translate-y-2 hover:shadow-xl hover:border-blue-200"
          >
            <div
              className="w-14 h-14 rounded-xl bg-blue-50 flex items-center
              justify-center text-2xl mb-6
              transition-transform duration-300 group-hover:scale-110"
            >
              👤
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              My Profile
            </h2>

            <p className="text-gray-600 mt-3 leading-6">
              Manage your profile, skills, resume and personal information.
            </p>

            <p className="text-blue-600 font-semibold mt-6">
              View Profile →
            </p>
          </Link>

        </div>

        {/* WORKSPACE */}
        <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-gray-900">
            Your Student Workspace
          </h2>

          <p className="text-gray-600 mt-2">
            Everything you need to find freelance opportunities and build
            practical experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">

            {/* STEP 01 */}
            <div>
              <p className="text-4xl font-bold text-blue-600">
                01
              </p>

              <h3 className="font-semibold text-gray-900 mt-3">
                Find Projects
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                Browse freelance projects based on your skills and interests.
              </p>
            </div>

            {/* STEP 02 */}
            <div>
              <p className="text-4xl font-bold text-blue-600">
                02
              </p>

              <h3 className="font-semibold text-gray-900 mt-3">
                Apply
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                Submit your application and AI-generated proposal to suitable
                projects.
              </p>
            </div>

            {/* STEP 03 */}
            <div>
              <p className="text-4xl font-bold text-blue-600">
                03
              </p>

              <h3 className="font-semibold text-gray-900 mt-3">
                Work with Clients
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                Work with clients on selected projects and gain practical
                freelance experience.
              </p>
            </div>

          </div>
        </div>

        {/* ACCOUNT */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-lg border border-red-200
            text-red-600 font-semibold
            hover:bg-red-50 transition-all duration-300
            hover:-translate-y-1"
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}

export default StudentDashboard;