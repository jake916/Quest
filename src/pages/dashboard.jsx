import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";

const Dashboard = () => {
    return (
        <div className="h-screen bg-[#EEEFEF] w-337">
            {/* Sidebar */}
            <div className="fixed h-screen">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="ml-[200px] w-290 overflow-y-auto h-screen">

                <PageHeader />
                <div className="p-6 min-h-screen pl-20 ">
                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-240 ">
                        {/* Welcome Card */}
                        <div className="bg-[#D8BEC6] p-6 rounded-2xl col-span-1 md:col-span-2 flex flex-col justify-between w-118 h-80">
                            <h2 className="text-lg font-semibold text-black">Welcome To Quest</h2>
                            <div className="text-[40px] font-bold text-black">Hello Jake Ayodeji</div>
                            <img src="/src/assets/ififif.png" alt="Welcome Illustration" className="w-60 h-60 mt-7 ml-50" />
                        </div>

                        {/* Projects Section */}
                        <div className="bg-[#D8BEC6] p-4 rounded-2xl ">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-black">Projects</h3>
                                <button className="bg-pink-500 text-white px-2 py-1 rounded-full text-sm">+</button>
                            </div>
                            <div className="mt-4 space-y-3">
                                {["Sleekpay App", "Sleekpay App", "Sleekpay App"].map((project, index) => (
                                    <div key={index} className="bg-[#E0ADBD] p-2 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-yellow-400 p-2 rounded-full">⚡</div>
                                            <div>
                                                <p className="font-semibold text-black">{project}</p>
                                                <p className="text-sm text-black">7 Tasks</p>
                                            </div>
                                        </div>
                                        <span className="text-lg text-black">→</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Users Section */}
                        <div className="bg-[#D8BEC6] p-4 rounded-2xl w-80">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-black">Users</h3>
                                <button className="bg-pink-500 text-white px-2 py-1 rounded-full text-sm">+</button>
                            </div>
                            <div className="mt-4 space-y-3">
                                {["Jake Ayodeji", "Jake Ayodeji", "Jake Ayodeji"].map((user, index) => (
                                    <div key={index} className="bg-[#E0ADBD] p-2 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src="src\assets\Ellipse 5.png" alt="User Avatar" className="w-8 h-8 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-black">{user}</p>
                                                <p className="text-sm text-gray-600 text-black">jakeayodeji@gmail.com</p>
                                            </div>
                                        </div>
                                        <span className="text-lg text-black">→</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Task Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 w-264">
                        {[
                            { title: "Total Tasks", count: 25 },
                            { title: "Ongoing Tasks", count: 15 },
                            { title: "Completed Tasks", count: 5 },
                            { title: "Overdue Tasks", count: 5 },
                        ].map((item, index) => (
                            <div key={index} className="bg-[#D8BEC6] p-4 rounded-2xl text-left">
                                <p className="text-sm text-black">{item.title}</p>
                                <p className="text-2xl font-bold text-black ">{item.count}</p>
                            </div>
                        ))}
                    </div>

                    {/* My Tasks Section */}
                    <div className="bg-[#D8BEC6] p-6 rounded-2xl mt-6 w-264">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-black">My Tasks <span className="bg-red-500 text-white px-2 py-1 text-xs rounded-full">5</span></h3>
                            <button className="bg-red-500 text-white px-4 py-2 rounded-lg">All Projects ▼</button>
                        </div>
                        <div className="mt-4 space-y-3">
                            {[1, 2, 3].map((task, index) => (
                                <div key={index} className="bg-[#E0ADBD] p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-400 p-2 rounded-full">⚡</div>
                                        <p className="text-sm text-black">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut lab</p>
                                    </div>
                                    <span className="text-lg text-black">→</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
