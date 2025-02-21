import React from "react";
import { Link } from "react-router-dom";

const Password = () => {
  return (
    <div className="flex h-screen bg-white">
      {/* Left Section - Image */}
      <div
        className="w-150 h-110 relative flex items-center justify-center bg-cover bg-center rounded-xl mt-10 mb-10 ml-5"
        style={{ backgroundImage: "url('src/assets/10.png')" }}

      >
        <div className="absolute inset-0 bg-primary/80 rounded-r-lg"></div>
        <div className="relative text-white text-center px-8">

          <h2 className="text-4xl font-bold relative aboslute top-40">Organize Work</h2>
          <br></br>
          <p className="relative aboslute top-35">Maximize Results</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-186 flex flex-col justify-center px-16">
        <h2 className="text-3xl font-bold mb-6 text-black ">All Done</h2>
        <p className="font-regular mb-6 text-[#292D32] ">Your Password has been changed. Proceed to Login</p>
        <form className="space-y-4">
          <Link to="http://localhost:5173">
            <button className="w-120 bg-red-500 text-white py-2 rounded-lg">
              Login
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Password;
