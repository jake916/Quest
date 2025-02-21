import { FiSearch } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";

const PageHeader = () => {
  return (
    <div className="flex justify-between items-center p-4 border-b gap-120 ">
      {/* Dashboard Title */}
      <p className=" text-[30px] font-bold text-[#72001D] pl-20 ">Dashboard</p>

      {/* Search and New Task Button */}
      <div className="flex items-center gap-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="px-4 py-2 pl-10 border rounded-lg focus:outline-none bg-[#CFD4E9] text-black focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
        <FaPlus className="mr-2" />
          New Task
        </button>
      </div>
    </div>
  );
};

export default PageHeader;
