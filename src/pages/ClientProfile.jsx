import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

function ClientProfile() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    Company_Name: "",
    Contact_Person: "",
    Email: "",
    Phone_Number: "",
    Company_Address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD CLIENT PROFILE
  // ==========================================

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const clientRef = doc(
          db,
          "users",
          user.uid
        );

        const clientSnapshot = await getDoc(
          clientRef
        );

        if (clientSnapshot.exists()) {
          const data = clientSnapshot.data();

          console.log(
            "✅ Client Profile Data:",
            data
          );

          setFormData({
            Company_Name:
              data.Company_Name ||
              data.companyName ||
              "",

            Contact_Person:
              data.Contact_Person ||
              data.contactPerson ||
              "",

            Email:
              data.Email ||
              user.email ||
              "",

            Phone_Number:
              data.Phone_Number ||
              data.Phone ||
              data.phone ||
              "",

            Company_Address:
              data.Company_Address ||
              data.companyAddress ||
              "",
          });
        } else {
          setError(
            "Client profile not found."
          );
        }
      } catch (err) {
        console.error(
          "❌ Client Profile Error:",
          err
        );

        setError(
          "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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
  // SAVE PROFILE
  // ==========================================

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!user) {
      setError(
        "Please login again."
      );
      return;
    }

    if (!formData.Company_Name.trim()) {
      setError(
        "Please enter the company name."
      );
      return;
    }

    if (!formData.Contact_Person.trim()) {
      setError(
        "Please enter the contact person."
      );
      return;
    }

    if (!formData.Phone_Number.trim()) {
      setError(
        "Please enter the phone number."
      );
      return;
    }

    if (!formData.Company_Address.trim()) {
      setError(
        "Please enter the company address."
      );
      return;
    }

    try {
      setSaving(true);

      const clientRef = doc(
        db,
        "users",
        user.uid
      );

      await updateDoc(clientRef, {
        Company_Name:
          formData.Company_Name.trim(),

        Contact_Person:
          formData.Contact_Person.trim(),

        Phone_Number:
          formData.Phone_Number.trim(),

        Company_Address:
          formData.Company_Address.trim(),
      });

      console.log(
        "✅ Client profile updated successfully"
      );

      setSuccess(
        "Company profile updated successfully."
      );

      setIsEditing(false);
    } catch (err) {
      console.error(
        "❌ Client Profile Update Error:",
        err
      );

      setError(
        "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancel = async () => {
    setError("");
    setSuccess("");

    if (!user) {
      return;
    }

    try {
      const clientRef = doc(
        db,
        "users",
        user.uid
      );

      const clientSnapshot = await getDoc(
        clientRef
      );

      if (clientSnapshot.exists()) {
        const data =
          clientSnapshot.data();

        setFormData({
          Company_Name:
            data.Company_Name ||
            data.companyName ||
            "",

          Contact_Person:
            data.Contact_Person ||
            data.contactPerson ||
            "",

          Email:
            data.Email ||
            user.email ||
            "",

          Phone_Number:
            data.Phone_Number ||
            data.Phone ||
            data.phone ||
            "",

          Company_Address:
            data.Company_Address ||
            data.companyAddress ||
            "",
        });
      }

      setIsEditing(false);
    } catch (err) {
      console.error(
        "❌ Cancel Edit Error:",
        err
      );

      setError(
        "Unable to restore the profile data."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">

        <div className="max-w-4xl mx-auto">

          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">

            <div className="mx-auto w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

            <p className="text-gray-600 mt-4">
              Loading company profile...
            </p>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="max-w-4xl mx-auto">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="mb-8">

          <p className="text-blue-600 font-semibold tracking-wide uppercase">
            Client Profile
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Company Profile
          </h1>

          <p className="text-gray-600 mt-2">
            Manage your company information and contact details.
          </p>

        </div>

        {/* ==========================================
            PROFILE CARD
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* ==========================================
              PROFILE HEADER
          ========================================== */}

          <div className="px-8 py-7 border-b border-gray-200 bg-gray-50">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div className="flex items-center gap-4">

                {/* AVATAR */}

                <div
                  className="w-14 h-14 rounded-full
                  bg-blue-100 text-blue-600
                  flex items-center justify-center
                  text-2xl font-bold"
                >
                  {formData.Company_Name
                    ? formData.Company_Name
                        .charAt(0)
                        .toUpperCase()
                    : "C"}
                </div>

                {/* COMPANY NAME */}

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    {formData.Company_Name ||
                      "Company Name"}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Client Account
                  </p>

                </div>

              </div>

              {/* EDIT BUTTON */}

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="px-5 py-2.5
                  bg-blue-600 text-white
                  rounded-lg font-semibold
                  hover:bg-blue-700
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:shadow-md"
                >
                  Edit Profile
                </button>
              )}

            </div>

          </div>

          {/* ==========================================
              FORM
          ========================================== */}

          <form
            onSubmit={handleSave}
            className="p-8"
          >

            {/* ERROR */}

            {error && (
              <div
                className="mb-6 px-4 py-3
                rounded-lg
                bg-red-50
                border border-red-200
                text-red-600 text-sm"
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                className="mb-6 px-4 py-3
                rounded-lg
                bg-green-50
                border border-green-200
                text-green-700 text-sm"
              >
                {success}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">

              {/* ==========================================
                  COMPANY NAME
              ========================================== */}

              <div>

                <label
                  htmlFor="Company_Name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company Name
                </label>

                <input
                  id="Company_Name"
                  type="text"
                  name="Company_Name"
                  value={formData.Company_Name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter company name"
                  className={`w-full px-4 py-3
                  border rounded-lg
                  outline-none transition-all duration-200
                  ${
                    isEditing
                      ? "border-gray-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                  }`}
                />

              </div>

              {/* ==========================================
                  CONTACT PERSON
              ========================================== */}

              <div>

                <label
                  htmlFor="Contact_Person"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact Person
                </label>

                <input
                  id="Contact_Person"
                  type="text"
                  name="Contact_Person"
                  value={formData.Contact_Person}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter contact person"
                  className={`w-full px-4 py-3
                  border rounded-lg
                  outline-none transition-all duration-200
                  ${
                    isEditing
                      ? "border-gray-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                  }`}
                />

              </div>

              {/* ==========================================
                  EMAIL
              ========================================== */}

              <div>

                <label
                  htmlFor="Email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>

                <input
                  id="Email"
                  type="email"
                  name="Email"
                  value={formData.Email}
                  disabled
                  className="w-full px-4 py-3
                  border border-gray-200
                  rounded-lg
                  bg-gray-50
                  text-gray-500
                  cursor-not-allowed
                  outline-none"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Email address is linked to the login account.
                </p>

              </div>

              {/* ==========================================
                  PHONE
              ========================================== */}

              <div>

                <label
                  htmlFor="Phone_Number"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>

                <input
                  id="Phone_Number"
                  type="tel"
                  name="Phone_Number"
                  value={formData.Phone_Number}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-3
                  border rounded-lg
                  outline-none transition-all duration-200
                  ${
                    isEditing
                      ? "border-gray-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                  }`}
                />

              </div>

              {/* ==========================================
                  COMPANY ADDRESS
              ========================================== */}

              <div className="md:col-span-2">

                <label
                  htmlFor="Company_Address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company Address
                </label>

                <textarea
                  id="Company_Address"
                  name="Company_Address"
                  value={formData.Company_Address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="4"
                  placeholder="Enter company address"
                  className={`w-full px-4 py-3
                  border rounded-lg
                  outline-none resize-none
                  transition-all duration-200
                  ${
                    isEditing
                      ? "border-gray-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                  }`}
                />

              </div>

            </div>

            {/* ==========================================
                ACTION BUTTONS
            ========================================== */}

            {isEditing && (
              <div className="flex flex-wrap justify-end gap-3 mt-8 pt-6 border-t border-gray-200">

                {/* CANCEL */}

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-5 py-2.5
                  border border-gray-300
                  bg-white
                  text-gray-700
                  rounded-lg
                  font-semibold
                  hover:bg-gray-50
                  transition-all duration-200
                  disabled:opacity-50
                  disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                {/* SAVE */}

                <button
                  type="submit"
                  disabled={saving}
                  className={`px-5 py-2.5
                  rounded-lg
                  font-semibold text-white
                  transition-all duration-200
                  ${
                    saving
                      ? "bg-blue-400 cursor-wait"
                      : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>
            )}

          </form>

        </div>

      </div>

    </main>
  );
}

export default ClientProfile;