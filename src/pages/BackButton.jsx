import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2
        px-4 py-2
        border border-gray-300
        bg-white
        text-gray-700
        rounded-lg
        font-medium
        hover:bg-gray-50
        hover:text-blue-600
        hover:border-blue-300
        transition-all duration-200"
      >
        ← Back
      </button>
    </div>
  );
}

export default BackButton;