import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { user, profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    projectTitle: "",
    description: "",
    skills: [],
    budget: "",
    deadline: "",
    status: "Open",
  });

  const skillOptions = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Python",
    "Java",
    "C",
    "C++",
    "UI/UX Design",
  ];

  useEffect(() => {
    const loadProject = async () => {
      if (authLoading) {
        return;
      }

      if (!user || profile?.role !== "client") {
        navigate("/login", { replace: true });
        return;
      }

      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const projectRef = doc(
          db,
          "projects",
          projectId
        );

        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
          setError("Project not found.");
          setLoading(false);
          return;
        }

        const project = projectSnap.data();

        // Check whether this project belongs to logged-in client
        if (project.Client_ID !== user.uid) {
          setError(
            "You are not authorized to edit this project."
          );
          setLoading(false);
          return;
        }

        setFormData({
          projectTitle: project.Project_Title || "",
          description: project.Description || "",
          skills: Array.isArray(project.Required_Skills)
            ? project.Required_Skills
            : [],
          budget:
            project.Budget !== undefined &&
            project.Budget !== null
              ? String(project.Budget)
              : "",
          deadline: project.Deadline || "",
          status: project.Status || "Open",
        });
      } catch (error) {
        console.error(
          "Load Project Error:",
          error
        );

        setError(
          "Failed to load project. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [
    projectId,
    user,
    profile,
    authLoading,
    navigate,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSkillChange = (skill) => {
    setFormData((previous) => {
      const alreadySelected =
        previous.skills.includes(skill);

      return {
        ...previous,
        skills: alreadySelected
          ? previous.skills.filter(
              (item) => item !== skill
            )
          : [...previous.skills, skill],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      setError("Please login again.");
      return;
    }

    if (!formData.projectTitle.trim()) {
      setError("Please enter a project title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a project description.");
      return;
    }

    if (formData.skills.length === 0) {
      setError(
        "Please select at least one required skill."
      );
      return;
    }

    if (!formData.budget || Number(formData.budget) <= 0) {
      setError("Please enter a valid budget.");
      return;
    }

    if (!formData.deadline) {
      setError("Please select a deadline.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const projectRef = doc(
        db,
        "projects",
        projectId
      );

      // Re-check ownership before updating
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        setError("Project not found.");
        return;
      }

      const existingProject = projectSnap.data();

      if (existingProject.Client_ID !== user.uid) {
        setError(
          "You are not authorized to edit this project."
        );
        return;
      }

      await updateDoc(projectRef, {
        Project_Title:
          formData.projectTitle.trim(),

        Description:
          formData.description.trim(),

        Required_Skills:
          formData.skills,

        Budget:
          Number(formData.budget),

        Deadline:
          formData.deadline,

        Status:
          formData.status,
      });

      alert("Project updated successfully.");

      navigate("/client-projects", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Update Project Error:",
        error
      );

      setError(
        "Failed to update project. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/client-projects");
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-gray-600 mt-4">
            Loading project...
          </p>
        </div>
      </main>
    );
  }

  if (error && !formData.projectTitle) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-3xl mx-auto">

          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-600 hover:text-blue-600 font-medium mb-6"
          >
            ← Back to My Projects
          </button>

          <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              Unable to Edit Project
            </h1>

            <p className="text-red-600 mt-3">
              {error}
            </p>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="max-w-4xl mx-auto">

        {/* BACK */}
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-600 hover:text-blue-600 font-medium mb-6 transition-colors"
        >
          ← Back to My Projects
        </button>

        {/* HEADER */}
        <div className="mb-8">

          <p className="text-blue-600 font-semibold tracking-wide uppercase">
            Client Workspace
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            Edit Project
          </h1>

          <p className="text-gray-600 text-lg mt-3">
            Update your project details and requirements.
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8"
        >

          {/* PROJECT TITLE */}
          <div className="mb-6">

            <label
              htmlFor="projectTitle"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Project Title
            </label>

            <input
              id="projectTitle"
              name="projectTitle"
              type="text"
              value={formData.projectTitle}
              onChange={handleChange}
              placeholder="Enter project title"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

          </div>

          {/* DESCRIPTION */}
          <div className="mb-6">

            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Project Description
            </label>

            <textarea
              id="description"
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

          </div>

          {/* REQUIRED SKILLS */}
          <div className="mb-6">

            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Required Skills
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

              {skillOptions.map((skill) => (
                <label
                  key={skill}
                  className={`flex items-center gap-2 border rounded-xl px-3 py-3 cursor-pointer transition-all ${
                    formData.skills.includes(skill)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >

                  <input
                    type="checkbox"
                    checked={formData.skills.includes(
                      skill
                    )}
                    onChange={() =>
                      handleSkillChange(skill)
                    }
                    className="accent-blue-600"
                  />

                  <span className="text-sm font-medium">
                    {skill}
                  </span>

                </label>
              ))}

            </div>

          </div>

          {/* BUDGET + DEADLINE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* BUDGET */}
            <div>

              <label
                htmlFor="budget"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Budget (₹)
              </label>

              <input
                id="budget"
                name="budget"
                type="number"
                min="1"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Enter budget"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

            </div>

            {/* DEADLINE */}
            <div>

              <label
                htmlFor="deadline"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Deadline
              </label>

              <input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

            </div>

          </div>

          {/* STATUS */}
          <div className="mb-8">

            <label
              htmlFor="status"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Project Status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Open">
                Open
              </option>

              <option value="Closed">
                Closed
              </option>

            </select>

          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default EditProject;