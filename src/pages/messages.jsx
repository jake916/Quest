import Sidebar from "../Component/sidebar"

const messages = () => {
    return (
        <div className="h-screen">
            {/* Sidebar */}
            <div className="fixed h-screen">
                <Sidebar />
            </div>

            {/* Main Content Area */}
        </div>
    )
}

export default messages