import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../firebase/firebase";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedEmail = email.trim().toLowerCase();

    // =============================
    // VALIDATION
    // =============================

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setIsSending(true);

      console.log("🔐 Password reset started");
      console.log("📧 Reset Email:", trimmedEmail);

      // =============================
      // SEND PASSWORD RESET EMAIL
      // =============================

      await sendPasswordResetEmail(auth, trimmedEmail);

      console.log("✅ Password reset email sent");

      setSuccess(
        "Password reset link has been sent to your email. Please check your inbox."
      );

      setEmail("");
    } catch (err) {
      console.error("❌ Password Reset Error:", err);

      // =============================
      // FIREBASE ERROR HANDLING
      // =============================

      switch (err.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;

        case "auth/too-many-requests":
          setError(
            "Too many requests. Please try again later."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            err.message ||
              "Unable to send password reset email. Please try again."
          );
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        {/* HEADER */}

        <div className="text-center mb-8">
          <p className="text-blue-600 font-semibold tracking-wide">
            SKILLBRIDGE AI
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mt-3">
            Forgot Password?
          </h1>

          <p className="text-gray-600 mt-2">
            Enter your registered email address to reset your password.
          </p>
        </div>

        {/* RESET CARD */}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8"
        >

          {/* EMAIL */}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="Enter your registered email"
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
              outline-none transition-all duration-300
              focus:border-blue-600
              focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-lg
              bg-red-50 border border-red-200
              text-red-600 text-sm"
            >
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div
              className="mb-5 px-4 py-3 rounded-lg
              bg-green-50 border border-green-200
              text-green-700 text-sm"
            >
              {success}
            </div>
          )}

          {/* SEND BUTTON */}

          <button
            type="submit"
            disabled={isSending}
            className={`w-full py-3 rounded-lg
            font-semibold text-white
            transition-all duration-300 ${
              isSending
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            }`}
          >
            {isSending
              ? "Sending Reset Link..."
              : "Send Reset Link"}
          </button>

          {/* BACK TO LOGIN */}

          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{" "}

            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Back to Login
            </Link>
          </p>
        </form>

        {/* BACK HOME */}

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-gray-500
            hover:text-blue-600
            transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}

export default ForgotPassword;