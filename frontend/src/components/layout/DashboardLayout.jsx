import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AdminChat from '../AdminChat';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <Topbar />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* AI Chatbot — visible to admin and manager only */}
            <AdminChat />
        </div>
    );
};

export default DashboardLayout;
