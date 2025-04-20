import React from "react";

const ProjectImageOrLetter = ({ projectName, projectImage, size = 40 }) => {
  const firstLetter = projectName ? projectName.charAt(0).toUpperCase() : "";

  const circleStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: "white",
    color: "#7E0020",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: size * 0.6,
    userSelect: "none",
  };

  if (projectImage) {
    return (
      <img
        src={projectImage}
        alt={projectName}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  return <div style={circleStyle}>{firstLetter}</div>;
};

export default ProjectImageOrLetter;
