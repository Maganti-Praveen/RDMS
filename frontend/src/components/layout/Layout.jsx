import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import collegeLogo from '../../assets/rcee.png';

const Layout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-dark-50">
            <Toaster position="top-right" toastOptions={{
                duration: 3000,
                style: { fontSize: '14px', borderRadius: '10px', padding: '12px 16px' },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }} />
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Header Bar */}
                <header className="bg-white border-b border-dark-100 px-4 lg:px-6 py-3 sticky top-0 z-30">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 sm:gap-3 pl-10 lg:pl-0">
                            <img
                                src={collegeLogo}
                                alt="Ramachandra College of Engineering"
                                className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                            />
                            <div className="min-w-0">
                                <h1 className="text-xs sm:text-sm font-bold text-primary-800 leading-tight truncate">
                                    Ramachandra College of Engineering
                                </h1>
                                <p className="text-[10px] sm:text-[11px] text-dark-400 leading-tight hidden xs:block">
                                    Research & Department Management System
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-dark-800">{user?.name}</p>
                                <p className="text-[11px] text-dark-400 capitalize">{user?.role} • {user?.department}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-800 text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
