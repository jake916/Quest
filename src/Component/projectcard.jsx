import React from "react";
import ProjectImageOrLetter from "./ProjectImageOrLetter";

const ProjectCard = ({ name, logo, onClick }) => {
  const imageClass = "w-10 h-10 rounded-full mr-5";

  return (
    <div onClick={onClick} className="flex items-center bg-gray-300 rounded-lg p-4 shadow-md w-64 cursor-pointer">
      <ProjectImageOrLetter projectName={name} projectImage={logo} size={40} />
      <p className="ml-5 text-black font-semibold">{name}</p>
    </div>
  );
};

export default ProjectCard;
