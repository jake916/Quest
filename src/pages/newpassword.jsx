import React from "react";
import { Link } from "react-router-dom";

const Password = () => {
  return (
    <div className="flex h-screen bg-white">
      {/* Left Section - Image */}
      <div
        className="w-150 h-110 relative flex items-center justify-center bg-cover bg-center rounded-xl mt-10 mb-10 ml-5"
        style={{ backgroundImage: "url('/src/assets/9.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80 rounded-r-lg"></div>
        <div className="relative text-white text-center px-8">

          <h2 className="text-4xl font-bold relative aboslute top-40">Plan Smart</h2>
          <br></br>
          <p className="relative aboslute top-35">Execute Better</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-186 flex flex-col justify-center px-16">
        <h2 className="text-3xl font-bold mb-6 text-black ">Set New Password</h2>
        <p className="font-regular mb-6 text-[#292D32] ">Must be at least 8 Characters</p>
        <form className="space-y-4">
        <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-gray-700"> Confirm Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
            />
          </div>
          <Link to="/alldone">
            <button className="w-120 bg-red-500 text-white py-2 rounded-lg">
              Reset Password
            </button>
          </Link>
        </form>
        <p className="text-center text-gray-500 mt-4 pr-30">
          Back to {" "}
          <a href="http://localhost:5173" className="text-red font-bold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Password;
