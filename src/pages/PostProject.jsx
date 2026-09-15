import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

function PostProject() {
  const navigate = useNavigate();

  const { user, profile, loading } = useAuth();

  const [formData, setFormData] = useState({
    projectTitle: "",
    description: "",
    skills: [],
    budget: "",
    deadline: "",
    status: "Open",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =========================================
  // SKILL OPTIONS
  // =========================================
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
    "UI/UX Design",
    "Figma",
    "Machine Learning",
    "Data Analysis",
  ];

  // =========================================
  // INPUT CHANGE
  // =========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));

    setSuccessMessage("");
  };

  // =========================================
  // SKILL CHANGE
  // =========================================
  const handleSkillChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          skills: [...prev.skills, value],
        };
      }

      return {
        ...prev,
        skills: prev.skills.filter((skill) => skill !== value),
      };
    });

    setErrors((prev) => ({
      ...prev,
      skills: "",
      submit: "",
    }));

    setSuccessMessage("");
  };

  // =========================================
  // VALIDATION
  // =========================================
  const validateForm = () => {
    const newErrors = {};

    // Project title
    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = "Project title is required.";
    } else if (formData.projectTitle.trim().length < 5) {
      newErrors.projectTitle =
        "Project title must contain at least 5 characters.";
    }

    // Description
    if (!formData.description.trim()) {
      newErrors.description = "Project description is required.";
    } else if (formData.description.trim().length < 30) {
      newErrors.description =
        "Description must contain at least 30 characters.";
    }

    // Skills
    if (formData.skills.length === 0) {
      newErrors.skills = "Please select at least one required skill.";
    }

    // Budget
    if (!formData.budget) {
      newErrors.budget = "Budget is required.";
    } else if (Number(formData.budget) <= 0) {
      newErrors.budget = "Budget must be greater than zero.";
    }

    // Deadline
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required.";
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.deadline = "Deadline cannot be in the past.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================
  // SUBMIT PROJECT
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔥 FORM SUBMITTED");
    console.log("🔥 Current Firebase User:", user);
    console.log("🔥 Current Client Profile:", profile);
    console.log("🔥 Current Form Data:", formData);

    setErrors({});
    setSuccessMessage("");

    // =========================================
    // CHECK FIREBASE AUTH LOADING
    // =========================================
    if (loading) {
      setErrors({
        submit: "Please wait while your login session is being verified.",
      });

      return;
    }

    // =========================================
    // CHECK CLIENT LOGIN
    // =========================================
    if (!user) {
      console.log("❌ FIREBASE USER NOT FOUND");

      setErrors({
        submit: "Please login as a client before posting a project.",
      });

      return;
    }

    // =========================================
    // CHECK CLIENT ROLE
    // =========================================
    if (profile?.role !== "client") {
      console.log("❌ USER IS NOT A CLIENT");

      setErrors({
        submit: "Only client accounts can post projects.",
      });

      return;
    }

    console.log("✅ CLIENT AUTHENTICATION VERIFIED");
    console.log("✅ CLIENT UID:", user.uid);

    // =========================================
    // FORM VALIDATION
    // =========================================
    if (!validateForm()) {
      console.log("❌ FORM VALIDATION FAILED");

      return;
    }

    console.log("✅ FORM VALIDATION PASSED");

    try {
      setIsSubmitting(true);

      // =========================================
      // PROJECT DATA
      // =========================================
      const projectData = {
        Client_ID: user.uid,

        Project_Title: formData.projectTitle.trim(),

        Description: formData.description.trim(),

        Required_Skills: formData.skills,

        Budget: Number(formData.budget),

        Deadline: formData.deadline,

        Status: formData.status,

        Created_At: serverTimestamp(),
      };

      console.log("📦 PROJECT DATA:", projectData);

      console.log("🚀 Sending project to Firestore...");

      // =========================================
      // SAVE PROJECT
      // =========================================
      const projectRef = await addDoc(
        collection(db, "projects"),
        projectData
      );

      console.log(
        "✅ PROJECT SUCCESSFULLY CREATED:",
        projectRef.id
      );

      // =========================================
      // SUCCESS MESSAGE
      // =========================================
      setSuccessMessage(
        "Project posted successfully!"
      );

      // =========================================
      // RESET FORM
      // =========================================
      setFormData({
        projectTitle: "",
        description: "",
        skills: [],
        budget: "",
        deadline: "",
        status: "Open",
      });

      // =========================================
      // REDIRECT
      // =========================================
      setTimeout(() => {
        navigate("/client-projects");
      }, 1500);

    } catch (error) {
      console.error(
        "❌ PROJECT POSTING ERROR:",
        error
      );

      console.error(
        "❌ ERROR CODE:",
        error.code
      );

      console.error(
        "❌ ERROR MESSAGE:",
        error.message
      );

      let errorMessage =
        "Unable to post project. Please try again.";

      if (error.code === "permission-denied") {
        errorMessage =
          "Permission denied. Please check your Firestore rules.";
      } else if (error.code === "unauthenticated") {
        errorMessage =
          "Your login session has expired. Please login again.";
      } else if (error.code === "network-request-failed") {
        errorMessage =
          "Network error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({
        submit: errorMessage,
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // LOADING SCREEN
  // =========================================
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-600">
            Checking your client account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-4xl">

        {/* =========================================
            HEADER
        ========================================= */}
        <div className="mb-10 text-center">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Project Module
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900 md:text-5xl">
            Post a New Project
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Share your project requirements and connect
            with talented students who have the right skills.
          </p>

        </div>

        {/* =========================================
            FORM
        ========================================= */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >

          {/* =========================================
              ERROR MESSAGE
          ========================================= */}
          {errors.submit && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errors.submit}
            </div>
          )}

          {/* =========================================
              SUCCESS MESSAGE
          ========================================= */}
          {successMessage && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {successMessage}
            </div>
          )}

          {/* =========================================
              PROJECT DETAILS
          ========================================= */}
          <section className="mb-10">

            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Project Details
            </h2>

            {/* PROJECT TITLE */}
            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Project Title *
              </label>

              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                placeholder="Example: Build a Student Portfolio Website"
                maxLength={100}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
                  errors.projectTitle
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-600"
                }`}
              />

              {errors.projectTitle && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.projectTitle}
                </p>
              )}

            </div>

            {/* DESCRIPTION */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Project Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project, requirements and expected outcome..."
                rows={6}
                maxLength={1000}
                className={`w-full resize-none rounded-lg border px-4 py-3 outline-none transition ${
                  errors.description
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-600"
                }`}
              />

              <div className="mt-2 flex justify-between">

                {errors.description ? (
                  <p className="text-sm text-red-500">
                    {errors.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    Minimum 30 characters
                  </p>
                )}

                <p className="text-sm text-gray-400">
                  {formData.description.length}/1000
                </p>

              </div>

            </div>

          </section>

          {/* =========================================
              REQUIRED SKILLS
          ========================================= */}
          <section className="mb-10">

            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Required Skills *
            </h2>

            <p className="mb-5 text-sm text-gray-500">
              Select the skills required to complete this project.
            </p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">

              {skillOptions.map((skill) => (
                <label
                  key={skill}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                    formData.skills.includes(skill)
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >

                  <input
                    type="checkbox"
                    value={skill}
                    checked={formData.skills.includes(skill)}
                    onChange={handleSkillChange}
                    className="h-4 w-4 accent-blue-600"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    {skill}
                  </span>

                </label>
              ))}

            </div>

            {errors.skills && (
              <p className="mt-2 text-sm text-red-500">
                {errors.skills}
              </p>
            )}

          </section>

          {/* =========================================
              PROJECT REQUIREMENTS
          ========================================= */}
          <section className="mb-10">

            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Project Requirements
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              {/* BUDGET */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Budget (₹) *
                </label>

                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Example: 5000"
                  min="1"
                  className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
                    errors.budget
                      ? "border-red-500"
                      : "border-gray-300 focus:border-blue-600"
                  }`}
                />

                {errors.budget && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.budget}
                  </p>
                )}

              </div>

              {/* DEADLINE */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Deadline *
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
                    errors.deadline
                      ? "border-red-500"
                      : "border-gray-300 focus:border-blue-600"
                  }`}
                />

                {errors.deadline && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.deadline}
                  </p>
                )}

              </div>

            </div>

          </section>

          {/* =========================================
              PROJECT STATUS
          ========================================= */}
          <section className="mb-10">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Project Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="Open">
                Open
              </option>

              <option value="Draft">
                Draft
              </option>
            </select>

            <p className="mt-2 text-xs text-gray-500">
              Open projects can be viewed and applied for by students.
            </p>

          </section>

          {/* =========================================
              POST BUTTON
          ========================================= */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-lg py-3 font-semibold transition ${
              isSubmitting
                ? "cursor-wait bg-blue-400 text-white"
                : "bg-blue-600 text-white hover:-translate-y-1 hover:bg-blue-700"
            }`}
          >
            {isSubmitting
              ? "Posting Project..."
              : "Post Project"}
          </button>

        </form>

        {/* =========================================
            BACK TO PROJECTS
        ========================================= */}
        <div className="mt-8 text-center">

          <Link
            to="/projects"
            className="font-semibold text-blue-600 transition hover:text-blue-700"
          >
            ← Back to Projects
          </Link>

        </div>

      </div>
    </main>
  );
}

export default PostProject;