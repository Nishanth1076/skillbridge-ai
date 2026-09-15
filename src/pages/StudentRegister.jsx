import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function StudentRegister() {
  const navigate = useNavigate();

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    collegeName: "",
    department: "",
    resume: "",
    password: "",
    confirmPassword: "",
  });

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

  const [selectedSkills, setSelectedSkills] =
    useState([]);

  // =====================================================
  // OTHER STATES
  // =====================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // HANDLE SKILL CHECKBOX
  // =====================================================

  const handleSkillChange = (skill) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter(
          (item) => item !== skill
        );
      }

      return [...prev, skill];
    });

    setError("");
    setSuccess("");
  };

  // =====================================================
  // HANDLE RESUME
  // =====================================================

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload your resume as PDF, DOC, or DOCX."
      );

      e.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Resume file size must be less than 5 MB."
      );

      e.target.value = "";

      return;
    }

    setFormData((prev) => ({
      ...prev,
      resume: file.name,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const {
      fullName,
      email,
      phoneNumber,
      collegeName,
      department,
      resume,
      password,
      confirmPassword,
    } = formData;

    // ---------------------------------------------------
    // NAME
    // ---------------------------------------------------

    if (!fullName.trim()) {
      return "Please enter your full name.";
    }

    if (fullName.trim().length < 3) {
      return "Full name must contain at least 3 characters.";
    }

    // ---------------------------------------------------
    // EMAIL
    // ---------------------------------------------------

    if (!email.trim()) {
      return "Please enter your email address.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    // ---------------------------------------------------
    // PHONE
    // ---------------------------------------------------

    if (!phoneNumber.trim()) {
      return "Please enter your phone number.";
    }

    if (
      !/^[0-9]{10}$/.test(
        phoneNumber.trim()
      )
    ) {
      return "Please enter a valid 10-digit phone number.";
    }

    // ---------------------------------------------------
    // COLLEGE
    // ---------------------------------------------------

    if (!collegeName.trim()) {
      return "Please enter your college name.";
    }

    // ---------------------------------------------------
    // DEPARTMENT
    // ---------------------------------------------------

    if (!department) {
      return "Please select your department.";
    }

    // ---------------------------------------------------
    // SKILLS
    // ---------------------------------------------------

    if (selectedSkills.length === 0) {
      return "Please select at least one skill.";
    }

    // ---------------------------------------------------
    // RESUME
    // ---------------------------------------------------

    if (!resume) {
      return "Please upload your resume.";
    }

    // ---------------------------------------------------
    // PASSWORD
    // ---------------------------------------------------

    if (!password) {
      return "Please create a password.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    // ---------------------------------------------------
    // CONFIRM PASSWORD
    // ---------------------------------------------------

    if (!confirmPassword) {
      return "Please confirm your password.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  // =====================================================
  // SUBMIT FORM
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------------
    // STEP 1: VALIDATE FORM
    // ---------------------------------------------------

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // -------------------------------------------------
      // STEP 2: CLEAN EMAIL
      // -------------------------------------------------

      const email =
        formData.email.trim().toLowerCase();

      // -------------------------------------------------
      // STEP 3: CREATE FIREBASE AUTH ACCOUNT
      // -------------------------------------------------

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          formData.password
        );

      // -------------------------------------------------
      // STEP 4: GET FIREBASE USER
      // -------------------------------------------------

      const firebaseUser =
        userCredential.user;

      console.log(
        "Firebase student account created:",
        firebaseUser.uid
      );

      // -------------------------------------------------
      // STEP 5: CREATE FIRESTORE STUDENT PROFILE
      // -------------------------------------------------

      await setDoc(
        doc(
          db,
          "users",
          firebaseUser.uid
        ),
        {
          role: "student",

          Student_ID:
            firebaseUser.uid,

          Name:
            formData.fullName.trim(),

          Email:
            email,

          Phone:
            formData.phoneNumber.trim(),

          College_Name:
            formData.collegeName.trim(),

          Department:
            formData.department,

          // Selected checkbox skills
          Skills:
            selectedSkills,

          Resume:
            formData.resume || "",

          Created_At:
            serverTimestamp(),
        }
      );

      // -------------------------------------------------
      // STEP 6: SUCCESS
      // -------------------------------------------------

      setIsSubmitting(false);

      setSuccess(
        "Your student account has been created successfully."
      );

      // -------------------------------------------------
      // STEP 7: REDIRECT TO LOGIN
      // -------------------------------------------------

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error(
        "Student registration error:",
        error
      );

      setIsSubmitting(false);

      // -------------------------------------------------
      // FIREBASE ERROR HANDLING
      // -------------------------------------------------

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        setError(
          "An account already exists with this email address."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        setError(
          "Please enter a valid email address."
        );
      } else if (
        error.code ===
        "auth/weak-password"
      ) {
        setError(
          "Password is too weak. Please use a stronger password."
        );
      } else if (
        error.code ===
        "auth/network-request-failed"
      ) {
        setError(
          "Network error. Please check your internet connection."
        );
      } else if (
        error.code ===
          "permission-denied" ||
        error.code ===
          "firestore/permission-denied"
      ) {
        setError(
          "Account created, but student profile could not be saved. Please check Firestore rules."
        );
      } else {
        setError(
          "Something went wrong while creating your account."
        );
      }
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 sm:px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* =================================================
            BRAND / HEADER
        ================================================= */}

        <div className="text-center mb-10">

          <Link
            to="/"
            className="inline-flex items-center justify-center text-2xl font-bold tracking-tight text-gray-900"
          >
            SkillBridge
            <span className="text-blue-600 ml-1">
              AI
            </span>
          </Link>

          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mt-6">
            Student Registration
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Create your student account
          </h1>

          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Build your profile, showcase your skills and discover
            freelance opportunities through SkillBridge AI.
          </p>

        </div>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* CARD HEADER */}

          <div className="px-6 sm:px-10 py-7 border-b border-gray-100">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                🎓
              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Student Information
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Tell us about yourself and your skills.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-10"
          >

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <div>

              <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Personal Information
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter your basic contact information.
                </p>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* FULL NAME */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                {/* PHONE */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                {/* COLLEGE */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    College Name
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="Enter your college name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                {/* DEPARTMENT */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  >

                    <option value="">
                      Select your department
                    </option>

                    <option value="BCA">
                      BCA
                    </option>

                    <option value="BSc Computer Science">
                      BSc Computer Science
                    </option>

                    <option value="BSc IT">
                      BSc Information Technology
                    </option>

                    <option value="BE Computer Science">
                      BE Computer Science
                    </option>

                    <option value="BTech Information Technology">
                      BTech Information Technology
                    </option>

                    <option value="MCA">
                      MCA
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

              </div>

            </div>

            {/* =================================================
                SKILLS & RESUME
            ================================================= */}

            <div className="mt-10 pt-8 border-t border-gray-100">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Skills & Resume
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Select the skills you can offer to clients and upload your resume.
                </p>

              </div>

              {/* =================================================
                  SKILLS CHECKBOXES
              ================================================= */}

              <div>

                <div className="flex items-center justify-between mb-3">

                  <label className="block text-sm font-semibold text-gray-700">
                    Skills
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <span className="text-xs text-gray-400">
                    Select your skills
                  </span>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border border-gray-200 rounded-xl p-5 bg-gray-50">

                  {availableSkills.map(
                    (skill) => {
                      const isSelected =
                        selectedSkills.includes(
                          skill
                        );

                      return (
                        <label
                          key={skill}
                          className={`
                            flex
                            items-center
                            gap-3
                            rounded-lg
                            border
                            px-4
                            py-3
                            cursor-pointer
                            transition-all
                            duration-200

                            ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white hover:border-blue-300"
                            }
                          `}
                        >

                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleSkillChange(
                                skill
                              )
                            }
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />

                          <span
                            className={`
                              text-sm
                              font-medium
                              ${
                                isSelected
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }
                            `}
                          >
                            {skill}
                          </span>

                        </label>
                      );
                    }
                  )}

                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {selectedSkills.length}{" "}
                  skill
                  {selectedSkills.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>

              </div>

              {/* =================================================
                  RESUME
              ================================================= */}

              <div className="mt-6">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resume
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-7 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all duration-200">

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />

                  <div className="text-3xl mb-3">
                    📄
                  </div>

                  {formData.resume ? (
                    <>
                      <p className="font-semibold text-gray-900 break-all">
                        {formData.resume}
                      </p>

                      <p className="text-sm text-green-600 mt-1">
                        Resume selected successfully
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-900">
                        Upload your resume
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        PDF, DOC or DOCX · Maximum 5 MB
                      </p>
                    </>
                  )}

                </label>

              </div>

            </div>

            {/* =================================================
                ACCOUNT SECURITY
            ================================================= */}

            <div className="mt-10 pt-8 border-t border-gray-100">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Account Security
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Create a secure password for your account.
                </p>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* PASSWORD */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-blue-600"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Minimum 6 characters.
                  </p>

                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={
                        formData.confirmPassword
                      }
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-blue-600"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
              <div className="mt-6 flex items-start gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200">

                <span className="text-red-500">
                  ⚠
                </span>

                <p className="text-sm text-red-600">
                  {error}
                </p>

              </div>
            )}

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {success && (
              <div className="mt-6 flex items-start gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200">

                <span className="text-green-600">
                  ✓
                </span>

                <p className="text-sm text-green-700">
                  {success}
                </p>

              </div>
            )}

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">

              <Link
                to="/register"
                className="text-center sm:text-left text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
              >
                ← Back to account selection
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  px-7
                  py-3.5
                  rounded-lg
                  font-semibold
                  text-white
                  transition-all
                  duration-300

                  ${
                    isSubmitting
                      ? "bg-blue-400 cursor-wait"
                      : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                  }
                `}
              >
                {isSubmitting
                  ? "Creating Account..."
                  : "Create Student Account"}
              </button>

            </div>

          </form>

        </div>

        {/* =================================================
            LOGIN
        ================================================= */}

        <p className="text-center text-sm text-gray-600 mt-7">

          Already have a student account?{" "}

          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Login
          </Link>

        </p>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <p className="text-center text-xs text-gray-400 mt-4">
          Build your profile, showcase your skills and connect
          with clients through SkillBridge AI.
        </p>

      </div>
    </main>
  );
}

export default StudentRegister;