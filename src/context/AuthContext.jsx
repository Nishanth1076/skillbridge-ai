import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD USER PROFILE
  // =====================================================

  const loadUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setProfile(null);
      return null;
    }

    try {
      const userRef = doc(
        db,
        "users",
        firebaseUser.uid
      );

      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userProfile = {
          uid: firebaseUser.uid,
          ...userSnap.data(),
        };

        setProfile(userProfile);

        console.log(
          "AuthContext Profile Loaded:",
          userProfile
        );

        return userProfile;
      }

      setProfile(null);

      return null;
    } catch (error) {
      console.error(
        "Profile Loading Error:",
        error
      );

      setProfile(null);

      return null;
    }
  };

  // =====================================================
  // FIREBASE AUTH STATE
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            console.log(
              "AuthContext Firebase User:",
              firebaseUser.uid
            );

            setUser(firebaseUser);

            await loadUserProfile(
              firebaseUser
            );
          } else {
            console.log(
              "AuthContext: No Firebase User"
            );

            setUser(null);
            setProfile(null);
          }
        } catch (error) {
          console.error(
            "Auth state error:",
            error
          );

          setUser(null);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================================================
  // REFRESH PROFILE
  // Used after Google role selection / profile update
  // =====================================================

  const refreshProfile = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setUser(null);
        setProfile(null);
        return null;
      }

      setUser(currentUser);

      const updatedProfile =
        await loadUserProfile(
          currentUser
        );

      return updatedProfile;
    } catch (error) {
      console.error(
        "Refresh Profile Error:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = async () => {
    try {
      await signOut(auth);

      setUser(null);
      setProfile(null);

      console.log(
        "User logged out successfully."
      );
    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );

      throw error;
    }
  };

  // =====================================================
  // CONTEXT
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// CUSTOM HOOK
// =====================================================

export function useAuth() {
  return useContext(AuthContext);
}