import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

// =========================================
// LIVE BACKEND URL
// =========================================
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  const [project, setProject] = useState(null);
  const [proposal, setProposal] = useState("");

  // AI Recommendation state
  const [recommendation, setRecommendation] = useState("");
  const [generatingRecommendation, setGeneratingRecommendation] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // AI Proposal state
  const [generatingProposal, setGeneratingProposal] =
    useState(false);

  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // LOAD PROJECT FROM FIRESTORE
  // =========================================
  useEffect(() => {
    const loadProject = async () => {
      if (authLoading) {
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

        console.log("🔥 Loading project from Firestore...");
        console.log("📌 Project ID:", projectId);

        const projectRef = doc(
          db,
          "projects",
          projectId
        );

        const projectSnapshot = await getDoc(
          projectRef
        );

        if (!projectSnapshot.exists()) {
          console.log("❌ Project not found");

          setProject(null);
          setLoading(false);
          return;
        }

        const projectData = {
          id: projectSnapshot.id,
          ...projectSnapshot.data(),
        };

        console.log(
          "✅ Project loaded:",
          projectData
        );

        setProject(projectData);
      } catch (error) {
        console.error(
          "❌ Error loading project:",
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
          "Unable to load project details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, authLoading]);

  // =========================================
  // CHECK WHETHER STUDENT ALREADY APPLIED
  // =========================================
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (
        authLoading ||
        !user ||
        profile?.role !== "student" ||
        !projectId
      ) {
        return;
      }

      try {
        setCheckingApplication(true);

        console.log(
          "🔎 Checking existing application..."
        );

        console.log(
          "👤 Student UID:",
          user.uid
        );

        console.log(
          "📌 Project ID:",
          projectId
        );

        const applicationsRef = collection(
          db,
          "projects",
          projectId,
          "applications"
        );

        const applicationsSnapshot = await getDocs(
          applicationsRef
        );

        let foundApplication = false;

        applicationsSnapshot.forEach(
          (applicationDoc) => {
            const applicationData =
              applicationDoc.data();

            if (
              applicationData.studentId ===
              user.uid
            ) {
              foundApplication = true;

              console.log(
                "⚠️ Existing application found:",
                applicationDoc.id
              );
            }
          }
        );

        setAlreadyApplied(foundApplication);

        if (foundApplication) {
          console.log(
            "⚠️ Student has already applied for this project."
          );
        } else {
          console.log(
            "✅ Student has not applied yet."
          );
        }
      } catch (error) {
        console.error(
          "❌ Error checking existing application:",
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
      } finally {
        setCheckingApplication(false);
      }
    };

    checkExistingApplication();
  }, [
    projectId,
    user,
    profile,
    authLoading,
  ]);

  // =========================================
  // GENERATE AI PROPOSAL
  // =========================================
  const handleGenerateProposal = async () => {
    setError("");
    setSuccess("");

    if (authLoading) {
      setError(
        "Please wait while your login session is being verified."
      );
      return;
    }

    if (!user) {
      setError(
        "Please login as a student before generating a proposal."
      );
      return;
    }

    if (profile?.role !== "student") {
      setError(
        "Only student accounts can generate AI proposals."
      );
      return;
    }

    if (!project) {
      setError(
        "Project details not found."
      );
      return;
    }

    if (
      project.Status?.toLowerCase() !==
      "open"
    ) {
      setError(
        "AI proposal generation is available only for open projects."
      );
      return;
    }

    if (alreadyApplied) {
      setError(
        "You have already applied for this project."
      );
      return;
    }

    try {
      setGeneratingProposal(true);

      console.log(
        "🤖 Generating AI proposal..."
      );

      console.log(
        "👤 Student:",
        profile?.Name
      );

      console.log(
        "📌 Project:",
        project.Project_Title
      );

      const studentData = {
        name:
          profile?.Name ||
          "Student",

        skills:
          Array.isArray(profile?.Skills)
            ? profile.Skills
            : profile?.Skills || [],
      };

      const projectData = {
        title:
          project.Project_Title ||
          "Freelance Project",

        description:
          project.Description ||
          "",

        requiredSkills:
          Array.isArray(
            project.Required_Skills
          )
            ? project.Required_Skills
            : [],

        budget:
          project.Budget ||
          "",
      };

      console.log(
        "📦 AI Student Data:",
        studentData
      );

      console.log(
        "📦 AI Project Data:",
        projectData
      );

      // =========================================
      // LIVE RENDER BACKEND
      // =========================================
      const response = await fetch(
        `${API_BASE_URL}/api/ai/proposal`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            student: studentData,
            project: projectData,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "🤖 AI Backend Response:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to generate AI proposal."
        );
      }

      setProposal(
        data.proposal || ""
      );

      setSuccess(
        "AI proposal generated successfully. You can edit it before submitting."
      );

      console.log(
        "✅ AI proposal generated successfully."
      );
    } catch (error) {
      console.error(
        "❌ AI proposal generation error:",
        error
      );

      setError(
        error.message ||
          "Unable to generate AI proposal. Please try again."
      );
    } finally {
      setGeneratingProposal(false);
    }
  };

  // =========================================
  // GENERATE AI RECOMMENDATION
  // =========================================
  const handleGenerateRecommendation = async () => {
    setError("");
    setSuccess("");

    if (authLoading) {
      setError(
        "Please wait while your login session is being verified."
      );
      return;
    }

    if (!user) {
      setError(
        "Please login as a student before generating a recommendation."
      );
      return;
    }

    if (profile?.role !== "student") {
      setError(
        "Only student accounts can generate AI recommendations."
      );
      return;
    }

    if (!project) {
      setError(
        "Project details not found."
      );
      return;
    }

    if (
      project.Status?.toLowerCase() !==
      "open"
    ) {
      setError(
        "AI recommendation is available only for open projects."
      );
      return;
    }

    if (alreadyApplied) {
      setError(
        "You have already applied for this project."
      );
      return;
    }

    try {
      setGeneratingRecommendation(true);

      console.log(
        "🤖 Generating AI recommendation..."
      );

      console.log(
        "👤 Student skills:",
        profile?.Skills
      );

      console.log(
        "📌 Project:",
        project.Project_Title
      );

      const studentData = {
        skills:
          Array.isArray(profile?.Skills)
            ? profile.Skills
            : profile?.Skills || [],
      };

      const projectData = {
        title:
          project.Project_Title ||
          "Freelance Project",

        description:
          project.Description ||
          "",

        requiredSkills:
          Array.isArray(
            project.Required_Skills
          )
            ? project.Required_Skills
            : [],
      };

      console.log(
        "📦 Recommendation Student Data:",
        studentData
      );

      console.log(
        "📦 Recommendation Project Data:",
        projectData
      );

      // =========================================
      // LIVE RENDER BACKEND
      // =========================================
      const response = await fetch(
        `${API_BASE_URL}/api/ai/recommendation`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            student: studentData,
            project: projectData,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "🤖 AI Recommendation Response:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to generate AI recommendation."
        );
      }

      setRecommendation(
        data.recommendation || ""
      );

      setSuccess(
        "AI recommendation generated successfully."
      );

      console.log(
        "✅ AI recommendation generated successfully."
      );
    } catch (error) {
      console.error(
        "❌ AI recommendation generation error:",
        error
      );

      setError(
        error.message ||
          "Unable to generate AI recommendation. Please try again."
      );
    } finally {
      setGeneratingRecommendation(false);
    }
  };

  // =========================================
  // APPLY FOR PROJECT
  // =========================================
  const handleApply = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (authLoading) {
      setError(
        "Please wait while your login session is being verified."
      );
      return;
    }

    if (!user) {
      setError(
        "Please login as a student before applying."
      );
      return;
    }

    if (profile?.role !== "student") {
      setError(
        "Only student accounts can apply for projects."
      );
      return;
    }

    if (!project) {
      setError(
        "Project details not found."
      );
      return;
    }

    if (
      project.Status?.toLowerCase() !==
      "open"
    ) {
      setError(
        "This project is not currently open for applications."
      );
      return;
    }

    if (alreadyApplied) {
      setError(
        "You have already applied for this project."
      );
      return;
    }

    if (!proposal.trim()) {
      setError(
        "Please enter your proposal."
      );
      return;
    }

    if (proposal.trim().length < 30) {
      setError(
        "Proposal must contain at least 30 characters."
      );
      return;
    }

    try {
      setSubmitting(true);

      console.log(
        "🔥 Submitting project application..."
      );

      console.log(
        "👤 Student UID:",
        user.uid
      );

      console.log(
        "📌 Project ID:",
        project.id
      );

      const applicationsRef = collection(
        db,
        "projects",
        project.id,
        "applications"
      );

      const applicationsSnapshot = await getDocs(
        applicationsRef
      );

      const duplicateApplication =
        applicationsSnapshot.docs.some(
          (applicationDoc) => {
            const applicationData =
              applicationDoc.data();

            return (
              applicationData.studentId ===
              user.uid
            );
          }
        );

      if (duplicateApplication) {
        setAlreadyApplied(true);

        setError(
          "You have already applied for this project."
        );

        return;
      }

      const applicationData = {
        studentId: user.uid,

        projectId: project.id,

        projectTitle:
          project.Project_Title ||
          "Freelance Project",

        proposal: proposal.trim(),

        budget:
          project.Budget || "",

        status: "Pending",

        appliedAt: serverTimestamp(),
      };

      console.log(
        "📦 Application data:",
        applicationData
      );

      const applicationRef =
        await addDoc(
          applicationsRef,
          applicationData
        );

      console.log(
        "✅ Application successfully created:",
        applicationRef.id
      );

      // =========================================
      // SAVE AI REQUEST
      // =========================================
      try {
        console.log(
          "🤖 Saving AI Request to Firestore..."
        );

        const aiRequestData = {
          Student_ID: user.uid,

          Project_ID: project.id,

          Prompt: `Generate a professional freelance proposal for the student based on the project "${project.Project_Title || "Freelance Project"}". Student skills: ${
            Array.isArray(profile?.Skills)
              ? profile.Skills.join(", ")
              : profile?.Skills || "Not specified"
          }. Required project skills: ${
            Array.isArray(
              project.Required_Skills
            )
              ? project.Required_Skills.join(", ")
              : "Not specified"
          }. Project description: ${
            project.Description ||
            "Not specified"
          }`,

          Generated_Proposal:
            proposal.trim(),

          Recommendation:
            recommendation.trim() ||
            "Not generated",

          Generated_Date:
            serverTimestamp(),
        };

        console.log(
          "📦 AI Request data:",
          aiRequestData
        );

        const aiRequestRef =
          await addDoc(
            collection(
              db,
              "AI_Request"
            ),
            aiRequestData
          );

        console.log(
          "✅ AI Request successfully saved:",
          aiRequestRef.id
        );

        console.log(
          "🤖 AI Request document created successfully."
        );
      } catch (aiError) {
        console.error(
          "⚠️ AI Request could not be saved:",
          aiError
        );

        console.error(
          "⚠️ AI Request error code:",
          aiError.code
        );

        console.error(
          "⚠️ AI Request error message:",
          aiError.message
        );
      }

      setAlreadyApplied(true);

      setSuccess(
        "Application submitted successfully!"
      );

      setProposal("");

      setRecommendation("");

      setTimeout(() => {
        navigate("/my-applications");
      }, 1200);
    } catch (error) {
      console.error(
        "❌ Application submission error:",
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

      if (
        error.code ===
        "permission-denied"
      ) {
        setError(
          "Permission denied. Please check your Firestore rules."
        );
      } else if (
        error.code ===
        "unauthenticated"
      ) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to submit application. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================
  // AUTH LOADING
  // =========================================
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-gray-600">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // PROJECT LOADING
  // =========================================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-gray-600">
            Loading project...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // PROJECT NOT FOUND
  // =========================================
  if (!project) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            📁
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Project Not Found
          </h1>

          <p className="mt-3 text-gray-600">
            {error ||
              "The requested project could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/projects")
            }
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Projects
          </button>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() =>
            navigate("/projects")
          }
          className="mb-6 font-semibold text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Projects
        </button>

        {/* PROJECT DETAILS */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* HEADER */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Freelance Project
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                {project.Project_Title ||
                  "Untitled Project"}
              </h1>
            </div>

            {/* STATUS */}
            <div
              className={`rounded-full px-4 py-2 font-semibold ${
                project.Status?.toLowerCase() ===
                "open"
                  ? "bg-green-50 text-green-700"
                  : project.Status?.toLowerCase() ===
                    "closed"
                  ? "bg-red-50 text-red-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {project.Status ||
                "Open"}
            </div>

          </div>

          {/* DESCRIPTION */}
          <div className="mt-8">

            <h2 className="text-xl font-bold text-gray-900">
              Project Description
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              {project.Description ||
                "No project description available."}
            </p>

          </div>

          {/* PROJECT INFORMATION */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* SKILLS */}
            <div className="rounded-xl border border-gray-200 p-5">

              <p className="text-sm text-gray-500">
                Required Skills
              </p>

              {Array.isArray(
                project.Required_Skills
              ) &&
              project.Required_Skills.length >
                0 ? (
                <div className="mt-3 flex flex-wrap gap-2">

                  {project.Required_Skills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p className="mt-2 font-semibold text-gray-900">
                  Not specified
                </p>
              )}

            </div>

            {/* BUDGET */}
            <div className="rounded-xl border border-gray-200 p-5">

              <p className="text-sm text-gray-500">
                Budget
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {project.Budget !==
                  undefined &&
                project.Budget !== null &&
                project.Budget !== ""
                  ? `₹${Number(
                      project.Budget
                    ).toLocaleString(
                      "en-IN"
                    )}`
                  : "Not specified"}
              </p>

            </div>

            {/* DEADLINE */}
            <div className="rounded-xl border border-gray-200 p-5">

              <p className="text-sm text-gray-500">
                Deadline
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {project.Deadline ||
                  "Not specified"}
              </p>

            </div>

          </div>

          {/* CLIENT INFORMATION */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">

            <p className="text-sm font-medium text-gray-500">
              Project Posted By
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {project.Client_Name ||
                "Not specified"}
            </p>

          </div>

        </div>

        {/* APPLICATION FORM */}
        {profile?.role === "student" ? (

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-gray-900">
              Apply for this Project
            </h2>

            <p className="mt-2 text-gray-600">
              Submit a professional proposal to the client.
            </p>

            {/* CHECKING APPLICATION */}
            {checkingApplication && (
              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-700">
                Checking your application status...
              </div>
            )}

            {/* ALREADY APPLIED */}
            {alreadyApplied && (
              <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-yellow-800">

                <p className="font-semibold">
                  You have already applied for this project.
                </p>

                <p className="mt-1 text-sm">
                  You can track your application from My Applications.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/my-applications")
                  }
                  className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  View My Applications
                </button>

              </div>
            )}

            {/* ERROR */}
            {error && !alreadyApplied && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
                {success}
              </div>
            )}

            {/* APPLICATION FORM */}
            {!alreadyApplied &&
            !checkingApplication &&
            project.Status?.toLowerCase() ===
              "open" ? (

              <form
                onSubmit={handleApply}
                className="mt-6"
              >

                {/* AI RECOMMENDATION */}
                <div className="mb-8 rounded-xl border border-purple-200 bg-purple-50 p-5">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        🤖 AI Project Recommendation
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        Check whether this project matches your current skills.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleGenerateRecommendation
                      }
                      disabled={
                        generatingRecommendation ||
                        generatingProposal ||
                        submitting
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                        generatingRecommendation ||
                        generatingProposal ||
                        submitting
                          ? "cursor-not-allowed bg-purple-300"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                    >
                      {generatingRecommendation
                        ? "🤖 Checking..."
                        : "🤖 Get AI Recommendation"}
                    </button>

                  </div>

                  {/* RECOMMENDATION RESULT */}
                  {recommendation && (
                    <div className="mt-5 rounded-lg border border-purple-200 bg-white p-4">

                      <p className="text-sm font-semibold text-purple-700">
                        AI Recommendation
                      </p>

                      <p className="mt-2 leading-6 text-gray-700">
                        {recommendation}
                      </p>

                    </div>
                  )}

                </div>

                {/* PROPOSAL LABEL + AI BUTTON */}
                <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <label className="block text-sm font-semibold text-gray-700">
                    Your Proposal
                  </label>

                  <button
                    type="button"
                    onClick={
                      handleGenerateProposal
                    }
                    disabled={
                      generatingProposal ||
                      generatingRecommendation ||
                      submitting
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                      generatingProposal ||
                      generatingRecommendation ||
                      submitting
                        ? "cursor-not-allowed bg-purple-300"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {generatingProposal
                      ? "✨ Generating..."
                      : "✨ Generate AI Proposal"}
                  </button>

                </div>

                {/* AI INFORMATION */}
                <p className="mb-3 text-xs text-gray-500">
                  AI will create a proposal based on your skills and this project's requirements. You can edit the proposal before submitting.
                </p>

                <textarea
                  value={proposal}
                  onChange={(e) => {
                    setProposal(
                      e.target.value
                    );

                    setError("");
                    setSuccess("");
                  }}
                  rows={7}
                  maxLength={2000}
                  placeholder="Write a professional proposal explaining why you are suitable for this project, or use Generate AI Proposal..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <div className="mt-2 flex justify-between">

                  <p className="text-xs text-gray-400">
                    Minimum 30 characters
                  </p>

                  <p className="text-xs text-gray-400">
                    {proposal.length}/2000
                  </p>

                </div>

                {/* FORM BUTTONS */}
                <div className="mt-6 flex flex-col gap-4 sm:flex-row">

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      generatingProposal ||
                      generatingRecommendation
                    }
                    className={`rounded-lg px-7 py-3 font-semibold text-white transition ${
                      submitting ||
                      generatingProposal ||
                      generatingRecommendation
                        ? "cursor-not-allowed bg-blue-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Application"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/projects"
                      )
                    }
                    disabled={
                      submitting ||
                      generatingProposal ||
                      generatingRecommendation
                    }
                    className="rounded-lg border border-gray-300 px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            ) : null}

            {/* CLOSED PROJECT */}
            {!alreadyApplied &&
            !checkingApplication &&
            project.Status?.toLowerCase() !==
              "open" && (

              <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-yellow-800">
                This project is currently not open for applications.
              </div>

            )}

          </div>

        ) : (

          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">

            <p className="font-semibold text-blue-800">
              Login as a student to apply for this project.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Login as Student
            </button>

          </div>

        )}

      </div>
    </main>
  );
}

export default ProjectDetails;