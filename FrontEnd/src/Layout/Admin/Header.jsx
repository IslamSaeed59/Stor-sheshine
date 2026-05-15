// Header.jsx

import { useNavigate } from "react-router-dom";

const Header = ({ title, buttonText, showButton = true, navigation }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-serif font-medium text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">Manage and monitor your {title.toLowerCase()}.</p>
      </div>

      {showButton && (
        <button
          type="button"
          onClick={() => navigate(navigation)}
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold tracking-wide text-white transition-all bg-gray-900 rounded-lg hover:bg-primary focus:ring-4 focus:ring-primary/20"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default Header;
