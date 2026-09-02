"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { setAuthToken } from '@/utils/auth';

const NIAAdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // NIA admin login API call
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/loginEmployee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || '',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const employeeRole = data.employee?.employeeRole?.role;
                const isNIAAdmin = employeeRole === 'NIA' || employeeRole === 'NIA-Admin' || data.employee?.organization === 'NIA';
                const isSuperAdmin = employeeRole === 'Super-admin';

                // Check if user is NIA admin or Super-admin
                if (isNIAAdmin || isSuperAdmin) {
                    const tokenType = isSuperAdmin ? 'super-admin' : 'nia-admin';

                    // Store NIA admin token and info
                    setAuthToken(data.token, tokenType);
                    localStorage.setItem('token', data.token);
                    if (isNIAAdmin) {
                        localStorage.setItem('adminToken', data.token);
                        localStorage.setItem('niaAdminToken', data.token);
                    }
                    localStorage.setItem('employeeInfo', JSON.stringify(data.employee));
                    localStorage.setItem('niaAdminInfo', JSON.stringify({
                        fullname: `${data.employee?.firstname || ''} ${data.employee?.lastname || ''}`.trim(),
                        email: data.employee?.email || '',
                        organization: isNIAAdmin ? 'NIA' : 'AMMC',
                        role: employeeRole
                    }));
                    localStorage.setItem('organization', isNIAAdmin ? 'NIA' : 'AMMC');

                    // Redirect to NIA admin dashboard
                    router.push('/nia-admin/dashboard');
                } else {
                    setError('Access denied. This portal is for NIA administrators and super admins only.');
                }
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            setError('Network error. Please try again.');
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
                <Image
                    src="/bg-hero-11.jpg"
                    alt="NIA dashboard background"
                    fill
                    className="object-cover opacity-50 scale-105 transition-transform duration-[20s] ease-out hover:scale-110"
                    priority
                />
                {/* Modern multi-layer gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-black/60 to-black/90 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Glassmorphic content container */}
                <div className="relative z-10 px-12 text-white max-w-2xl animate-fade-in-up">
                    <div className="backdrop-blur-md bg-white/10 p-10 rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center mb-8 gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-lg">
                                <Building2 className="h-10 w-10 text-blue-600" />
                            </div>
                            <div className="text-xl font-bold tracking-wider text-blue-400 uppercase">
                                Nigerian Insurers Association
                            </div>
                        </div>
                        
                        <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                            NIA Admin Portal
                        </h2>
                        <p className="text-lg text-gray-200 leading-relaxed font-light">
                            Empowering NIA administrators to manage surveyors, monitor assignments, and maintain strict compliance standards.
                        </p>
                        
                        <div className="mt-10 flex gap-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-300 bg-blue-900/40 px-4 py-2 rounded-full border border-blue-500/30">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                Verified Network
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-indigo-300 bg-indigo-900/40 px-4 py-2 rounded-full border border-indigo-500/30">
                                Compliance Sync
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
                            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
                                <Building2 className="h-10 w-10 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                            Welcome back
                        </h2>
                        <p className="text-sm md:text-base text-gray-500">
                            Sign in to manage NIA surveyors and assignments
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
                                        placeholder="admin@nia.com"
                                        className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                                        value={formData.email}
                                        onChange={handleInputChange}
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
                                            className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm pr-12"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
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
                                        <div className="h-5 w-5 border border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="ml-2.5 group-hover:text-gray-900 transition-colors">Remember me</span>
                                </label>
                                <Link href="/nia-admin/reset-password" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.email || !formData.password}
                                className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-300 shadow-sm ${loading || !formData.email || !formData.password
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5'
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
                                    "Sign in to NIA Portal"
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="text-center space-y-3 animate-fade-in-up delay-100">
                        <p className="text-sm text-gray-500">
                            Not a NIA admin?{' '}
                            <Link href="/admin/login" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                                AMMC Admin Login
                            </Link>
                        </p>
                        <p className="text-sm text-gray-500">
                            Or{' '}
                            <Link href="/surveyor" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                                Surveyor Portal
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NIAAdminLogin;
