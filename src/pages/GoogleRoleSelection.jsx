import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function GoogleRoleSelection() {
  const navigate = useNavigate();

  const [googleUser, setGoogleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // =====================================================
  // CHECK GOOGLE USER
  // =====================================================

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    setGoogleUser(currentUser);

    const checkExistingProfile = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const profile = userSnapshot.data();

          if (profile.role === "student") {
            navigate("/student-dashboard", {
              replace: true,
            });

            return;
          }

          if (profile.role === "client") {
            navigate("/client-dashboard", {
              replace: true,
            });

            return;
          }
        }
      } catch (err) {
        console.error(
          "Profile check error:",
          err
        );

        setError(
          "Unable to check your account. Please try again."
        );
      }
    };

    checkExistingProfile();
  }, [navigate]);

  // =====================================================
  // CREATE FIRESTORE PROFILE
  // =====================================================

  const handleContinue = async () => {
    setError("");

    if (!selectedRole) {
      setError("Please select Student or Client.");
      return;
    }

    if (!googleUser) {
      setError(
        "Google account session not found. Please login again."
      );

      return;
    }

    try {
      setIsCreatingProfile(true);

      const userRef = doc(
        db,
        "users",
        googleUser.uid
      );

      const existingSnapshot = await getDoc(userRef);

      // -------------------------------------------------
      // STUDENT PROFILE
      // -------------------------------------------------

      if (selectedRole === "student") {
        const studentProfile = {
          Student_ID: googleUser.uid,

          Name:
            googleUser.displayName ||
            "Student",

          Email:
            googleUser.email ||
            "",

          Phone: "",

          College_Name: "",

          Department: "",

          Skills: [],

          Resume: "",

          Resume_URL: "",

          role: "student",

          Auth_Provider: "google",

          Profile_Completed: false,

          Created_At: new Date(),
        };

        if (!existingSnapshot.exists()) {
          await setDoc(
            userRef,
            studentProfile
          );
        } else {
          await setDoc(
            userRef,
            {
              ...studentProfile,
            },
            {
              merge: true,
            }
          );
        }

        console.log(
          "Google Student profile created successfully"
        );

        navigate("/student-dashboard", {
          replace: true,
        });

        return;
      }

      // -------------------------------------------------
      // CLIENT PROFILE
      // -------------------------------------------------

      if (selectedRole === "client") {
        const clientProfile = {
          Client_ID: googleUser.uid,

          Company_Name:
            googleUser.displayName ||
            "Company",

          Contact_Person:
            googleUser.displayName ||
            "",

          Email:
            googleUser.email ||
            "",

          Phone: "",

          Company_Address: "",

          role: "client",

          Auth_Provider: "google",

          Profile_Completed: false,

          Created_At: new Date(),
        };

        if (!existingSnapshot.exists()) {
          await setDoc(
            userRef,
            clientProfile
          );
        } else {
          await setDoc(
            userRef,
            {
              ...clientProfile,
            },
            {
              merge: true,
            }
          );
        }

        console.log(
          "Google Client profile created successfully"
        );

        navigate("/client-dashboard", {
          replace: true,
        });

        return;
      }
    } catch (err) {
      console.error(
        "Google profile creation error:",
        err
      );

      setError(
        err.message ||
          "Unable to create your profile. Please try again."
      );
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  if (!googleUser) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">
          Checking your account...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-blue-600 font-semibold tracking-wide">
            SKILLBRIDGE AI
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mt-3">
            Welcome to SkillBridge AI
          </h1>

          <p className="text-gray-600 mt-3">
            Choose how you want to use SkillBridge AI.
          </p>
        </div>

        {/* Google Account */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">

            {googleUser.photoURL ? (
              <img
                src={googleUser.photoURL}
                alt="Google profile"
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full
                bg-blue-100
                text-blue-600
                flex items-center justify-center
                text-xl
                font-bold"
              >
                {(googleUser.displayName ||
                  googleUser.email ||
                  "G")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <p className="font-semibold text-gray-900">
                {googleUser.displayName ||
                  "Google User"}
              </p>

              <p className="text-sm text-gray-500">
                {googleUser.email}
              </p>
            </div>

          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

          <h2 className="text-xl font-semibold text-gray-900 text-center">
            Select Your Role
          </h2>

          <p className="text-gray-500 text-center mt-2">
            Choose the role that best describes how you will use the platform.
          </p>

          <div className="grid md:grid-cols-2 gap-5 mt-8">

            {/* Student */}
            <button
              type="button"
              onClick={() =>
                setSelectedRole("student")
              }
              className={`text-left p-6 rounded-xl border-2
              transition-all duration-300
              ${
                selectedRole === "student"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="text-3xl mb-4">
                🎓
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                Student
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                Find freelance projects, showcase your skills,
                upload your resume and apply for opportunities.
              </p>

              <div
                className={`mt-5 text-sm font-semibold ${
                  selectedRole === "student"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {selectedRole === "student"
                  ? "✓ Selected"
                  : "Select Student"}
              </div>
            </button>

            {/* Client */}
            <button
              type="button"
              onClick={() =>
                setSelectedRole("client")
              }
              className={`text-left p-6 rounded-xl border-2
              transition-all duration-300
              ${
                selectedRole === "client"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="text-3xl mb-4">
                💼
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                Client
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                Post freelance projects, review student applications
                and find students with the right skills.
              </p>

              <div
                className={`mt-5 text-sm font-semibold ${
                  selectedRole === "client"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {selectedRole === "client"
                  ? "✓ Selected"
                  : "Select Client"}
              </div>
            </button>

          </div>

          {/* Error */}
          {error && (
            <div
              className="mt-6 px-4 py-3 rounded-lg
              bg-red-50
              border border-red-200
              text-red-600
              text-sm"
            >
              {error}
            </div>
          )}

          {/* Continue */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={
              !selectedRole ||
              isCreatingProfile
            }
            className={`w-full mt-7 py-3 rounded-lg
            font-semibold text-white
            transition-all duration-300
            ${
              !selectedRole ||
              isCreatingProfile
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            }`}
          >
            {isCreatingProfile
              ? "Creating Profile..."
              : "Continue"}
          </button>

          <p className="text-center text-xs text-gray-400 mt-5">
            This selection is required only for your first Google login.
          </p>

        </div>

      </div>
    </main>
  );
}

export default GoogleRoleSelection;