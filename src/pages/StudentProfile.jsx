import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

function StudentProfile() {
  const { user, profile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // =====================================================
  // AVAILABLE SKILLS
  // =====================================================

  const availableSkills = [
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

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Student_ID: "",
    College_Name: "",
    Department: "",
    Skills: [],
    Resume: "",
    Resume_URL: "",
  });

  // =====================================================
  // NORMALIZE SKILLS
  // =====================================================

  const normalizeSkills = (skills) => {
    if (Array.isArray(skills)) {
      return skills
        .map((skill) => String(skill).trim())
        .filter((skill) => skill !== "");
    }

    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "");
    }

    return [];
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFormData({
      Name: profile.Name || "",
      Email: profile.Email || "",
      Phone: profile.Phone || "",
      Student_ID:
        profile.Student_ID ||
        profile.uid ||
        user?.uid ||
        "",
      College_Name: profile.College_Name || "",
      Department: profile.Department || "",
      Skills: normalizeSkills(profile.Skills),
      Resume: profile.Resume || "",
      Resume_URL: profile.Resume_URL || "",
    });
  }, [profile, user]);

  // =====================================================
  // NORMAL INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  // =====================================================
  // SKILL CHECKBOX CHANGE
  // =====================================================

  const handleSkillChange = (skill) => {
    setFormData((currentData) => {
      const currentSkills = Array.isArray(
        currentData.Skills
      )
        ? currentData.Skills
        : [];

      const skillAlreadySelected =
        currentSkills.includes(skill);

      const updatedSkills = skillAlreadySelected
        ? currentSkills.filter(
            (item) => item !== skill
          )
        : [...currentSkills, skill];

      return {
        ...currentData,
        Skills: updatedSkills,
      };
    });

    setErrorMessage("");
    setSuccessMessage("");
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!user) {
      setErrorMessage(
        "User is not logged in."
      );
      return;
    }

    if (!formData.Name.trim()) {
      setErrorMessage(
        "Please enter your name."
      );
      return;
    }

    if (!formData.Phone.trim()) {
      setErrorMessage(
        "Please enter your phone number."
      );
      return;
    }

    if (!formData.College_Name.trim()) {
      setErrorMessage(
        "Please enter your college name."
      );
      return;
    }

    if (!formData.Department.trim()) {
      setErrorMessage(
        "Please enter your department."
      );
      return;
    }

    try {
      setIsSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const skillsArray = normalizeSkills(
        formData.Skills
      );

      const studentRef = doc(
        db,
        "users",
        user.uid
      );

      await updateDoc(studentRef, {
        Name: formData.Name.trim(),
        Phone: formData.Phone.trim(),
        College_Name:
          formData.College_Name.trim(),
        Department:
          formData.Department.trim(),
        Skills: skillsArray,
      });

      setFormData((currentData) => ({
        ...currentData,
        Skills: skillsArray,
      }));

      setSuccessMessage(
        "Profile updated successfully."
      );

      setIsEditing(false);

      /*
        Reload after a short delay so the latest
        Firestore profile is loaded again.
      */
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      console.error(
        "Error updating profile:",
        error
      );

      setErrorMessage(
        "Unable to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // UPLOAD RESUME TO CLOUDINARY
  // =====================================================

  const handleResumeUpload = async (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!user) {
      setErrorMessage(
        "User is not logged in."
      );

      event.target.value = "";
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    // ===================================================
    // ALLOWED FILE TYPES
    // ===================================================

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];

    const fileName =
      file.name.toLowerCase();

    const hasValidMimeType =
      allowedTypes.includes(file.type);

    const hasValidExtension =
      allowedExtensions.some(
        (extension) =>
          fileName.endsWith(extension)
      );

    /*
      Some browsers may return an empty or different
      MIME type for DOC/DOCX files.

      Therefore extension + MIME type are checked.
    */
    if (
      !hasValidMimeType &&
      !hasValidExtension
    ) {
      setErrorMessage(
        "Please upload only PDF, DOC, or DOCX files."
      );

      event.target.value = "";
      return;
    }

    // ===================================================
    // MAXIMUM FILE SIZE = 5 MB
    // ===================================================

    const maxFileSize =
      5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setErrorMessage(
        "Resume file size must be less than 5 MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setIsUploadingResume(true);

      console.log(
        "===================================="
      );

      console.log(
        "Starting resume upload..."
      );

      console.log(
        "Resume file:",
        file.name
      );

      console.log(
        "Resume type:",
        file.type
      );

      console.log(
        "Resume size:",
        file.size
      );

      // =================================================
      // CLOUDINARY CONFIGURATION
      // =================================================

      const cloudName =
        import.meta.env
          .VITE_CLOUDINARY_CLOUD_NAME;

      const uploadPreset =
        import.meta.env
          .VITE_CLOUDINARY_UPLOAD_PRESET;

      if (
        !cloudName ||
        !uploadPreset
      ) {
        throw new Error(
          "Cloudinary configuration is missing. Please check the environment variables."
        );
      }

      console.log(
        "Cloudinary Cloud Name:",
        cloudName
      );

      console.log(
        "Cloudinary Upload Preset:",
        uploadPreset
      );

      // =================================================
      // CLOUDINARY RAW UPLOAD URL
      // =================================================

      const uploadUrl =
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

      // =================================================
      // CREATE FORM DATA
      // =================================================

      const uploadData =
        new FormData();

      uploadData.append(
        "file",
        file
      );

      uploadData.append(
        "upload_preset",
        uploadPreset
      );

      uploadData.append(
        "folder",
        "skillbridge/resumes"
      );

      console.log(
        "Uploading resume to Cloudinary..."
      );

      // =================================================
      // UPLOAD TO CLOUDINARY
      // =================================================

      const response =
        await fetch(uploadUrl, {
          method: "POST",
          body: uploadData,
        });

      const result =
        await response.json();

      console.log(
        "Cloudinary response:",
        result
      );

      // =================================================
      // CHECK CLOUDINARY RESPONSE
      // =================================================

      if (!response.ok) {
        console.error(
          "Cloudinary upload failed:",
          result
        );

        throw new Error(
          result?.error?.message ||
            "Resume upload failed."
        );
      }

      // =================================================
      // GET SECURE URL
      // =================================================

      const resumeUrl =
        result?.secure_url;

      if (!resumeUrl) {
        console.error(
          "Cloudinary response did not contain secure_url:",
          result
        );

        throw new Error(
          "Cloudinary did not return a resume URL."
        );
      }

      console.log(
        "Resume uploaded successfully."
      );

      console.log(
        "Resume URL:",
        resumeUrl
      );

      // =================================================
      // SAVE RESUME INFORMATION TO FIRESTORE
      // =================================================

      const studentRef = doc(
        db,
        "users",
        user.uid
      );

      await updateDoc(studentRef, {
        Resume: file.name,
        Resume_URL: resumeUrl,
      });

      console.log(
        "Resume information saved to Firestore."
      );

      console.log(
        "Student UID:",
        user.uid
      );

      console.log(
        "Saved Resume:",
        file.name
      );

      console.log(
        "Saved Resume_URL:",
        resumeUrl
      );

      // =================================================
      // UPDATE LOCAL FORM STATE
      // =================================================

      setFormData(
        (currentData) => ({
          ...currentData,
          Resume: file.name,
          Resume_URL: resumeUrl,
        })
      );

      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      setSuccessMessage(
        "Resume uploaded successfully."
      );

      /*
        Resume upload itself saves directly to Firestore,
        so no separate Save Changes click is required.
      */
    } catch (error) {
      console.error(
        "===================================="
      );

      console.error(
        "Resume upload error:",
        error
      );

      console.error(
        "===================================="
      );

      setErrorMessage(
        error?.message ||
          "Unable to upload resume. Please try again."
      );
    } finally {
      setIsUploadingResume(false);

      // Reset file input so the same file
      // can be selected again if needed.
      event.target.value = "";
    }
  };

  // =====================================================
  // VIEW RESUME
  // =====================================================

  const handleViewResume = () => {
    if (!formData.Resume_URL) {
      setErrorMessage(
        "No resume file is available. Please upload your resume again."
      );

      return;
    }

    try {
      const resumeWindow =
        window.open(
          formData.Resume_URL,
          "_blank",
          "noopener,noreferrer"
        );

      if (!resumeWindow) {
        setErrorMessage(
          "Unable to open the resume. Please allow pop-ups for this website."
        );
      }
    } catch (error) {
      console.error(
        "Resume view error:",
        error
      );

      setErrorMessage(
        "Unable to open the resume."
      );
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        Name: profile.Name || "",
        Email: profile.Email || "",
        Phone: profile.Phone || "",
        Student_ID:
          profile.Student_ID ||
          profile.uid ||
          user?.uid ||
          "",
        College_Name:
          profile.College_Name || "",
        Department:
          profile.Department || "",
        Skills: normalizeSkills(
          profile.Skills
        ),
        Resume:
          profile.Resume || "",
        Resume_URL:
          profile.Resume_URL || "",
      });
    }

    setIsEditing(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your personal information,
            education, skills and resume.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Profile Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

              <div className="flex items-center gap-4">

                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {formData.Name
                      ? formData.Name
                          .charAt(0)
                          .toUpperCase()
                      : "S"}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formData.Name ||
                      "Student"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Student
                  </p>

                  <p className="text-sm text-gray-600 mt-1 break-all">
                    {formData.Email}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage("");
                    setErrorMessage("");
                    setIsEditing(true);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">

            {isEditing ? (

              /* =================================================
                 EDIT PROFILE
              ================================================= */

              <form
                onSubmit={handleSaveProfile}
              >
                <div className="space-y-8">

                  {/* Basic Information */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>

                        <input
                          type="text"
                          name="Name"
                          value={
                            formData.Name
                          }
                          onChange={
                            handleChange
                          }
                          required
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>

                        <input
                          type="email"
                          name="Email"
                          value={
                            formData.Email
                          }
                          disabled
                          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500 cursor-not-allowed"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>

                        <input
                          type="tel"
                          name="Phone"
                          value={
                            formData.Phone
                          }
                          onChange={
                            handleChange
                          }
                          required
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {/* Student ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student ID
                        </label>

                        <input
                          type="text"
                          name="Student_ID"
                          value={
                            formData.Student_ID
                          }
                          disabled
                          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500 cursor-not-allowed"
                        />
                      </div>

                    </div>
                  </section>

                  {/* Education */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Education
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* College */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          College
                        </label>

                        <input
                          type="text"
                          name="College_Name"
                          value={
                            formData.College_Name
                          }
                          onChange={
                            handleChange
                          }
                          required
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>

                        <input
                          type="text"
                          name="Department"
                          value={
                            formData.Department
                          }
                          onChange={
                            handleChange
                          }
                          required
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                    </div>
                  </section>

                  {/* Skills */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Skills
                    </h3>

                    <p className="text-sm text-gray-500 mb-4">
                      Select the skills you have.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border border-gray-200 rounded-xl p-5 bg-gray-50">

                      {availableSkills.map(
                        (skill) => {
                          const isSelected =
                            formData.Skills.includes(
                              skill
                            );

                          return (
                            <label
                              key={skill}
                              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 bg-white hover:border-blue-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  isSelected
                                }
                                onChange={() =>
                                  handleSkillChange(
                                    skill
                                  )
                                }
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                              />

                              <span
                                className={`text-sm font-medium ${
                                  isSelected
                                    ? "text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {skill}
                              </span>
                            </label>
                          );
                        }
                      )}

                    </div>

                    {/* Selected skill count */}
                    <p className="mt-3 text-sm text-gray-500">
                      {formData.Skills.length}{" "}
                      skill
                      {formData.Skills.length !==
                      1
                        ? "s"
                        : ""}{" "}
                      selected
                    </p>
                  </section>

                  {/* Resume */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Resume
                    </h3>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                      {/* Current Resume */}
                      {formData.Resume ? (
                        <div className="mb-5">
                          <p className="text-sm font-medium text-gray-700">
                            Current Resume
                          </p>

                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3">

                            <div className="flex-1 rounded-lg bg-white border border-gray-200 px-4 py-3">
                              <p className="text-sm text-gray-800 break-all">
                                {
                                  formData.Resume
                                }
                              </p>
                            </div>

                            {formData.Resume_URL && (
                              <button
                                type="button"
                                onClick={
                                  handleViewResume
                                }
                                className="px-4 py-2.5 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
                              >
                                View Resume
                              </button>
                            )}

                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-5">
                          No resume uploaded yet.
                        </p>
                      )}

                      {/* Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Resume
                        </label>

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={
                            handleResumeUpload
                          }
                          disabled={
                            isUploadingResume
                          }
                          className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                          Accepted formats:
                          PDF, DOC, DOCX.
                          Maximum size:
                          5 MB.
                        </p>

                        {isUploadingResume && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>

                            <span>
                              Uploading
                              resume...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Form Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">

                    <button
                      type="submit"
                      disabled={
                        isSaving ||
                        isUploadingResume
                      }
                      className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleCancelEdit
                      }
                      disabled={
                        isSaving ||
                        isUploadingResume
                      }
                      className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>

                  </div>

                </div>
              </form>

            ) : (

              /* =================================================
                 VIEW PROFILE
              ================================================= */

              <div className="space-y-8">

                {/* Basic Information */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>
                      <p className="text-sm text-gray-500">
                        Name
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {formData.Name ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Email
                      </p>

                      <p className="mt-1 font-medium text-gray-900 break-all">
                        {formData.Email ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Phone
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {formData.Phone ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Student ID
                      </p>

                      <p className="mt-1 font-medium text-gray-900 break-all">
                        {formData.Student_ID ||
                          "-"}
                      </p>
                    </div>

                  </div>
                </section>

                {/* Education */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Education
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>
                      <p className="text-sm text-gray-500">
                        College
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {formData.College_Name ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Department
                      </p>

                      <p className="mt-1 font-medium text-gray-900">
                        {formData.Department ||
                          "-"}
                      </p>
                    </div>

                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Skills
                  </h3>

                  {formData.Skills.length >
                  0 ? (
                    <div className="flex flex-wrap gap-2">

                      {formData.Skills.map(
                        (
                          skill,
                          index
                        ) => (
                          <span
                            key={`${skill}-${index}`}
                            className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No skills added.
                    </p>
                  )}
                </section>

                {/* Resume */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Resume
                  </h3>

                  {formData.Resume ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>
                          <p className="text-sm text-gray-500">
                            Resume file
                          </p>

                          <p className="mt-1 font-medium text-gray-900 break-all">
                            {
                              formData.Resume
                            }
                          </p>
                        </div>

                        {formData.Resume_URL ? (
                          <button
                            type="button"
                            onClick={
                              handleViewResume
                            }
                            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                          >
                            View Resume
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSuccessMessage(
                                ""
                              );
                              setErrorMessage(
                                "Resume file record exists, but the resume URL is missing. Please edit your profile and upload the resume again."
                              );
                              setIsEditing(
                                true
                              );
                            }}
                            className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-600 font-medium hover:bg-gray-300 transition"
                          >
                            Upload Again
                          </button>
                        )}

                      </div>

                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">

                      <p className="text-gray-500">
                        No resume uploaded yet.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setSuccessMessage("");
                          setErrorMessage("");
                          setIsEditing(true);
                        }}
                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Upload Resume
                      </button>

                    </div>
                  )}
                </section>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;