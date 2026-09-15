import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function GoogleRoleSelection() {
  const navigate = useNavigate();

  const [googleUser, setGoogleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // =====================================================
  // CHECK CURRENT GOOGLE USER
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            navigate("/login", { replace: true });
            return;
          }

          setGoogleUser(firebaseUser);

          console.log(
            "Google Role Selection User:",
            firebaseUser.uid
          );

          // ------------------------------------------------
          // CHECK WHETHER PROFILE ALREADY EXISTS
          // ------------------------------------------------

          const userRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            const userProfile = userSnapshot.data();

            console.log(
              "Existing Profile Found:",
              userProfile
            );

            if (userProfile.role === "student") {
              navigate("/student-dashboard", {
                replace: true,
              });

              return;
            }

            if (userProfile.role === "client") {
              navigate("/client-dashboard", {
                replace: true,
              });

              return;
            }
          }
        } catch (err) {
          console.error(
            "Google Role Selection Error:",
            err
          );

          setError(
            "Unable to load your Google account details."
          );
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // SELECT ROLE
  // =====================================================

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError("");
  };

  // =====================================================
  // CONTINUE
  // =====================================================

  const handleContinue = async () => {
    setError("");

    if (!selectedRole) {
      setError(
        "Please select Student or Client to continue."
      );

      return;
    }

    if (!googleUser) {
      setError(
        "Google account information is not available."
      );

      return;
    }

    try {
      setIsSaving(true);

      console.log(
        "Creating Google profile..."
      );

      console.log(
        "Selected Role:",
        selectedRole
      );

      // ------------------------------------------------
      // FIRESTORE USER DOCUMENT
      // ------------------------------------------------

      const userRef = doc(
        db,
        "users",
        googleUser.uid
      );

      const userData = {
        uid: googleUser.uid,

        role: selectedRole,

        Name:
          googleUser.displayName ||
          "Google User",

        Email:
          googleUser.email || "",

        Phone: "",

        createdAt: serverTimestamp(),

        authProvider: "google",
      };

      // ------------------------------------------------
      // SAVE PROFILE
      // ------------------------------------------------

      await setDoc(
        userRef,
        userData,
        {
          merge: true,
        }
      );

      console.log(
        "Google profile created successfully."
      );

      // ------------------------------------------------
      // REDIRECT BASED ON ROLE
      // ------------------------------------------------

      if (selectedRole === "student") {
        navigate(
          "/student-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      if (selectedRole === "client") {
        navigate(
          "/client-dashboard",
          {
            replace: true,
          }
        );

        return;
      }
    } catch (err) {
      console.error(
        "Google Profile Creation Error:",
        err
      );

      switch (err.code) {
        case "permission-denied":
          setError(
            "Permission denied. Please check your Firebase Firestore rules."
          );
          break;

        case "unavailable":
          setError(
            "Firestore is temporarily unavailable. Please try again."
          );
          break;

        case "network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            err.message ||
              "Unable to create your profile. Please try again."
          );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">

          <div
            className="
              w-10
              h-10
              border-4
              border-blue-200
              border-t-blue-600
              rounded-full
              animate-spin
              mx-auto
              mb-4
            "
          />

          <p className="text-gray-600">
            Loading your Google account...
          </p>

        </div>
      </main>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">

      <div className="w-full max-w-lg">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="text-center mb-8">

          <p className="text-blue-600 font-semibold tracking-wide">
            SKILLBRIDGE AI
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
            Complete Your Profile
          </h1>

          <p className="text-gray-600 mt-3">
            Select how you want to use SkillBridge AI.
          </p>

        </div>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">

          {/* =================================================
              GOOGLE ACCOUNT
          ================================================= */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">

            <p className="text-sm text-gray-500 mb-1">
              Google Account
            </p>

            <p className="font-semibold text-gray-900 break-words">
              {googleUser?.displayName ||
                "Google User"}
            </p>

            <p className="text-sm text-gray-600 break-words">
              {googleUser?.email || ""}
            </p>

          </div>

          {/* =================================================
              ROLE TITLE
          ================================================= */}

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-gray-900">
              Choose Your Role
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Select the role you want to use on
              SkillBridge AI.
            </p>

          </div>

          {/* =================================================
              ROLE OPTIONS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* =================================================
                STUDENT
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                handleRoleSelect("student")
              }
              className={`
                text-left
                p-5
                rounded-xl
                border-2
                transition-all
                duration-200

                ${
                  selectedRole === "student"
                    ? `
                      border-blue-600
                      bg-blue-50
                      shadow-sm
                    `
                    : `
                      border-gray-200
                      bg-white
                      hover:border-blue-300
                      hover:bg-gray-50
                    `
                }
              `}
            >

              <div className="flex items-start gap-4">

                <div
                  className={`
                    w-11
                    h-11
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-xl
                    ${
                      selectedRole ===
                      "student"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600"
                    }
                  `}
                >
                  🎓
                </div>

                <div>

                  <h3 className="font-semibold text-gray-900">
                    Student
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    Find projects, apply for freelance
                    work and build your profile.
                  </p>

                </div>

              </div>

              {selectedRole ===
                "student" && (
                <div className="mt-4 text-sm font-semibold text-blue-600">
                  ✓ Student selected
                </div>
              )}

            </button>

            {/* =================================================
                CLIENT
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                handleRoleSelect("client")
              }
              className={`
                text-left
                p-5
                rounded-xl
                border-2
                transition-all
                duration-200

                ${
                  selectedRole === "client"
                    ? `
                      border-blue-600
                      bg-blue-50
                      shadow-sm
                    `
                    : `
                      border-gray-200
                      bg-white
                      hover:border-blue-300
                      hover:bg-gray-50
                    `
                }
              `}
            >

              <div className="flex items-start gap-4">

                <div
                  className={`
                    w-11
                    h-11
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-xl
                    ${
                      selectedRole ===
                      "client"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600"
                    }
                  `}
                >
                  💼
                </div>

                <div>

                  <h3 className="font-semibold text-gray-900">
                    Client
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    Post projects, review applications
                    and hire students.
                  </p>

                </div>

              </div>

              {selectedRole ===
                "client" && (
                <div className="mt-4 text-sm font-semibold text-blue-600">
                  ✓ Client selected
                </div>
              )}

            </button>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                mt-5
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
              CONTINUE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={handleContinue}
            disabled={
              isSaving ||
              !selectedRole
            }
            className={`
              w-full
              mt-6
              py-3
              rounded-lg
              font-semibold
              text-white
              transition-all
              duration-300

              ${
                isSaving ||
                !selectedRole
                  ? `
                    bg-blue-300
                    cursor-not-allowed
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
            {isSaving
              ? "Creating Profile..."
              : "Continue"}
          </button>

          {/* =================================================
              BACK TO LOGIN
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            disabled={isSaving}
            className="
              w-full
              mt-4
              py-3
              rounded-lg
              font-medium
              text-gray-600
              hover:text-blue-600
              transition-colors
              duration-200
            "
          >
            ← Back to Login
          </button>

        </div>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <p className="text-center text-xs text-gray-500 mt-6">
          Your Google account will be securely connected
          to your SkillBridge AI profile.
        </p>

      </div>

    </main>
  );
}

export default GoogleRoleSelection;