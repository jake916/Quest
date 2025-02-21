import React from 'react'

const register = () => {
  return (
    <div className="flex h-screen bg-white">
      {/* Left Side - Image Section */}
      <div
        className="w-150 h-110  relative flex items-center justify-center bg-cover bg-center rounded-xl mt-10 mb-10 ml-5 "
        style={{ backgroundImage: "url('src/assets/Group 6.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80 rounded-r-lg"></div>
        <div className="relative text-white text-center px-8">
          <h2 className="text-4xl font-bold relative aboslute top-40">
            Boost Productivity,
            <br />
            Accomplish More
          </h2>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-186 flex flex-col justify-center px-16 mb-5">
        <h2 className="text-3xl font-bold  text-black ">Create your Account</h2>
        <form className="space-y-4 ">
          <div className=''>
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                name='username'
                placeholder="Enter your Username"
                className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
              />
            </div>
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
                placeholder="Enter Your Password"
                className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-gray-700">Re-Enter Password</label>
              <input
                type="password"
                placeholder="Enter your Password Again"
                className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
              />
            </div>
          </div>
          <button className="w-120 ">Create Account</button>
        </form>
        <p className="text-center text-gray-500 mt-4 pr-30">
          Already have an Account?{" "}
          <a href="http://localhost:5173" className="text-red font-bold">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

export default register
