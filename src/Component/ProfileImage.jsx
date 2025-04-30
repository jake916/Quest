import React, { useRef, useState } from "react";
import axios from "axios";

const ProfileImage = ({ username, initialImageUrl, onUploadSuccess }) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const firstLetter = username ? username.charAt(0).toUpperCase() : "";

  const circleStyle = {
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: "white",
    color: "#7E0020",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 48,
    userSelect: "none",
    cursor: "pointer",
    border: "2px solid #7E0020",
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "/api/users/upload-profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.profileImage) {
        setImageUrl(response.data.profileImage);
        if (onUploadSuccess) {
          onUploadSuccess(response.data.profileImage);
        }
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={username}
          style={{ ...circleStyle, objectFit: "cover" }}
          onClick={handleClick}
          loading="lazy"
        />
      ) : (
        <div style={circleStyle} onClick={handleClick}>
          {firstLetter}
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={uploading}
      />
    </>
  );
};

export default ProfileImage;
