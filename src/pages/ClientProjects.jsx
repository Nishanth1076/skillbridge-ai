import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

function ClientProjects() {
  const navigate = useNavigate();

  const { user, profile, loading } = useAuth();

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // LOAD CLIENT PROJECTS
  // =========================================
  useEffect(() => {
    const loadProjects = async () => {
      if (loading) {
        return;
      }

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      if (profile?.role !== "client") {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setIsLoadingProjects(true);
        setError("");

        console.log("🔥 Loading client projects...");
        console.log("👤 Client UID:", user.uid);

        const projectsQuery = query(
          collection(db, "projects"),
          where("Client_ID", "==", user.uid)
        );

        const snapshot = await getDocs(projectsQuery);

        const projectList = snapshot.docs.map((projectDoc) => ({
          id: projectDoc.id,
          ...projectDoc.data(),
        }));

        console.log("✅ Client projects loaded:", projectList);

        setProjects(projectList);
      } catch (error) {
        console.error("❌ Error loading client projects:", error);
        console.error("❌ Error code:", error.code);
        console.error("❌ Error message:", error.message);

        setError(
          "Unable to load your projects. Please try again."
        );
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, [user, profile, loading, navigate]);

  // =========================================
  // DELETE PROJECT
  // =========================================
  const handleDelete = async (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      console.log("🗑️ Deleting project:", projectId);

      await deleteDoc(doc(db, "projects", projectId));

      console.log("✅ Project deleted successfully");

      setProjects((prevProjects) =>
        prevProjects.filter(
          (project) => project.id !== projectId
        )
      );
    } catch (error) {
      console.error("❌ Error deleting project:", error);

      alert(
        "Unable to delete the project. Please try again."
      );
    }
  };

  // =========================================
  // STATUS UPDATE
  // =========================================
  const handleStatusChange = async (
    projectId,
    newStatus
  ) => {
    try {
      console.log(
        "🔄 Updating project status:",
        projectId,
        newStatus
      );

      await updateDoc(
        doc(db, "projects", projectId),
        {
          Status: newStatus,
        }
      );

      console.log("✅ Project status updated");

      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              Status: newStatus,
            };
          }

          return project;
        })
      );
    } catch (error) {
      console.error(
        "❌ Error updating project status:",
        error
      );

      alert(
        "Unable to update project status. Please try again."
      );
    }
  };

  // =========================================
  // LOADING AUTH
  // =========================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-gray-600">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // LOADING PROJECTS
  // =========================================
  if (isLoadingProjects) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-gray-600">
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16">

        {/* =========================================
            HEADER
        ========================================= */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="font-semibold uppercase tracking-wide text-blue-600">
              Client Workspace
            </p>

            <h1 className="mt-3 text-4xl font-bold text-gray-900 md:text-5xl">
              My Projects
            </h1>

            <p className="mt-3 text-lg text-gray-600">
              Manage the freelance projects you have posted.
            </p>
          </div>

          <Link
            to="/post-project"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700"
          >
            + Post a Project
          </Link>

        </div>

        {/* =========================================
            ERROR
        ========================================= */}
        {error && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* =========================================
            PROJECT COUNT
        ========================================= */}
        <div className="mt-8">
          <p className="text-gray-600">
            {projects.length}{" "}
            {projects.length === 1
              ? "project"
              : "projects"}{" "}
            posted
          </p>
        </div>

        {/* =========================================
            EMPTY STATE
        ========================================= */}
        {projects.length === 0 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              📁
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              No projects yet
            </h2>

            <p className="mt-3 text-gray-600">
              You haven't posted any projects yet.
              Create your first project to connect with students.
            </p>

            <Link
              to="/post-project"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700"
            >
              Post Your First Project
            </Link>

          </div>
        )}

        {/* =========================================
            PROJECT LIST
        ========================================= */}
        {projects.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {projects.map((project) => (

              <div
                key={project.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >

                {/* =========================================
                    STATUS
                ========================================= */}
                <div className="flex items-center justify-between">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      project.Status === "Open"
                        ? "bg-green-100 text-green-700"
                        : project.Status === "Closed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {project.Status || "Open"}
                  </span>

                  <span className="text-sm text-gray-400">
                    Project
                  </span>

                </div>

                {/* =========================================
                    TITLE
                ========================================= */}
                <h2 className="mt-5 text-xl font-bold text-gray-900">
                  {project.Project_Title}
                </h2>

                {/* =========================================
                    DESCRIPTION
                ========================================= */}
                <p className="mt-3 line-clamp-3 text-gray-600">
                  {project.Description}
                </p>

                {/* =========================================
                    SKILLS
                ========================================= */}
                <div className="mt-5 flex flex-wrap gap-2">

                  {project.Required_Skills?.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-700"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

                {/* =========================================
                    PROJECT DETAILS
                ========================================= */}
                <div className="mt-6 border-t border-gray-100 pt-5">

                  <div className="flex justify-between">

                    {/* BUDGET */}
                    <div>

                      <p className="text-sm text-gray-500">
                        Budget
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        ₹
                        {Number(
                          project.Budget
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>

                    {/* DEADLINE */}
                    <div className="text-right">

                      <p className="text-sm text-gray-500">
                        Deadline
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {project.Deadline}
                      </p>

                    </div>

                  </div>

                </div>

                {/* =========================================
                    ACTIONS
                ========================================= */}
                <div className="mt-6 space-y-3">

                  {/* VIEW APPLICATIONS */}
                  <Link
                    to={`/client-projects/${project.id}/applications`}
                    className="block w-full rounded-lg bg-blue-600 py-2.5 text-center font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Applications
                  </Link>

                  {/* EDIT PROJECT */}
                  <Link
                    to={`/edit-project/${project.id}`}
                    className="block w-full rounded-lg border border-blue-600 py-2.5 text-center font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    Edit Project
                  </Link>

                  {/* STATUS */}
                  <select
                    value={project.Status || "Open"}
                    onChange={(e) =>
                      handleStatusChange(
                        project.id,
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">
                      Open
                    </option>

                    <option value="Closed">
                      Closed
                    </option>

                    <option value="Paused">
                      Paused
                    </option>
                  </select>

                  {/* DELETE */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(project.id)
                    }
                    className="w-full rounded-lg border border-red-200 py-2.5 font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete Project
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

        {/* =========================================
            BACK TO DASHBOARD
        ========================================= */}
        <div className="mt-10">

          <Link
            to="/client-dashboard"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>

        </div>

      </section>

    </main>
  );
}

export default ClientProjects;