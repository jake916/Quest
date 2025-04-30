import Sidebar from "../Component/sidebar";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import PageHeader from "../Component/pageheader";
import ProfileImage from "../Component/ProfileImage";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Settings = ({ isDarkMode, toggleDarkMode }) => {
  const [username, setUsername] = useState("Guest");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("Account");
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempEmail, setTempEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUsername(decodedUser?.username || "Guest");
        setEmail(decodedUser?.email || "");
        setTempUsername(decodedUser?.username || "Guest");
        setTempEmail(decodedUser?.email || "");

        axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          if (response.data?.profileImage) {
            setProfileImageUrl(response.data.profileImage);
          }
        }).catch(console.error);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("/api/users/profile", {
        username: tempUsername,
        email: tempEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsername(tempUsername);
      setEmail(tempEmail);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put("/api/users/change-password", {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      const token = localStorage.getItem("token");
      axios.delete("/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
          toast.success("Account deleted successfully");
        })
        .catch(error => {
          toast.error(error.response?.data?.message || "Failed to delete account");
        });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Account":
        return (
          <div className="space-y-8">
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-auto flex justify-center">
                  <ProfileImage
                    username={username}
                    initialImageUrl={profileImageUrl}
                    onUploadSuccess={setProfileImageUrl}
                    className="w-32 h-32"
                  />
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-6`}>
                    <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Organization Profile</h2>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Basic information about your organization</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Organization Name</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#72001D] focus:ring focus:ring-[#72001D] focus:ring-opacity-50 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300 text-gray-900'
                          }`}
                        />
                      ) : (
                        <p className={`mt-1 text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{username}</p>
                      )}
                    </div>

                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Organization Email</p>
                      {isEditing ? (
                        <input
                          type="email"
                          value={tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#72001D] focus:ring focus:ring-[#72001D] focus:ring-opacity-50 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300 text-gray-900'
                          }`}
                        />
                      ) : (
                        <p className={`mt-1 text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-[#72001D] text-white rounded-md hover:bg-[#5a0017] transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'} rounded-md hover:bg-gray-300 transition-colors`}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-[#72001D] text-white rounded-md hover:bg-[#5a0017] transition-colors"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-red-900' : 'bg-white border-red-100'} rounded-lg shadow-sm p-6 border`}>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Delete Account</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        );

      case "Security":
        return (
          <div className="space-y-8">
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Change Password</h2>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#72001D] focus:ring focus:ring-[#72001D] focus:ring-opacity-50 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#72001D] focus:ring focus:ring-[#72001D] focus:ring-opacity-50 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Must be at least 8 characters</p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#72001D] focus:ring focus:ring-[#72001D] focus:ring-opacity-50 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 bg-[#72001D] text-white rounded-md hover:bg-[#5a0017] transition-colors flex items-center justify-center"
                  >
                    {isChangingPassword ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Changing...
                      </>
                    ) : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case "General":
        return (
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-sm p-6 max-w-2xl`}>
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>General Settings</h2>

            <div className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className={`flex items-center justify-between p-4 border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Switch between light and dark appearance
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#72001D] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#72001D]"></div>
                </label>
              </div>

              {/* You can add more general settings here */}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="fixed h-screen">
        <Sidebar username={username} />
      </div>

      <div className="ml-[250px] w-full p-6">
        <PageHeader title="Settings" bodyText="Manage your account settings" />

        <div className={`mt-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="-mb-px flex space-x-8">
            {["Account", "Security", "General"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-[#72001D] text-[#72001D]"
                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
