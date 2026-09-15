import { Link } from "react-router-dom";

function Home() {
  return (
    <main>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">

          <p className="text-blue-600 font-semibold mb-6 sm:mb-8 text-sm sm:text-base">
            AI POWERED FREELANCE PLATFORM
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 max-w-3xl mx-auto leading-tight">
            Turn Your Skills Into Opportunities.
          </h1>

          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            SkillBridge AI connects talented students with freelance
            opportunities and helps them create professional project proposals
            using AI.
          </p>

          {/* HERO BUTTONS */}

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 px-2">

            {/* FIND PROJECTS */}

            <Link
              to="/student-register"
              className="
                inline-flex
                items-center
                justify-center
                w-full
                sm:w-auto
                px-6
                py-3
                bg-blue-600
                text-white
                rounded-lg
                font-medium
                hover:bg-blue-700
                transition-all
                duration-300
                hover:-translate-y-1
                hover:scale-105
                hover:shadow-lg
                active:scale-95
              "
            >
              Find Projects
            </Link>

            {/* HIRE STUDENTS */}

            <Link
              to="/register/client"
              className="
                inline-flex
                items-center
                justify-center
                w-full
                sm:w-auto
                px-6
                py-3
                border
                border-gray-300
                rounded-lg
                font-medium
                text-gray-700
                hover:bg-gray-100
                transition-all
                duration-300
                hover:-translate-y-1
                hover:scale-105
                hover:shadow-md
                active:scale-95
              "
            >
              Hire Students
            </Link>

          </div>

        </div>
      </section>

      {/* =====================================================
          WHY SKILLBRIDGE AI
      ===================================================== */}

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-10 sm:mb-12">

            <p className="text-blue-600 font-semibold">
              WHY SKILLBRIDGE AI
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              Everything students need to start freelancing
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">

            {/* FIND PROJECTS */}

            <div
              className="
                p-6
                border
                rounded-xl
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-lg
              "
            >
              <h3 className="text-xl font-semibold">
                Find Projects
              </h3>

              <p className="mt-3 text-gray-600 leading-relaxed">
                Browse freelance projects posted by clients and find
                opportunities that match your skills.
              </p>
            </div>

            {/* BUILD PROFILE */}

            <div
              className="
                p-6
                border
                rounded-xl
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-lg
              "
            >
              <h3 className="text-xl font-semibold">
                Build Your Profile
              </h3>

              <p className="mt-3 text-gray-600 leading-relaxed">
                Showcase your skills, college details and resume in one
                professional profile.
              </p>
            </div>

            {/* AI PROPOSAL */}

            <div
              className="
                p-6
                border
                rounded-xl
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-lg
              "
            >
              <h3 className="text-xl font-semibold">
                AI Proposal
              </h3>

              <p className="mt-3 text-gray-600 leading-relaxed">
                Generate professional project proposals with the help of AI.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="bg-gray-50 py-16 sm:py-20 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-10 sm:mb-12">

            <p className="text-blue-600 font-semibold">
              HOW IT WORKS
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              Start freelancing in three simple steps
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

            {/* STEP 1 */}

            <div
              className="
                transition-all
                duration-300
                hover:-translate-y-2
              "
            >
              <div className="text-3xl font-bold text-blue-600">
                01
              </div>

              <h3 className="text-xl font-semibold mt-3">
                Create Profile
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Register and add your skills, education and resume.
              </p>
            </div>

            {/* STEP 2 */}

            <div
              className="
                transition-all
                duration-300
                hover:-translate-y-2
              "
            >
              <div className="text-3xl font-bold text-blue-600">
                02
              </div>

              <h3 className="text-xl font-semibold mt-3">
                Find a Project
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Browse projects and choose work that matches your skills.
              </p>
            </div>

            {/* STEP 3 */}

            <div
              className="
                transition-all
                duration-300
                hover:-translate-y-2
              "
            >
              <div className="text-3xl font-bold text-blue-600">
                03
              </div>

              <h3 className="text-xl font-semibold mt-3">
                Apply with AI
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Generate a professional proposal and apply for the project.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          CALL TO ACTION
      ===================================================== */}

      <section className="py-16 sm:py-20 px-4 text-center">

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Ready to turn your skills into opportunities?
        </h2>

        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
          Join SkillBridge AI and start exploring freelance opportunities.
        </p>

        <Link
          to="/register"
          className="
            inline-flex
            items-center
            justify-center
            mt-8
            w-full
            sm:w-auto
            px-7
            py-3
            bg-blue-600
            text-white
            rounded-lg
            font-medium
            hover:bg-blue-700
            transition-all
            duration-300
            hover:-translate-y-1
            hover:scale-105
            hover:shadow-lg
            active:scale-95
          "
        >
          Get Started
        </Link>

      </section>

    </main>
  );
}

export default Home;