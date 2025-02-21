import React, { useState } from "react";
import { Link } from "react-router-dom";

const PasswordReset = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
    };

    return (
        <div className="flex h-screen">
            {/* Left Section - Image */}
            <div
                className="w-150 h-110  relative flex items-center justify-center bg-cover bg-center rounded-xl mt-10 mb-10 ml-5"
        style={{ backgroundImage: "url('src/assets/8.png')" }}

            >
                <div className="absolute inset-0 bg-primary/80 rounded-r-lg"></div>
                <div className="relative text-white text-center px-8">

                    <h2 className="text-4xl font-bold relative aboslute top-40">Stay Focused</h2>
                    <br></br>
                    <p className="relative aboslute top-35"> Accomplish More</p>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="w-1/2 flex flex-col justify-center px-16">
                <h2 className="text-3xl font-bold mb-2 text-black ">Password Reset</h2>
                <p className="font-regular  text-[#292D32] ">We Sent a Code to hello@quest.com</p>

                {/* OTP Input Fields */}
                <div className="flex gap-3 my-6 mb-5">
                    {otp.map((value, index) => (
                        <input
                            key={index}
                            type="ntext"
                            maxLength={1}
                            value={value}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="w-12 h-12 border rounded-md text-center text-xl bg-[#D9D9D9] "
                        />
                    ))}
                </div>

                <Link to="/newpassword">
                    <button className="w-120 bg-red-500 text-white py-2 rounded-lg">
                        Submit
                    </button>
                </Link>

                <p className="mt-4 ml-9 text-gray-600">
                    Didn’t receive an email? <a href="#" className="text-red-700 font-medium">Click to Resend</a>
                </p>
                <p className="mt-2 text-black ml-35">
                    Back to <a href="http://localhost:5173/" className="text-red-700 font-medium">Login</a>
                </p>
            </div>
        </div>
    );
};

export default PasswordReset;
