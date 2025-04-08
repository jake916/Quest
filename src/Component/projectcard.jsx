const ProjectCard = ({ name, logo }) => {
    const imageClass = "w-10 h-10 rounded-full mr-5 "; // Add a class for image size

    
    
    return (
      <div className="flex items-center bg-gray-300 rounded-lg p-4 shadow-md w-64">
        <img src={logo} alt="Logo" className={imageClass} /> 

        <p className="text-black font-semibold">{name}</p>
      </div>
    );
  };
  
  export default ProjectCard;
