import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // EMAIL / PASSWORD LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsLoggingIn(true);

      console.log("Firebase email login started");
      console.log("Login Email:", email);

      // -------------------------------------------------
      // FIREBASE AUTHENTICATION
      // -------------------------------------------------

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const firebaseUser = userCredential.user;

      console.log("Firebase login successful");
      console.log(
        "Firebase User UID:",
        firebaseUser.uid
      );

      // -------------------------------------------------
      // GET USER PROFILE FROM FIRESTORE
      // -------------------------------------------------

      const userRef = doc(
        db,
        "users",
        firebaseUser.uid
      );

      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        setError(
          "User profile not found. Please register your account again."
        );

        return;
      }

      const userProfile = userSnapshot.data();

      console.log("User Profile:", userProfile);
      console.log("User Role:", userProfile.role);

      // -------------------------------------------------
      // STUDENT LOGIN
      // -------------------------------------------------

      if (userProfile.role === "student") {
        navigate("/student-dashboard", {
          replace: true,
        });

        return;
      }

      // -------------------------------------------------
      // CLIENT LOGIN
      // -------------------------------------------------

      if (userProfile.role === "client") {
        navigate("/client-dashboard", {
          replace: true,
        });

        return;
      }

      // -------------------------------------------------
      // INVALID ROLE
      // -------------------------------------------------

      setError(
        "Invalid user role. Please contact the administrator."
      );
    } catch (err) {
      console.error(
        "Firebase Login Error:",
        err
      );

      switch (err.code) {
        case "auth/invalid-credential":
          setError(
            "Invalid email or password."
          );
          break;

        case "auth/user-not-found":
          setError(
            "No account found with this email."
          );
          break;

        case "auth/wrong-password":
          setError(
            "Incorrect password."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many login attempts. Please try again later."
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
              "Unable to login. Please try again."
          );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // =====================================================
  // GOOGLE SIGN IN
  // =====================================================

  const handleGoogleLogin = async () => {
    setError("");

    try {
      setIsGoogleLoggingIn(true);

      console.log("Google login started");

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      // -------------------------------------------------
      // GOOGLE AUTHENTICATION
      // -------------------------------------------------

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      const googleUser = result.user;

      console.log(
        "Google Login Successful"
      );

      console.log(
        "Google User UID:",
        googleUser.uid
      );

      console.log(
        "Google User Name:",
        googleUser.displayName
      );

      console.log(
        "Google User Email:",
        googleUser.email
      );

      // -------------------------------------------------
      // CHECK FIRESTORE PROFILE
      // -------------------------------------------------

      const userRef = doc(
        db,
        "users",
        googleUser.uid
      );

      const userSnapshot =
        await getDoc(userRef);

      // -------------------------------------------------
      // EXISTING GOOGLE USER
      // -------------------------------------------------

      if (userSnapshot.exists()) {
        const userProfile =
          userSnapshot.data();

        console.log(
          "Existing Google Profile:",
          userProfile
        );

        if (
          userProfile.role ===
          "student"
        ) {
          navigate(
            "/student-dashboard",
            {
              replace: true,
            }
          );

          return;
        }

        if (
          userProfile.role ===
          "client"
        ) {
          navigate(
            "/client-dashboard",
            {
              replace: true,
            }
          );

          return;
        }
      }

      // -------------------------------------------------
      // FIRST-TIME GOOGLE USER
      // -------------------------------------------------

      console.log(
        "First-time Google user"
      );

      navigate(
        "/google-role-selection",
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "Google Login Error:",
        err
      );

      switch (err.code) {
        case "auth/popup-closed-by-user":
          setError(
            "Google login was cancelled."
          );
          break;

        case "auth/popup-blocked":
          setError(
            "Google login popup was blocked. Please allow popups and try again."
          );
          break;

        case "auth/cancelled-popup-request":
          setError(
            "Google login was cancelled."
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
              "Unable to login with Google."
          );
      }
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="text-center mb-8">

          <p className="text-blue-600 font-semibold tracking-wide">
            SKILLBRIDGE AI
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mt-3">
            Login
          </h1>

          <p className="text-gray-600 mt-2">
            Login to continue to your account.
          </p>

        </div>

        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8"
        >

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              className="
                w-full
                px-4
                py-3
                border
                border-gray-300
                rounded-lg
                outline-none
                transition-all
                duration-300
                focus:border-blue-600
                focus:ring-2
                focus:ring-blue-100
              "
            />

          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="mb-3">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
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
                placeholder="Enter your password"
                autoComplete="current-password"
                className="
                  w-full
                  px-4
                  py-3
                  pr-16
                  border
                  border-gray-300
                  rounded-lg
                  outline-none
                  transition-all
                  duration-300
                  focus:border-blue-600
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  font-semibold
                  text-gray-500
                  hover:text-blue-600
                  transition-colors
                  duration-200
                "
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          <div className="text-right mb-5">

            <Link
              to="/forgot-password"
              className="
                text-sm
                text-blue-600
                hover:text-blue-700
                font-medium
              "
            >
              Forgot Password?
            </Link>

          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div
              className="
                mb-5
                px-4
                py-3
                rounded-lg
                bg-red-50
                border
                border-red-200
                text-red-600
                text-sm
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              EMAIL LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={
              isLoggingIn ||
              isGoogleLoggingIn
            }
            className={`
              w-full
              py-3
              rounded-lg
              font-semibold
              text-white
              transition-all
              duration-300

              ${
                isLoggingIn ||
                isGoogleLoggingIn
                  ? `
                    bg-blue-400
                    cursor-wait
                  `
                  : `
                    bg-blue-600
                    hover:bg-blue-700
                    hover:-translate-y-1
                    hover:shadow-lg
                    active:scale-95
                  `
              }
            `}
          >
            {isLoggingIn
              ? "Logging in..."
              : "Login"}
          </button>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="flex items-center gap-4 my-6">

            <div className="flex-1 h-px bg-gray-200" />

            <span className="text-sm text-gray-400">
              OR
            </span>

            <div className="flex-1 h-px bg-gray-200" />

          </div>

          {/* =================================================
              GOOGLE LOGIN
          ================================================= */}

          <button
            type="button"
            onClick={
              handleGoogleLogin
            }
            disabled={
              isLoggingIn ||
              isGoogleLoggingIn
            }
            className={`
              w-full
              py-3
              rounded-lg
              border
              border-gray-300
              bg-white
              text-gray-800
              font-semibold
              flex
              items-center
              justify-center
              gap-3
              transition-all
              duration-300

              ${
                isLoggingIn ||
                isGoogleLoggingIn
                  ? `
                    opacity-60
                    cursor-wait
                  `
                  : `
                    hover:bg-gray-50
                    hover:-translate-y-1
                    hover:shadow-md
                  `
              }
            `}
          >

            {/* Google Logo */}

            <span className="text-lg font-bold">
              G
            </span>

            {isGoogleLoggingIn
              ? "Signing in..."
              : "Continue with Google"}

          </button>

          {/* =================================================
              REGISTER
          ================================================= */}

          <p className="text-center text-sm text-gray-600 mt-6">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="
                text-blue-600
                font-semibold
                hover:text-blue-700
              "
            >
              Register
            </Link>

          </p>

        </form>

        {/* =================================================
            BACK TO HOME
        ================================================= */}

        <div className="text-center mt-6">

          <Link
            to="/"
            className="
              text-sm
              text-gray-500
              hover:text-blue-600
              transition-colors
            "
          >
            ← Back to Home
          </Link>

        </div>

      </div>
    </main>
  );
}

export default Login;