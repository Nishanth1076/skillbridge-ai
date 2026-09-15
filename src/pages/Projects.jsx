import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const { user, profile, loading } = useAuth();

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // LOAD PROJECTS FROM FIRESTORE
  // =========================================
  useEffect(() => {
    const loadProjects = async () => {
      if (loading) {
        return;
      }

      if (!user) {
        setProjects([]);
        setIsLoadingProjects(false);
        return;
      }

      if (
        !profile?.role ||
        (profile.role !== "student" &&
          profile.role !== "client")
      ) {
        setProjects([]);
        setIsLoadingProjects(false);
        return;
      }

      try {
        setIsLoadingProjects(true);
        setError("");

        console.log(
          "🔥 Loading projects from Firestore..."
        );

        console.log(
          "👤 Current User:",
          user.uid
        );

        console.log(
          "🎭 Current Role:",
          profile.role
        );

        let projectsQuery;

        // -----------------------------------------
        // STUDENT
        // ONLY OPEN PROJECTS
        // -----------------------------------------
        if (profile.role === "student") {
          projectsQuery = query(
            collection(db, "projects"),
            where("Status", "==", "Open")
          );
        }

        // -----------------------------------------
        // CLIENT
        // ONLY OWN PROJECTS
        // -----------------------------------------
        if (profile.role === "client") {
          projectsQuery = query(
            collection(db, "projects"),
            where("Client_ID", "==", user.uid)
          );
        }

        const snapshot = await getDocs(
          projectsQuery
        );

        const projectList = snapshot.docs.map(
          (projectDoc) => ({
            id: projectDoc.id,
            ...projectDoc.data(),
          })
        );

        console.log(
          "✅ Projects loaded from Firestore:",
          projectList
        );

        setProjects(projectList);
      } catch (error) {
        console.error(
          "❌ Error loading projects:",
          error
        );

        console.error(
          "❌ Error code:",
          error.code
        );

        console.error(
          "❌ Error message:",
          error.message
        );

        setError(
          "Unable to load projects. Please try again."
        );

        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, [user, profile, loading]);

  // =========================================
  // DELETE PROJECT
  // CLIENT ONLY
  // =========================================
  const handleDelete = async (projectId) => {
    if (profile?.role !== "client") {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      console.log(
        "🗑️ Deleting project:",
        projectId
      );

      // -----------------------------------------
      // DELETE FIRESTORE DOCUMENT
      // -----------------------------------------
      await deleteDoc(
        doc(db, "projects", projectId)
      );

      console.log(
        "✅ Project deleted successfully"
      );

      // -----------------------------------------
      // UPDATE UI
      // -----------------------------------------
      setProjects((prevProjects) =>
        prevProjects.filter(
          (project) => project.id !== projectId
        )
      );
    } catch (error) {
      console.error(
        "❌ Project delete error:",
        error
      );

      console.error(
        "❌ Error code:",
        error.code
      );

      console.error(
        "❌ Error message:",
        error.message
      );

      alert(
        "Unable to delete the project. Please try again."
      );
    }
  };

  // =========================================
  // NOT LOGGED IN
  // =========================================
  if (!loading && !user) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              🔐
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Login Required
            </h1>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
              Please login to explore freelance
              opportunities on SkillBridge AI.
            </p>

            <Link
              to="/login"
              className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================================
  // AUTH LOADING
  // =========================================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-slate-600">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // PROJECT LOADING
  // =========================================
  if (isLoadingProjects) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-slate-600">
            Loading projects...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // MAIN
  // =========================================
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ===================================== */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
              {profile.role === "student"
                ? "Project Marketplace"
                : "Client Workspace"}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {profile.role === "student"
                ? "Explore Projects"
                : "My Projects"}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              {profile.role === "student"
                ? "Discover freelance opportunities that match your skills and interests."
                : "Manage the freelance projects you have posted."}
            </p>
          </div>

          {/* CLIENT ONLY */}
          {profile.role === "client" && (
            <Link
              to="/post-project"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg"
            >
              + Post a Project
            </Link>
          )}
        </div>

        {/* =====================================
            ERROR
        ===================================== */}
        {error && (
          <div className="mb-7 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* =====================================
            PROJECT COUNT
        ===================================== */}
        <div className="mb-7 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            <span className="font-bold text-slate-900">
              {projects.length}
            </span>{" "}
            {projects.length === 1
              ? "project"
              : "projects"}{" "}
            {profile.role === "student"
              ? "available"
              : "posted"}
          </p>
        </div>

        {/* =====================================
            EMPTY STATE
        ===================================== */}
        {projects.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-4xl">
              📁
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              {profile.role === "student"
                ? "No projects available yet"
                : "You haven't posted any projects yet"}
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              {profile.role === "student"
                ? "There are no open freelance projects available right now. Please check again later for new opportunities."
                : "Post your first project and connect with talented students."}
            </p>

            {/* CLIENT ONLY */}
            {profile.role === "client" && (
              <Link
                to="/post-project"
                className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
              >
                Post Your First Project
              </Link>
            )}
          </div>
        ) : (
          /* ===================================
             PROJECT GRID
          =================================== */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >

                {/* =================================
                    TOP ROW
                ================================= */}
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      project.Status?.toLowerCase() ===
                      "closed"
                        ? "bg-red-50 text-red-600"
                        : project.Status?.toLowerCase() ===
                          "paused"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {project.Status || "Open"}
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    Freelance Project
                  </span>
                </div>

                {/* =================================
                    PROJECT TITLE
                ================================= */}
                <h2 className="mt-5 line-clamp-2 text-xl font-bold text-slate-900">
                  {project.Project_Title ||
                    "Untitled Project"}
                </h2>

                {/* =================================
                    DESCRIPTION
                ================================= */}
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {project.Description ||
                    "No project description available."}
                </p>

                {/* =================================
                    SKILLS
                ================================= */}
                {project.Required_Skills?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.Required_Skills.map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* =================================
                    PROJECT INFO
                ================================= */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">

                  {/* BUDGET */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Budget
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      ₹
                      {Number(
                        project.Budget || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* DEADLINE */}
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Deadline
                    </p>

                    <p className="mt-1 truncate font-bold text-slate-900">
                      {project.Deadline ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                {/* =================================
                    ACTIONS
                ================================= */}
                <div className="mt-auto pt-6">
                  {profile.role === "client" ? (
                    <div className="grid grid-cols-2 gap-3">

                      <Link
                        to={`/edit-project/${project.id}`}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(project.id)
                        }
                        className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>
                  ) : (
                    <Link
                      to={`/projects/${project.id}`}
                      className="block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
                    >
                      View Project Details →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================
            CLIENT DASHBOARD LINK
        ===================================== */}
        {profile.role === "client" && (
          <div className="mt-10">
            <Link
              to="/client-dashboard"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default Projects;