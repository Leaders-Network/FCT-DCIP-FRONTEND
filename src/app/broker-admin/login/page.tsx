'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { brokerAdminAPI } from '@/services/api';
import { setAuthToken } from '@/utils/auth';

export default function BrokerAdminLogin() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate form
            if (!formData.email || !formData.password) {
                setError('Please provide both email and password');
                setLoading(false);
                return;
            }

            // Call login API
            const response = await brokerAdminAPI.login(formData.email, formData.password);

            if (response.success && response.token) {
                const responseTokenType = response.user?.tokenType === 'super-admin' ? 'super-admin' : 'broker-admin';

                // Store token and user info
                setAuthToken(response.token, responseTokenType);
                localStorage.setItem('brokerAdminInfo', JSON.stringify({
                    ...response.user,
                    brokerAdmin: response.brokerAdmin
                }));

                // Force a small delay to ensure localStorage is written
                await new Promise(resolve => setTimeout(resolve, 100));

                // Redirect to dashboard
                window.location.href = '/broker-admin/dashboard';
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string; message?: string } } };
            setError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Login failed. Please check your credentials and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full grid md:grid-cols-2 overflow-hidden bg-white">
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    opacity: 0;
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .delay-100 {
                    animation-delay: 100ms;
                }
            `}</style>
            
            {/* Left Image Section */}
            <div className="relative hidden md:flex items-center justify-center overflow-hidden bg-black">
                <img
                    src="/bg-hero-11.jpg"
                    alt="Broker dashboard background"
                    className="absolute inset-0 object-cover w-full h-full opacity-50 scale-105 transition-transform duration-[20s] ease-out hover:scale-110"
                />
                {/* Modern multi-layer gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-black/60 to-black/90 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Glassmorphic content container */}
                <div className="relative z-10 px-12 text-white max-w-2xl animate-fade-in-up">
                    <div className="backdrop-blur-md bg-white/10 p-10 rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center mb-8 gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-lg flex items-center justify-center">
                                <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="text-xl font-bold tracking-wider text-indigo-400 uppercase">
                                Broker Management
                            </div>
                        </div>
                        
                        <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                            Broker Admin Portal
                        </h2>
                        <p className="text-lg text-gray-200 leading-relaxed font-light">
                            Securely manage insurance claims, monitor policy renewals, and oversee broker operations with real-time analytics.
                        </p>
                        
                        <div className="mt-10 flex gap-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-indigo-300 bg-indigo-900/40 px-4 py-2 rounded-full border border-indigo-500/30">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                                Claims Tracking
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-300 bg-blue-900/40 px-4 py-2 rounded-full border border-blue-500/30">
                                Secure Access
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="flex flex-col justify-center items-center bg-white h-screen p-6 md:p-10 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2 animate-fade-in-up">
                        {/* Icon for mobile */}
                        <div className="md:hidden flex justify-center mb-6">
                            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg flex items-center justify-center">
                                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                            Welcome back
                        </h2>
                        <p className="text-sm md:text-base text-gray-500">
                            Sign in to manage insurance claims
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-in-up delay-100">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="broker@example.com"
                                        className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Enter your password"
                                            className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm pr-12"
                                            value={formData.password}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={loading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl text-sm text-red-600 flex items-start animate-fade-in-up">
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center text-gray-700 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                        />
                                        <div className="h-5 w-5 border border-gray-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="ml-2.5 group-hover:text-gray-900 transition-colors">Remember me</span>
                                </label>
                                <a href="/broker-admin/reset-password" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.email || !formData.password}
                                className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-300 shadow-sm ${loading || !formData.email || !formData.password
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-indigo-600 to-indigo-800 hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-0.5'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
