import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // =====================================================
  // LOAD LOGGED-IN USER
  // =====================================================
  const loadUser = () => {
    // -----------------------------
    // STUDENT
    // -----------------------------
    const studentLoggedIn =
      localStorage.getItem("studentLoggedIn") === "true";

    const studentSession =
      localStorage.getItem("studentSession");

    if (studentLoggedIn && studentSession) {
      try {
        const student = JSON.parse(studentSession);

        setUser({
          ...student,
          role: "student",
        });

        return;
      } catch (error) {
        console.error("Student session error:", error);

        localStorage.removeItem("studentLoggedIn");
        localStorage.removeItem("studentSession");
      }
    }

    // -----------------------------
    // CLIENT
    // -----------------------------
    const clientLoggedIn =
      localStorage.getItem("clientLoggedIn") === "true";

    const clientSession =
      localStorage.getItem("clientSession");

    if (clientLoggedIn && clientSession) {
      try {
        const client = JSON.parse(clientSession);

        setUser({
          ...client,
          role: "client",
        });

        return;
      } catch (error) {
        console.error("Client session error:", error);

        localStorage.removeItem("clientLoggedIn");
        localStorage.removeItem("clientSession");
      }
    }

    // -----------------------------
    // NO USER
    // -----------------------------
    setUser(null);
  };

  // =====================================================
  // LOAD USER ON PAGE CHANGE
  // =====================================================
  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // =====================================================
  // LISTEN FOR LOGIN / LOGOUT
  // =====================================================
  useEffect(() => {
    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener(
      "authChanged",
      handleAuthChange
    );

    window.addEventListener(
      "storage",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "authChanged",
        handleAuthChange
      );

      window.removeEventListener(
        "storage",
        handleAuthChange
      );
    };
  }, []);

  // =====================================================
  // USER NAME
  // =====================================================
  const getUserName = () => {
    if (!user) return "";

    return (
      user.fullName ||
      user.name ||
      user.contactPerson ||
      user.companyName ||
      "User"
    );
  };

  // =====================================================
  // ACTIVE LINK
  // =====================================================
  const isActive = (path) => {
    return location.pathname === path;
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    // Remove student session
    localStorage.removeItem("studentLoggedIn");
    localStorage.removeItem("studentSession");

    // Remove client session
    localStorage.removeItem("clientLoggedIn");
    localStorage.removeItem("clientSession");

    // Remove old session if exists
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedInUser");

    setUser(null);
    setMenuOpen(false);

    // Tell Navbar / other components
    window.dispatchEvent(
      new Event("authChanged")
    );

    // Go to home
    navigate("/", {
      replace: true,
    });
  };

  // =====================================================
  // DASHBOARD PATH
  // =====================================================
  const dashboardPath =
    user?.role === "student"
      ? "/student-dashboard"
      : "/client-dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">

      {/* =================================================
          NAVBAR MAIN
      ================================================= */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* =================================================
            LOGO
        ================================================= */}
        <Link
          to="/"
          onClick={closeMenu}
          className="group flex items-center transition-all duration-300 hover:-translate-y-0.5"
        >
          <span className="text-2xl font-bold text-gray-900">
            SkillBridge
          </span>

          <span className="ml-1 text-2xl font-bold text-blue-600 transition-all duration-300 group-hover:scale-105 group-hover:text-blue-700">
            AI
          </span>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}
        <div className="hidden items-center gap-8 md:flex">

          {/* HOME */}
          <Link
            to="/"
            className={`relative py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
              isActive("/")
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Home

            <span
              className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                isActive("/")
                  ? "w-full"
                  : "w-0"
              }`}
            />
          </Link>

          {/* =================================================
              STUDENT ONLY - PROJECTS
          ================================================= */}
          {user?.role === "student" && (
            <Link
              to="/projects"
              className={`relative py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                isActive("/projects")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Projects

              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                  isActive("/projects")
                    ? "w-full"
                    : "w-0"
                }`}
              />
            </Link>
          )}

          {/* =================================================
              CLIENT ONLY - POST PROJECT
          ================================================= */}
          {user?.role === "client" && (
            <Link
              to="/post-project"
              className={`relative py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                isActive("/post-project")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Post Project

              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                  isActive("/post-project")
                    ? "w-full"
                    : "w-0"
                }`}
              />
            </Link>
          )}

          {/* =================================================
              CLIENT ONLY - MY PROJECTS
          ================================================= */}
          {user?.role === "client" && (
            <Link
              to="/client-projects"
              className={`relative py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                isActive("/client-projects")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              My Projects

              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                  isActive("/client-projects")
                    ? "w-full"
                    : "w-0"
                }`}
              />
            </Link>
          )}

          {/* =================================================
              HOW IT WORKS
          ================================================= */}
          <Link
            to="/#how-it-works"
            onClick={closeMenu}
            className="relative py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:text-blue-600"
          >
            How It Works

            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 hover:w-full" />
          </Link>
        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}
        <div className="flex items-center gap-3">

          {/* =================================================
              NOT LOGGED IN
          ================================================= */}
          {!user && (
            <>
              {/* LOGIN */}
              <Link
                to="/login"
                className="hidden rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-gray-50 hover:text-blue-600 hover:shadow-md sm:block"
              >
                Login
              </Link>

              {/* GET STARTED */}
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}

          {/* =================================================
              LOGGED IN
          ================================================= */}
          {user && (
            <div className="flex items-center gap-3">

              {/* USER INFO */}
              <div className="hidden items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-100 sm:flex">

                {/* AVATAR */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {getUserName()
                    .charAt(0)
                    .toUpperCase()}
                </div>

                {/* NAME */}
                <div className="leading-tight">

                  <p className="text-xs text-gray-500">
                    {user.role === "student"
                      ? "Student"
                      : "Client"}
                  </p>

                  <p className="max-w-[120px] truncate text-sm font-semibold text-gray-800">
                    {getUserName()}
                  </p>

                </div>
              </div>

              {/* DASHBOARD */}
              <Link
                to={dashboardPath}
                className={`hidden rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-md lg:block ${
                  isActive(dashboardPath)
                    ? "border-blue-300 bg-blue-50 text-blue-600"
                    : "border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                Dashboard
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="hidden rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-red-600 hover:shadow-lg active:scale-95 sm:block"
              >
                Logout
              </button>
            </div>
          )}

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen((prev) => !prev)
            }
            className="ml-2 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-all duration-300 hover:bg-gray-100 active:scale-90 md:hidden"
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">

              <span
                className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${
                  menuOpen
                    ? "translate-y-2 rotate-45"
                    : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${
                  menuOpen
                    ? "opacity-0"
                    : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${
                  menuOpen
                    ? "-translate-y-1 -rotate-45"
                    : ""
                }`}
              />

            </div>
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          menuOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-100 bg-white px-6 pb-5 pt-3">

          <div className="flex flex-col gap-2">

            {/* HOME */}
            <Link
              to="/"
              onClick={closeMenu}
              className={`rounded-lg px-4 py-3 transition-all duration-300 ${
                isActive("/")
                  ? "bg-blue-50 font-semibold text-blue-600"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              Home
            </Link>

            {/* =================================================
                STUDENT PROJECTS
            ================================================= */}
            {user?.role === "student" && (
              <Link
                to="/projects"
                onClick={closeMenu}
                className={`rounded-lg px-4 py-3 transition-all duration-300 ${
                  isActive("/projects")
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Projects
              </Link>
            )}

            {/* =================================================
                CLIENT POST PROJECT
            ================================================= */}
            {user?.role === "client" && (
              <Link
                to="/post-project"
                onClick={closeMenu}
                className={`rounded-lg px-4 py-3 transition-all duration-300 ${
                  isActive("/post-project")
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Post Project
              </Link>
            )}

            {/* =================================================
                CLIENT MY PROJECTS
            ================================================= */}
            {user?.role === "client" && (
              <Link
                to="/client-projects"
                onClick={closeMenu}
                className={`rounded-lg px-4 py-3 transition-all duration-300 ${
                  isActive("/client-projects")
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                My Projects
              </Link>
            )}

            {/* =================================================
                HOW IT WORKS
            ================================================= */}
            <Link
              to="/#how-it-works"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-gray-700 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600"
            >
              How It Works
            </Link>

            {/* =================================================
                LOGGED IN - DASHBOARD
            ================================================= */}
            {user && (
              <Link
                to={dashboardPath}
                onClick={closeMenu}
                className={`rounded-lg px-4 py-3 transition-all duration-300 ${
                  isActive(dashboardPath)
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Dashboard
              </Link>
            )}

            {/* =================================================
                NOT LOGGED IN - LOGIN
            ================================================= */}
            {!user && (
              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-gray-700 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600"
              >
                Login
              </Link>
            )}

            {/* =================================================
                NOT LOGGED IN - GET STARTED
            ================================================= */}
            {!user && (
              <Link
                to="/register"
                onClick={closeMenu}
                className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700"
              >
                Get Started
              </Link>
            )}

            {/* =================================================
                LOGGED IN - LOGOUT
            ================================================= */}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-4 py-3 text-left font-medium text-red-600 transition-all duration-300 hover:bg-red-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;