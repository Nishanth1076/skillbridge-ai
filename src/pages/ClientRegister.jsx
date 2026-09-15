import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function ClientRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    clientName: "",
    email: "",
    phoneNumber: "",
    companyAddress: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================
  // HANDLE INPUT
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================
  // VALIDATION
  // ==========================================
  const validateForm = () => {
    const {
      companyName,
      clientName,
      email,
      phoneNumber,
      companyAddress,
      password,
      confirmPassword,
    } = formData;

    if (!companyName.trim()) {
      return "Please enter your company name.";
    }

    if (!clientName.trim()) {
      return "Please enter your name.";
    }

    if (!email.trim()) {
      return "Please enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!phoneNumber.trim()) {
      return "Please enter your phone number.";
    }

    if (!/^[0-9]{10}$/.test(phoneNumber.trim())) {
      return "Please enter a valid 10-digit phone number.";
    }

    if (!companyAddress.trim()) {
      return "Please enter your company address.";
    }

    if (!password) {
      return "Please create a password.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (!confirmPassword) {
      return "Please confirm your password.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // ==========================================
      // CLEAN EMAIL
      // ==========================================
      const email = formData.email.trim().toLowerCase();

      // ==========================================
      // CREATE FIREBASE AUTH ACCOUNT
      // ==========================================
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        formData.password
      );

      const firebaseUser = userCredential.user;

      console.log(
        "🔥 Firebase client account created:",
        firebaseUser.uid
      );

      // ==========================================
      // SAVE CLIENT PROFILE TO FIRESTORE
      // ==========================================
      await setDoc(doc(db, "users", firebaseUser.uid), {
        role: "client",

        Client_ID: firebaseUser.uid,

        Company_Name: formData.companyName.trim(),

        Contact_Person: formData.clientName.trim(),

        Email: email,

        Phone: formData.phoneNumber.trim(),

        Company_Address: formData.companyAddress.trim(),

        Created_At: serverTimestamp(),
      });

      console.log("✅ Client profile saved to Firestore");

      // ==========================================
      // SUCCESS
      // ==========================================
      setIsSubmitting(false);

      setSuccess(
        "Your client account has been created successfully."
      );

      // ==========================================
      // REDIRECT TO LOGIN
      // ==========================================
      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error(
        "❌ Client registration error:",
        error
      );

      setIsSubmitting(false);

      // ==========================================
      // FIREBASE ERROR HANDLING
      // ==========================================
      if (error.code === "auth/email-already-in-use") {
        setError(
          "An account already exists with this email address."
        );
      } else if (error.code === "auth/invalid-email") {
        setError(
          "Please enter a valid email address."
        );
      } else if (error.code === "auth/weak-password") {
        setError(
          "Password is too weak. Please use a stronger password."
        );
      } else if (error.code === "auth/network-request-failed") {
        setError(
          "Network error. Please check your internet connection."
        );
      } else if (
        error.code === "permission-denied" ||
        error.code === "firestore/permission-denied"
      ) {
        setError(
          "Account created, but client profile could not be saved. Please check Firestore rules."
        );
      } else {
        setError(
          "Something went wrong while creating your account."
        );
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 sm:px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* ==========================================
            TOP BRAND
        ========================================== */}
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center
            text-2xl font-bold tracking-tight
            text-gray-900"
          >
            SkillBridge
            <span className="text-blue-600 ml-1">
              AI
            </span>
          </Link>

          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mt-6">
            Client Registration
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Create your client account
          </h1>

          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Connect with talented students and post freelance
            projects through SkillBridge AI.
          </p>
        </div>

        {/* ==========================================
            MAIN CARD
        ========================================== */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* CARD HEADER */}
          <div className="px-6 sm:px-10 py-7 border-b border-gray-100 bg-white">
            <div className="flex items-start gap-4">

              <div
                className="w-12 h-12 rounded-xl bg-blue-50
                text-blue-600 flex items-center justify-center
                text-xl shrink-0"
              >
                💼
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Company Information
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter your company and contact details to get
                  started.
                </p>
              </div>

            </div>
          </div>

          {/* ==========================================
              FORM
          ========================================== */}
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-10"
          >

            {/* ==========================================
                COMPANY INFORMATION
            ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* COMPANY NAME */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  autoComplete="organization"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                  text-gray-900 placeholder-gray-400
                  outline-none transition-all duration-200
                  focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* CLIENT NAME */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client Name
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter contact person's name"
                  autoComplete="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                  text-gray-900 placeholder-gray-400
                  outline-none transition-all duration-200
                  focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Email
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                  text-gray-900 placeholder-gray-400
                  outline-none transition-all duration-200
                  focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                  text-gray-900 placeholder-gray-400
                  outline-none transition-all duration-200
                  focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                />
              </div>

            </div>

            {/* ==========================================
                ADDRESS
            ========================================== */}
            <div className="mt-6">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Address
                <span className="text-red-500 ml-1">
                  *
                </span>
              </label>

              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                placeholder="Enter your complete company address"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                text-gray-900 placeholder-gray-400
                outline-none resize-none transition-all duration-200
                focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
              />

            </div>

            {/* ==========================================
                SECURITY SECTION
            ========================================== */}
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
                      className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg
                      text-gray-900 placeholder-gray-400
                      outline-none transition-all duration-200
                      focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-4 top-1/2
                      -translate-y-1/2
                      text-sm font-medium text-gray-500
                      hover:text-blue-600"
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
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg
                      text-gray-900 placeholder-gray-400
                      outline-none transition-all duration-200
                      focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-4 top-1/2
                      -translate-y-1/2
                      text-sm font-medium text-gray-500
                      hover:text-blue-600"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>

              </div>
            </div>

            {/* ==========================================
                ERROR
            ========================================== */}
            {error && (
              <div
                className="mt-6 flex items-start gap-3
                px-4 py-3 rounded-lg
                bg-red-50 border border-red-200"
              >
                <span className="text-red-500">
                  ⚠
                </span>

                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* ==========================================
                SUCCESS
            ========================================== */}
            {success && (
              <div
                className="mt-6 flex items-start gap-3
                px-4 py-3 rounded-lg
                bg-green-50 border border-green-200"
              >
                <span className="text-green-600">
                  ✓
                </span>

                <p className="text-sm text-green-700">
                  {success}
                </p>
              </div>
            )}

            {/* ==========================================
                ACTIONS
            ========================================== */}
            <div
              className="mt-8 flex flex-col-reverse
              sm:flex-row sm:items-center
              sm:justify-between gap-4"
            >

              <Link
                to="/register"
                className="text-center sm:text-left text-sm
                font-medium text-gray-500
                hover:text-blue-600 transition-colors"
              >
                ← Back to account selection
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-7 py-3.5 rounded-lg
                font-semibold text-white
                transition-all duration-300
                ${
                  isSubmitting
                    ? "bg-blue-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                }`}
              >
                {isSubmitting
                  ? "Creating Account..."
                  : "Create Client Account"}
              </button>

            </div>

          </form>
        </div>

        {/* ==========================================
            LOGIN
        ========================================== */}
        <p className="text-center text-sm text-gray-600 mt-7">
          Already have a client account?{" "}

          <Link
            to="/login"
            className="font-semibold text-blue-600
            hover:text-blue-700"
          >
            Login
          </Link>
        </p>

        {/* ==========================================
            FOOTER NOTE
        ========================================== */}
        <p className="text-center text-xs text-gray-400 mt-4">
          By creating an account, you can post projects and
          connect with students on SkillBridge AI.
        </p>

      </div>
    </main>
  );
}

export default ClientRegister;