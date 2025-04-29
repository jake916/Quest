import Sidebar from "../Component/sidebar"
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import PageHeader from "../Component/pageheader";


const settings = () => {

  const [username, setUsername] = useState("Guest");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUsername(decodedUser?.username || "Guest");
      } catch (error) {
        console.error("Invalid token:", error);
        setUsername("Guest");
      }
    }
  }, []);

  return (
    <div className="h-screen">
      {/* Sidebar */}
      <div className="fixed h-screen">
        <Sidebar username={username} />  {/* Pass username to Sidebar */}
      </div>

      {/* Main Content Area */}
      <div>
      <PageHeader />
      </div>
    </div>
  )
}

export default settings