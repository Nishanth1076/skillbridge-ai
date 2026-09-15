import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

function ClientApplications() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { user, profile, loading } = useAuth();

  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // STUDENT PROFILE STATE
  // =========================================
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [studentError, setStudentError] = useState("");

  // =========================================
  // LOAD PROJECT AND APPLICATIONS
  // =========================================
  useEffect(() => {
    const loadApplications = async () => {
      if (loading) {
        return;
      }

      // =========================================
      // AUTH CHECK
      // =========================================
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      // =========================================
      // ROLE CHECK
      // =========================================
      if (profile?.role !== "client") {
        navigate("/login", { replace: true });
        return;
      }

      // =========================================
      // PROJECT ID CHECK
      // =========================================
      if (!projectId) {
        setError("Project ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        console.log("🔥 Loading client project applications...");
        console.log("👤 Client UID:", user.uid);
        console.log("📌 Project ID:", projectId);

        // =========================================
        // GET PROJECT
        // =========================================
        const projectRef = doc(
          db,
          "projects",
          projectId
        );

        const projectSnapshot = await getDoc(
          projectRef
        );

        if (!projectSnapshot.exists()) {
          console.log("❌ Project not found.");

          setError(
            "The requested project could not be found."
          );

          setProject(null);
          setApplications([]);

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

        // =========================================
        // CLIENT OWNERSHIP CHECK
        // =========================================
        if (projectData.Client_ID !== user.uid) {
          console.log(
            "❌ This project does not belong to current client."
          );

          setError(
            "You are not authorized to view applications for this project."
          );

          setProject(null);
          setApplications([]);

          return;
        }

        setProject(projectData);

        // =========================================
        // GET APPLICATIONS
        // =========================================
        const applicationsRef = collection(
          db,
          "projects",
          projectId,
          "applications"
        );

        const applicationsSnapshot =
          await getDocs(applicationsRef);

        console.log(
          "📋 Total applications:",
          applicationsSnapshot.size
        );

        const applicationList =
          applicationsSnapshot.docs.map(
            (applicationDoc) => ({
              id: applicationDoc.id,
              ...applicationDoc.data(),
            })
          );

        // =========================================
        // SORT APPLICATIONS
        // =========================================
        applicationList.sort((a, b) => {
          const dateA =
            a.appliedAt?.toDate
              ? a.appliedAt.toDate()
              : new Date(0);

          const dateB =
            b.appliedAt?.toDate
              ? b.appliedAt.toDate()
              : new Date(0);

          return dateB - dateA;
        });

        console.log(
          "✅ Applications loaded:",
          applicationList
        );

        setApplications(applicationList);
      } catch (error) {
        console.error(
          "❌ Error loading applications:",
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
          "Unable to load applications. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [
    projectId,
    user,
    profile,
    loading,
    navigate,
  ]);

  // =========================================
  // VIEW STUDENT PROFILE
  // =========================================
  const handleViewStudent = async (studentId) => {
    if (!studentId) {
      setStudentError(
        "Student information is not available."
      );

      return;
    }

    try {
      setIsLoadingStudent(true);
      setStudentError("");
      setSelectedStudent(null);

      console.log(
        "👤 Loading student profile:",
        studentId
      );

      const studentRef = doc(
        db,
        "users",
        studentId
      );

      const studentSnapshot = await getDoc(
        studentRef
      );

      if (!studentSnapshot.exists()) {
        console.log(
          "❌ Student profile not found."
        );

        setStudentError(
          "Student profile could not be found."
        );

        return;
      }

      const studentData = {
        uid: studentSnapshot.id,
        ...studentSnapshot.data(),
      };

      console.log(
        "✅ Student profile loaded:",
        studentData
      );

      setSelectedStudent(studentData);
    } catch (error) {
      console.error(
        "❌ Error loading student profile:",
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

      setStudentError(
        "Unable to load student profile. Please try again."
      );
    } finally {
      setIsLoadingStudent(false);
    }
  };

  // =========================================
  // VIEW STUDENT RESUME
  // =========================================
  const handleViewResume = () => {
    if (!selectedStudent?.Resume_URL) {
      return;
    }

    window.open(
      selectedStudent.Resume_URL,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================
  // UPDATE APPLICATION STATUS
  // =========================================
  const handleApplicationStatus = async (
    applicationId,
    newStatus
  ) => {
    if (!applicationId || !projectId) {
      return;
    }

    const actionText =
      newStatus === "Accepted"
        ? "accept"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this application?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      console.log(
        `🔄 Updating application status to ${newStatus}...`
      );

      const applicationRef = doc(
        db,
        "projects",
        projectId,
        "applications",
        applicationId
      );

      await updateDoc(applicationRef, {
        status: newStatus,
      });

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: newStatus,
              }
            : application
        )
      );

      console.log(
        `✅ Application ${newStatus.toLowerCase()} successfully.`
      );
    } catch (error) {
      console.error(
        "❌ Error updating application status:",
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
        `Unable to ${actionText} this application. Please try again.`
      );
    }
  };

  // =========================================
  // CLOSE STUDENT PROFILE
  // =========================================
  const handleCloseStudentProfile = () => {
    setSelectedStudent(null);
    setStudentError("");
  };

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
  // AUTH LOADING
  // =========================================
  if (loading) {
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
  // PAGE LOADING
  // =========================================
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-gray-600">
            Loading applications...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12">

        {/* =====================================
            BACK BUTTON
        ===================================== */}
        <button
          type="button"
          onClick={() =>
            navigate("/client-projects")
          }
          className="mb-6 font-semibold text-blue-600 transition hover:text-blue-800"
        >
          ← Back to My Projects
        </button>

        {/* =====================================
            ERROR
        ===================================== */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-700">
              Unable to load applications
            </p>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/client-projects")
              }
              className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Back to My Projects
            </button>
          </div>
        )}

        {/* =====================================
            PROJECT HEADER
        ===================================== */}
        {!error && project && (
          <>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                <div>
                  <p className="font-semibold uppercase tracking-wide text-blue-600">
                    Client Workspace
                  </p>

                  <h1 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                    {project.Project_Title ||
                      "Untitled Project"}
                  </h1>

                  <p className="mt-3 text-gray-600">
                    Review students who have applied for this project.
                  </p>
                </div>

                {/* PROJECT STATUS */}
                <span
                  className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                    project.Status === "Open"
                      ? "bg-green-100 text-green-700"
                      : project.Status === "Closed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {project.Status || "Open"}
                </span>
              </div>

              {/* APPLICATION COUNT */}
              <div className="mt-7 border-t border-gray-100 pt-6">
                <p className="text-gray-600">
                  <span className="font-bold text-gray-900">
                    {applications.length}
                  </span>{" "}
                  {applications.length === 1
                    ? "student has"
                    : "students have"}{" "}
                  applied for this project.
                </p>
              </div>
            </div>

            {/* =====================================
                EMPTY APPLICATION STATE
            ===================================== */}
            {applications.length === 0 && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
                  📋
                </div>

                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  No Applications Yet
                </h2>

                <p className="mx-auto mt-3 max-w-md text-gray-600">
                  No students have applied for this project yet.
                  Applications will appear here when students submit their proposals.
                </p>
              </div>
            )}

            {/* =====================================
                APPLICATION LIST
            ===================================== */}
            {applications.length > 0 && (
              <div className="mt-6 space-y-5">

                {applications.map(
                  (application, index) => (
                    <div
                      key={application.id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >

                      {/* APPLICATION HEADER */}
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                        <div>
                          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                            Application {index + 1}
                          </p>

                          <h2 className="mt-2 text-xl font-bold text-gray-900">
                            Student Application
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            Student ID:{" "}
                            {application.studentId ||
                              "Not available"}
                          </p>
                        </div>

                        {/* STATUS */}
                        <span
                          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
                            application.status
                          )}`}
                        >
                          {application.status ||
                            "Pending"}
                        </span>
                      </div>

                      {/* APPLICATION DETAILS */}
                      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* PROJECT BUDGET */}
                        <div className="rounded-xl border border-gray-200 p-5">
                          <p className="text-sm text-gray-500">
                            Project Budget
                          </p>

                          <p className="mt-2 font-bold text-gray-900">
                            {application.budget !==
                              undefined &&
                            application.budget !==
                              null &&
                            application.budget !== ""
                              ? `₹${Number(
                                  application.budget
                                ).toLocaleString(
                                  "en-IN"
                                )}`
                              : "Not specified"}
                          </p>
                        </div>

                        {/* APPLIED DATE */}
                        <div className="rounded-xl border border-gray-200 p-5">
                          <p className="text-sm text-gray-500">
                            Applied Date
                          </p>

                          <p className="mt-2 font-semibold text-gray-900">
                            {application.appliedAt
                              ?.toDate
                              ? application.appliedAt
                                  .toDate()
                                  .toLocaleDateString(
                                    "en-IN"
                                  )
                              : "Recently"}
                          </p>
                        </div>
                      </div>

                      {/* PROPOSAL */}
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-gray-700">
                          Student Proposal
                        </p>

                        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
                          <p className="leading-7 text-gray-700">
                            {application.proposal ||
                              "No proposal provided."}
                          </p>
                        </div>
                      </div>

                      {/* =====================================
                          ACTION AREA
                      ===================================== */}
                      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                        {/* VIEW STUDENT */}
                        <button
                          type="button"
                          onClick={() =>
                            handleViewStudent(
                              application.studentId
                            )
                          }
                          disabled={
                            isLoadingStudent
                          }
                          className="rounded-lg border border-blue-600 px-6 py-2.5 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
                        >
                          {isLoadingStudent
                            ? "Loading..."
                            : "View Student"}
                        </button>

                        {/* ACCEPT */}
                        <button
                          type="button"
                          onClick={() =>
                            handleApplicationStatus(
                              application.id,
                              "Accepted"
                            )
                          }
                          disabled={
                            application.status ===
                              "Accepted" ||
                            application.status ===
                              "Rejected"
                          }
                          className="rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {application.status ===
                          "Accepted"
                            ? "Accepted"
                            : "Accept"}
                        </button>

                        {/* REJECT */}
                        <button
                          type="button"
                          onClick={() =>
                            handleApplicationStatus(
                              application.id,
                              "Rejected"
                            )
                          }
                          disabled={
                            application.status ===
                              "Accepted" ||
                            application.status ===
                              "Rejected"
                          }
                          className="rounded-lg bg-red-600 px-6 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {application.status ===
                          "Rejected"
                            ? "Rejected"
                            : "Reject"}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* =========================================
          STUDENT PROFILE MODAL
      ========================================= */}
      {(selectedStudent || studentError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-gray-200 p-6">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                  Student Profile
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {selectedStudent?.Name ||
                    "Student Details"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseStudentProfile
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600 transition hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            {/* STUDENT ERROR */}
            {studentError && (
              <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                  <p className="font-semibold text-red-700">
                    Unable to load student
                  </p>

                  <p className="mt-1 text-red-600">
                    {studentError}
                  </p>

                </div>
              </div>
            )}

            {/* STUDENT DETAILS */}
            {selectedStudent && (
              <div className="space-y-5 p-6">

                {/* BASIC INFORMATION */}
                <div className="rounded-xl border border-gray-200 p-5">

                  <h3 className="text-lg font-bold text-gray-900">
                    Basic Information
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-sm text-gray-500">
                        Name
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedStudent.Name ||
                          "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Email
                      </p>

                      <p className="mt-1 break-all font-semibold text-gray-900">
                        {selectedStudent.Email ||
                          "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Phone
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedStudent.Phone ||
                          "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Student ID
                      </p>

                      <p className="mt-1 break-all font-semibold text-gray-900">
                        {selectedStudent.Student_ID ||
                          selectedStudent.uid ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* EDUCATION */}
                <div className="rounded-xl border border-gray-200 p-5">

                  <h3 className="text-lg font-bold text-gray-900">
                    Education
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-sm text-gray-500">
                        College
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedStudent.College_Name ||
                          "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Department
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedStudent.Department ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SKILLS */}
                <div className="rounded-xl border border-gray-200 p-5">

                  <h3 className="text-lg font-bold text-gray-900">
                    Skills
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">

                    {Array.isArray(
                      selectedStudent.Skills
                    ) &&
                    selectedStudent.Skills.length >
                      0 ? (
                      selectedStudent.Skills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <p className="text-gray-500">
                        No skills provided.
                      </p>
                    )}
                  </div>
                </div>

                {/* RESUME */}
                <div className="rounded-xl border border-gray-200 p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Resume
                      </h3>

                      <p className="mt-2 break-all text-gray-600">
                        {selectedStudent.Resume ||
                          "No resume uploaded."}
                      </p>
                    </div>

                    {/* VIEW RESUME */}
                    {selectedStudent.Resume_URL ? (
                      <button
                        type="button"
                        onClick={handleViewResume}
                        className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                      >
                        View Resume
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-500">
                        Resume Not Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODAL FOOTER */}
            <div className="border-t border-gray-200 p-6 text-right">

              <button
                type="button"
                onClick={
                  handleCloseStudentProfile
                }
                className="rounded-lg bg-gray-900 px-6 py-2.5 font-semibold text-white transition hover:bg-gray-800"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ClientApplications;