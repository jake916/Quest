import React from "react";
import { Link } from "react-router-dom";

const Signin = () => {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Side - Image Section */}
      <div
        className="w-150 h-110  relative flex items-center justify-center bg-cover bg-center rounded-xl mt-10 mb-10 ml-5 "
        style={{ backgroundImage: "url('/src/assets/Group 4.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80 rounded-r-lg"></div>
        <div className="relative text-white text-center px-8">


          <h2 className="text-4xl font-bold relative aboslute top-40">
            Capture Task
            <br />
            Achieve More
          </h2>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-186 flex flex-col justify-center px-16 ">
        <h2 className="text-3xl font-bold mt-6 mb-6 text-black ">Sign into your Account</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              placeholder="hello@quest.com"
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
            />
          </div>
          <div className="text-right pr-35">
            <a href="http://localhost:5173/password" className="text-sm">
              Forgot Password?
            </a>
          </div>
          <Link to="/dashboard">
            <button className="w-120 bg-red-500 text-white py-2 rounded-lg">
              Login
            </button>
          </Link>
        </form>
        <p className="text-center text-gray-500 mt-4 pr-30">
          Don’t have an Account?{" "}
          <a href="http://localhost:5173/register" className="text-red font-bold">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signin;
