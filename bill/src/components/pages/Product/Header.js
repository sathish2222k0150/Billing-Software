import React, { useState } from "react";
import { Phone, Mail } from "lucide-react";
import logoImage from "../../assets/Images/sds logo.png";

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContactClick = () => {
    setIsModalOpen(true);
  };

  const handleRedirect = (option) => {
    if (option === "call") {
      window.location.href = "tel:+1234567890";
    } else if (option === "email") {
      window.location.href = "mailto:support@sds.com";
    }
    setIsModalOpen(false); // Close modal after selection
  };

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <div className="bg-white p-2 rounded-lg">
              <img src={logoImage} alt="SDS Logo" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SDS</h1>
              <p className="text-blue-200 text-sm">All Car Service</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="flex items-center space-x-6">
            <button
              onClick={handleContactClick}
              className="flex items-center space-x-2 hover:text-blue-200 focus:outline-none"
            >
              <Phone className="w-5 h-5" />
              <span className="hidden md:inline">Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Choose an option</h2>
            <button
              onClick={() => handleRedirect("call")}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full"
            >
              <Phone className="w-5 h-5" />
              <span>Call Support</span>
            </button>
            <button
              onClick={() => handleRedirect("email")}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              <Mail className="w-5 h-5" />
              <span>Email Support</span>
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
