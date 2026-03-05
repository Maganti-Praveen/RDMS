import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, UserPlus, ClipboardList,
    Menu, X, LogOut, GraduationCap, ChevronLeft, Home, Compass, ArrowRightLeft, Lock
} from 'lucide-react';
import collegeLogo from '../../assets/rcee.png';
import GlobalSearch from '../ui/GlobalSearch';
import NotificationBell from '../ui/NotificationBell';
import ChangePasswordModal from '../ui/ChangePasswordModal';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [passwordModal, setPasswordModal] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/home', label: 'Home', icon: Home, roles: ['faculty', 'hod'] },
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'hod'] },
        { to: '/explore', label: 'Explore', icon: Compass, roles: ['admin', 'hod'] },
        { to: '/faculty', label: 'Faculty', icon: Users, roles: ['admin', 'hod'] },
        { to: '/compare', label: 'Compare Depts', icon: ArrowRightLeft, roles: ['admin'] },
        { to: '/create-account', label: 'Create Account', icon: UserPlus, roles: ['admin', 'hod'] },
        { to: '/my-profile', label: 'My Profile', icon: GraduationCap, roles: ['admin', 'faculty', 'hod'] },
        { to: '/activity-logs', label: 'Activity Logs', icon: ClipboardList, roles: ['admin'] },
    ];

    const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
    ${isActive
            ? 'bg-white/15 text-white border-l-[3px] border-accent-500 pl-[9px]'
            : 'text-primary-200 hover:text-white hover:bg-white/10'}`;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                <img
                    src={collegeLogo}
                    alt="RCE"
                    className="w-20 h-11 rounded-lg bg-white px-1 py-0.5 shadow-md shrink-0 object-contain"
                />
                {!collapsed && (
                    <div>
                        <h1 className="text-white font-bold text-base tracking-tight">RDMS Portal</h1>
                        <p className="text-primary-300 text-[10px] leading-tight">Research & Dept Mgmt</p>
                    </div>
                )}
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="px-3 pt-4 pb-2">
                    <GlobalSearch />
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {filteredNav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={linkClasses}
                        onClick={() => setMobileOpen(false)}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User Info, Notifications & Logout */}
            <div className="px-3 py-4 border-t border-white/10">
                {!collapsed && (
                    <div className="px-3 py-2 mb-2">
                        <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-primary-300 text-xs capitalize">{user?.role} • {user?.department}</p>
                    </div>
                )}
                <div className="flex items-center gap-1 mb-2">
                    <NotificationBell />
                    <button
                        onClick={() => setPasswordModal(true)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-primary-200 hover:bg-white/10 hover:text-white transition-colors"
                        title="Change Password"
                    >
                        <Lock className="w-4.5 h-4.5" />
                    </button>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
          text-red-300 hover:text-white hover:bg-red-600/20 transition-colors duration-200"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-primary-800 text-white p-2 rounded-lg shadow-lg"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-primary-900 transform transition-transform duration-300
        lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            {/* Desktop sidebar */}
            <aside className={`hidden lg:flex flex-col h-screen bg-primary-900 sticky top-0 transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-64'}`}>
                <SidebarContent />
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-8 bg-primary-800 border border-primary-700 text-primary-300 hover:text-white
          w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                    <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                </button>
            </aside>

            {/* Change Password Modal */}
            <ChangePasswordModal isOpen={passwordModal} onClose={() => setPasswordModal(false)} />
        </>
    );
};

export default Sidebar;
