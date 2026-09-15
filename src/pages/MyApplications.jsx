import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modify application states
  const [editingApplication, setEditingApplication] =
    useState(null);

  const [editedProposal, setEditedProposal] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  // Cancel application state
  const [cancellingApplicationId, setCancellingApplicationId] =
    useState(null);

  // =========================================
  // FETCH STUDENT APPLICATIONS
  // =========================================
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log(
          "🔥 Loading student applications..."
        );

        console.log(
          "👤 Current Student UID:",
          user.uid
        );

        // =========================================
        // GET ALL PROJECTS
        // =========================================
        const projectsQuery = query(
          collection(db, "projects")
        );

        const projectsSnapshot =
          await getDocs(projectsQuery);

        console.log(
          "📦 Total projects found:",
          projectsSnapshot.size
        );

        const allApplications = [];

        // =========================================
        // CHECK APPLICATIONS INSIDE EACH PROJECT
        // =========================================
        for (const projectDoc of projectsSnapshot.docs) {
          const projectData =
            projectDoc.data();

          console.log(
            "🔍 Checking applications for project:",
            projectDoc.id
          );

          const applicationsRef =
            collection(
              db,
              "projects",
              projectDoc.id,
              "applications"
            );

          const applicationsSnapshot =
            await getDocs(
              applicationsRef
            );

          console.log(
            `📋 Applications found for ${projectDoc.id}:`,
            applicationsSnapshot.size
          );

          applicationsSnapshot.forEach(
            (applicationDoc) => {
              const applicationData =
                applicationDoc.data();

              // =========================================
              // ONLY CURRENT STUDENT APPLICATIONS
              // =========================================
              if (
                applicationData.studentId ===
                user.uid
              ) {
                allApplications.push({
                  id: applicationDoc.id,

                  projectId:
                    projectDoc.id,

                  // -----------------------------------------
                  // PROJECT INFORMATION
                  // -----------------------------------------
                  projectTitle:
                    applicationData.projectTitle ||
                    projectData.Project_Title ||
                    "Freelance Project",

                  budget:
                    applicationData.budget ||
                    projectData.Budget ||
                    "",

                  // -----------------------------------------
                  // APPLICATION INFORMATION
                  // -----------------------------------------
                  proposal:
                    applicationData.proposal ||
                    "",

                  status:
                    applicationData.status ||
                    "Pending",

                  appliedAt:
                    applicationData.appliedAt ||
                    null,

                  // -----------------------------------------
                  // STUDENT INFORMATION
                  // -----------------------------------------
                  studentId:
                    applicationData.studentId,
                });
              }
            }
          );
        }

        // =========================================
        // SORT LATEST APPLICATIONS FIRST
        // =========================================
        allApplications.sort((a, b) => {
          const dateA = a.appliedAt?.toDate
            ? a.appliedAt.toDate()
            : new Date(0);

          const dateB = b.appliedAt?.toDate
            ? b.appliedAt.toDate()
            : new Date(0);

          return dateB - dateA;
        });

        console.log(
          "✅ Student applications found:",
          allApplications.length
        );

        console.log(
          "📋 Student applications:",
          allApplications
        );

        setApplications(
          allApplications
        );
      } catch (err) {
        console.error(
          "❌ Error fetching applications:",
          err
        );

        console.error(
          "❌ Firebase error code:",
          err.code
        );

        console.error(
          "❌ Firebase error message:",
          err.message
        );

        setError(
          "Unable to load your applications. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  // =========================================
  // STATUS STYLE
  // =========================================
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "reviewing":
        return "bg-yellow-100 text-yellow-700";

      case "pending":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================
  // CHECK IF APPLICATION IS PENDING
  // =========================================
  const isPendingApplication = (status) => {
    return (
      status?.toLowerCase() === "pending"
    );
  };

  // =========================================
  // OPEN MODIFY FORM
  // =========================================
  const handleModifyApplication = (
    application
  ) => {
    if (
      !isPendingApplication(
        application.status
      )
    ) {
      return;
    }

    setError("");

    setEditingApplication(
      application
    );

    setEditedProposal(
      application.proposal || ""
    );
  };

  // =========================================
  // CLOSE MODIFY FORM
  // =========================================
  const handleCancelEdit = () => {
    if (savingEdit) {
      return;
    }

    setEditingApplication(null);
    setEditedProposal("");
  };

  // =========================================
  // SAVE MODIFIED APPLICATION
  // =========================================
  const handleSaveModification = async (
    e
  ) => {
    e.preventDefault();

    setError("");

    if (!user) {
      setError(
        "Please login again before modifying your application."
      );
      return;
    }

    if (!editingApplication) {
      return;
    }

    // -----------------------------------------
    // STATUS CHECK
    // -----------------------------------------
    if (
      !isPendingApplication(
        editingApplication.status
      )
    ) {
      setError(
        "Only pending applications can be modified."
      );
      return;
    }

    // -----------------------------------------
    // PROPOSAL VALIDATION
    // -----------------------------------------
    const trimmedProposal =
      editedProposal.trim();

    if (!trimmedProposal) {
      setError(
        "Please enter your proposal."
      );
      return;
    }

    if (
      trimmedProposal.length < 30
    ) {
      setError(
        "Proposal must contain at least 30 characters."
      );
      return;
    }

    if (
      trimmedProposal.length > 2000
    ) {
      setError(
        "Proposal cannot exceed 2000 characters."
      );
      return;
    }

    try {
      setSavingEdit(true);

      console.log(
        "✏️ Updating student application..."
      );

      console.log(
        "📌 Project ID:",
        editingApplication.projectId
      );

      console.log(
        "📌 Application ID:",
        editingApplication.id
      );

      const applicationRef = doc(
        db,
        "projects",
        editingApplication.projectId,
        "applications",
        editingApplication.id
      );

      // -----------------------------------------
      // UPDATE APPLICATION
      // -----------------------------------------
      await updateDoc(
        applicationRef,
        {
          proposal: trimmedProposal,
        }
      );

      console.log(
        "✅ Application updated successfully."
      );

      // -----------------------------------------
      // UPDATE LOCAL STATE
      // -----------------------------------------
      setApplications(
        (previousApplications) =>
          previousApplications.map(
            (application) =>
              application.id ===
                editingApplication.id &&
              application.projectId ===
                editingApplication.projectId
                ? {
                    ...application,
                    proposal:
                      trimmedProposal,
                  }
                : application
          )
      );

      setEditingApplication(null);
      setEditedProposal("");

      console.log(
        "✅ Application modification completed."
      );
    } catch (err) {
      console.error(
        "❌ Error modifying application:",
        err
      );

      console.error(
        "❌ Firebase error code:",
        err.code
      );

      console.error(
        "❌ Firebase error message:",
        err.message
      );

      if (
        err.code ===
        "permission-denied"
      ) {
        setError(
          "Permission denied. You can modify only your own pending application."
        );
      } else if (
        err.code ===
        "unauthenticated"
      ) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to modify your application. Please try again."
        );
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // =========================================
  // CANCEL / DELETE APPLICATION
  // =========================================
  const handleCancelApplication = async (
    application
  ) => {
    if (!user) {
      setError(
        "Please login again before cancelling your application."
      );
      return;
    }

    // -----------------------------------------
    // STATUS CHECK
    // -----------------------------------------
    if (
      !isPendingApplication(
        application.status
      )
    ) {
      setError(
        "Only pending applications can be cancelled."
      );
      return;
    }

    // -----------------------------------------
    // CONFIRMATION
    // -----------------------------------------
    const confirmed = window.confirm(
      `Are you sure you want to cancel your application for "${application.projectTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      setCancellingApplicationId(
        application.id
      );

      console.log(
        "🗑️ Cancelling student application..."
      );

      console.log(
        "📌 Project ID:",
        application.projectId
      );

      console.log(
        "📌 Application ID:",
        application.id
      );

      const applicationRef = doc(
        db,
        "projects",
        application.projectId,
        "applications",
        application.id
      );

      // -----------------------------------------
      // DELETE APPLICATION
      // -----------------------------------------
      await deleteDoc(
        applicationRef
      );

      console.log(
        "✅ Application cancelled successfully."
      );

      // -----------------------------------------
      // REMOVE FROM LOCAL STATE
      // -----------------------------------------
      setApplications(
        (previousApplications) =>
          previousApplications.filter(
            (item) =>
              !(
                item.id ===
                  application.id &&
                item.projectId ===
                  application.projectId
              )
          )
      );
    } catch (err) {
      console.error(
        "❌ Error cancelling application:",
        err
      );

      console.error(
        "❌ Firebase error code:",
        err.code
      );

      console.error(
        "❌ Firebase error message:",
        err.message
      );

      if (
        err.code ===
        "permission-denied"
      ) {
        setError(
          "Permission denied. You can cancel only your own pending application."
        );
      } else if (
        err.code ===
        "unauthenticated"
      ) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to cancel your application. Please try again."
        );
      }
    } finally {
      setCancellingApplicationId(
        null
      );
    }
  };

  // =========================================
  // LOADING
  // =========================================
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

            <div className="mb-4 text-4xl">
              ⏳
            </div>

            <p className="text-gray-600">
              Loading your applications...
            </p>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* =====================================
            PAGE HEADER
        ===================================== */}
        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Student Workspace
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            My Applications
          </h1>

          <p className="mt-3 text-gray-600">
            Track the freelance projects you have applied for.
          </p>

        </div>

        {/* =====================================
            ERROR
        ===================================== */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">

            <p className="font-semibold text-red-700">
              Unable to process application
            </p>

            <p className="mt-1 text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* =====================================
            NO APPLICATIONS
        ===================================== */}
        {!error &&
          applications.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

              <div className="mb-5 text-5xl">
                📋
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                No applications yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-gray-600">
                You have not applied for any freelance projects yet.
                Explore available projects and submit your first
                application.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/projects")
                }
                className="mt-7 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Browse Projects
              </button>

            </div>
          )}

        {/* =====================================
            APPLICATION LIST
        ===================================== */}
        {applications.length > 0 && (
          <div className="space-y-5">

            {applications.map(
              (application) => (
                <div
                  key={`${application.projectId}-${application.id}`}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  {/* =================================
                      APPLICATION HEADER
                  ================================= */}
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    {/* APPLICATION DETAILS */}
                    <div className="flex-1">

                      <h2 className="text-xl font-bold text-gray-900">
                        {application.projectTitle}
                      </h2>

                      <p className="mt-2 text-gray-600">
                        {application.proposal
                          ? application.proposal.length >
                            150
                            ? `${application.proposal.substring(
                                0,
                                150
                              )}...`
                            : application.proposal
                          : "Application submitted successfully."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">

                        {application.budget !==
                          "" && (
                          <span>
                            Budget: ₹
                            {application.budget}
                          </span>
                        )}

                        {application.appliedAt && (
                          <span>
                            Applied:{" "}
                            {application.appliedAt
                              .toDate
                              ? application.appliedAt
                                  .toDate()
                                  .toLocaleDateString()
                              : "Recently"}
                          </span>
                        )}

                      </div>

                    </div>

                    {/* STATUS */}
                    <div>
                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
                          application.status
                        )}`}
                      >
                        {application.status ||
                          "Pending"}
                      </span>
                    </div>

                  </div>

                  {/* =================================
                      ACTION BUTTONS
                  ================================= */}
                  <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-5">

                    {/* VIEW PROJECT */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/projects/${application.projectId}`
                        )
                      }
                      className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      View Project
                    </button>

                    {/* =================================
                        PENDING ACTIONS
                    ================================= */}
                    {isPendingApplication(
                      application.status
                    ) ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleModifyApplication(
                              application
                            )
                          }
                          disabled={
                            savingEdit ||
                            cancellingApplicationId ===
                              application.id
                          }
                          className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ✏️ Modify Application
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCancelApplication(
                              application
                            )
                          }
                          disabled={
                            savingEdit ||
                            cancellingApplicationId ===
                              application.id
                          }
                          className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {cancellingApplicationId ===
                          application.id
                            ? "Cancelling..."
                            : "🗑️ Cancel Application"}
                        </button>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">
                        🔒 Application locked
                      </span>
                    )}

                  </div>

                  {/* =================================
                      MODIFY APPLICATION FORM
                  ================================= */}
                  {editingApplication &&
                    editingApplication.id ===
                      application.id &&
                    editingApplication.projectId ===
                      application.projectId && (
                      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

                        <h3 className="text-lg font-bold text-gray-900">
                          ✏️ Modify Your Application
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          Update your proposal while the application
                          is still pending.
                        </p>

                        <form
                          onSubmit={
                            handleSaveModification
                          }
                          className="mt-5"
                        >

                          <label
                            htmlFor={`proposal-${application.id}`}
                            className="block text-sm font-semibold text-gray-700"
                          >
                            Your Proposal
                          </label>

                          <textarea
                            id={`proposal-${application.id}`}
                            value={
                              editedProposal
                            }
                            onChange={(e) =>
                              setEditedProposal(
                                e.target.value
                              )
                            }
                            rows={7}
                            maxLength={2000}
                            disabled={
                              savingEdit
                            }
                            className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                          />

                          <div className="mt-2 flex justify-between text-xs text-gray-400">

                            <span>
                              Minimum 30 characters
                            </span>

                            <span>
                              {
                                editedProposal.length
                              }
                              /2000
                            </span>

                          </div>

                          <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                            <button
                              type="submit"
                              disabled={
                                savingEdit
                              }
                              className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                            >
                              {savingEdit
                                ? "Saving Changes..."
                                : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleCancelEdit
                              }
                              disabled={
                                savingEdit
                              }
                              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Cancel
                            </button>

                          </div>

                        </form>

                      </div>
                    )}

                </div>
              )
            )}

          </div>
        )}

      </div>
    </main>
  );
}

export default MyApplications;