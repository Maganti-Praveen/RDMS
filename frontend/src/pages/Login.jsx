import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import collegeLogo from '../assets/rcee.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            if (user.role === 'faculty') {
                navigate('/my-profile');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - College Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary-800 relative items-center justify-center">
                <div className="relative z-10 text-center px-12">
                    <img
                        src={collegeLogo}
                        alt="Ramachandra College of Engineering"
                        className="w-40 max-h-40 mx-auto mb-8 rounded-2xl bg-white p-3 shadow-lg object-contain"
                    />
                    <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Ramachandra College of Engineering</h1>
                    <div className="w-16 h-1 bg-accent-500 mx-auto mb-4 rounded-full"></div>
                    <p className="text-primary-200 text-lg leading-relaxed max-w-md">
                        Research & Department Management System
                    </p>
                    <p className="text-primary-300/80 text-sm mt-4 max-w-sm mx-auto">
                        Digitally manage faculty research profiles, publications, patents, and institutional reports.
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center px-5 py-8 sm:p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <img
                            src={collegeLogo}
                            alt="Ramachandra College of Engineering"
                            className="w-24 max-h-24 rounded-xl bg-primary-50 p-2 shadow-md mb-3 object-contain"
                        />
                        <h1 className="text-lg font-bold text-primary-800 text-center">Ramachandra College of Engineering</h1>
                        <p className="text-xs text-dark-400">RDMS Portal</p>
                    </div>

                    <h2 className="text-2xl font-bold text-primary-800 mb-1">Welcome back</h2>
                    <p className="text-dark-500 text-sm mb-8">Sign in to your account to continue</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1.5">Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="yourname@rcee.ac.in"
                                required
                            />
                            <p className="text-xs text-dark-400 mt-1">Use your @rcee.ac.in email</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <p className="text-dark-400 text-xs">
                            Ramachandra College of Engineering
                        </p>
                        <p className="text-dark-300 text-xs mt-0.5">
                            Research & Department Portal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
