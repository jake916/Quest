import React from "react";
import { Link } from "react-router-dom";

const Password = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Section - Image (Hidden on mobile) */}
      <div 
        className="hidden lg:flex lg:w-1/2 h-auto relative items-center justify-center bg-cover bg-center m-5 rounded-xl"
        style={{ backgroundImage: "url('src/assets/10.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80 rounded-xl"></div>
        <div className="relative text-white text-center px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Organize Work</h2>
          <p className="text-xl md:text-2xl">Maximize Results</p>
        </div>
      </div>

      {/* Right Section - Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:px-16">
        <div className="max-w-md mx-auto w-full text-center">
          {/* Checkmark icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg 
              className="h-10 w-10 text-green-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-black">All Done!</h2>
          <p className="text-gray-600 mb-8">
            Your password has been successfully changed.
          </p>
          
          <Link 
            to="/login" 
            className="inline-block w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Proceed to Login
          </Link>

          {/* Additional helpful links */}
          <div className="mt-8 space-y-3">
            <p className="text-sm text-gray-500">
              Need help? <a href="/contact" className="text-red-500 hover:underline">Contact support</a>
            </p>
            <p className="text-sm text-gray-500">
              Return to <a href="/" className="text-red-500 hover:underline">Homepage</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Password;