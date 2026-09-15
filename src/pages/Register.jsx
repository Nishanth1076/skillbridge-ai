import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const handleStudentRegister = () => {
    navigate("/student-register");
  };

  const handleClientRegister = () => {
    navigate("/client-register");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">

      <div className="w-full max-w-4xl">

        {/* HEADER */}
        <div className="text-center mb-10">

          <p className="text-blue-600 font-semibold tracking-wide uppercase">
            SkillBridge AI
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            Create Your Account
          </h1>

          <p className="text-gray-600 text-lg mt-3">
            Choose how you want to use SkillBridge AI.
          </p>

        </div>

        {/* ROLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* STUDENT */}
          <button
            type="button"
            onClick={handleStudentRegister}
            className="group text-left bg-white border border-gray-200 rounded-2xl p-8 shadow-sm
            transition-all duration-300
            hover:-translate-y-2 hover:shadow-xl hover:border-blue-300"
          >

            <div
              className="w-16 h-16 rounded-2xl bg-blue-50
              flex items-center justify-center text-3xl mb-6
              transition-transform duration-300 group-hover:scale-110"
            >
              🎓
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              I'm a Student
            </h2>

            <p className="text-gray-600 mt-3 leading-7">
              Find freelance projects, showcase your skills, build
              practical experience and connect with clients.
            </p>

            <div className="mt-7 flex items-center justify-between">

              <span className="text-blue-600 font-semibold">
                Register as Student
              </span>

              <span className="text-blue-600 text-xl transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>

            </div>

          </button>

          {/* CLIENT */}
          <button
            type="button"
            onClick={handleClientRegister}
            className="group text-left bg-white border border-gray-200 rounded-2xl p-8 shadow-sm
            transition-all duration-300
            hover:-translate-y-2 hover:shadow-xl hover:border-blue-300"
          >

            <div
              className="w-16 h-16 rounded-2xl bg-blue-50
              flex items-center justify-center text-3xl mb-6
              transition-transform duration-300 group-hover:scale-110"
            >
              💼
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              I'm a Client
            </h2>

            <p className="text-gray-600 mt-3 leading-7">
              Post freelance projects, discover talented students
              and find the right skills for your project.
            </p>

            <div className="mt-7 flex items-center justify-between">

              <span className="text-blue-600 font-semibold">
                Register as Client
              </span>

              <span className="text-blue-600 text-xl transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>

            </div>

          </button>

        </div>

        {/* LOGIN */}
        <div className="text-center mt-8">

          <p className="text-gray-600">
            Already have an account?{" "}

            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Login
            </Link>
          </p>

        </div>

        {/* BACK HOME */}
        <div className="text-center mt-4">

          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </main>
  );
}

export default Register;