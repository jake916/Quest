import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProject } from "../api/projectService";
import ConfirmModal from "./ConfirmModal";

const ProjectModal = ({ isOpen, onClose, project, onDeleteSuccess }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
      setShowConfirm(false);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const handleViewProject = () => {
    navigate(`/viewproject/${project._id}`);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    try {
      const token = localStorage.getItem("token");
      const response = await deleteProject(token, project._id);
      
      // Modify your success check based on what the API actually returns
      if (response && (response.success || response.status === 'success')) {
        if (typeof onDeleteSuccess === "function") {
          onDeleteSuccess(project._id);
        }
        onClose();
      } else {
        alert("Failed to delete project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Error deleting project: " + (error.message || "Unknown error"));
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-grey bg-opacity-40 z-40"></div>

      {/* Slide-in modal from right */}
      <div
        ref={modalRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#F1F1F1] shadow-lg p-6 z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out flex flex-col"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 text-lg"
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="flex-grow">
          <p className="text-gray-500 text-sm mb-1">Project Details</p>
          <h2 className="text-2xl font-bold text-[#7E0020] mb-1">
            {project.name}
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            By {project.user?.username || "Unknown User"} on {new Date(project.createdAt).toLocaleDateString()}
          </p>

          <p className="text-gray-700 text-sm mb-1">Description</p>
          <div className="bg-[#E3DCDC] text-sm text-gray-800 p-4 rounded-lg mb-6 whitespace-pre-wrap">
            {project.description || "No description provided."}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <button
            onClick={handleViewProject}
            className="bg-[#7E0020] text-white w-full py-3 rounded-lg font-semibold transition hover:bg-[#5a0017]"
          >
            View Project
          </button>
          <button
            onClick={handleDeleteClick}
            className="bg-[#D9D9D9] text-[#7E0020] w-full py-3 rounded-lg font-semibold"
          >
            Delete Project
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to delete this project?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
};

export default ProjectModal;
