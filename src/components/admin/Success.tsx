'use client'
import React from 'react'
import Button from '../Button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Success = () => {
  const router = useRouter();

  const handleProceedToLogin = () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    let loginRoute = '/admin/login';

    if (currentPath.includes('/nia-admin')) {
      loginRoute = '/nia-admin/login';
    } else if (currentPath.includes('/broker-admin')) {
      loginRoute = '/broker-admin/login';
    } else if (currentPath.includes('/surveyor')) {
      loginRoute = '/surveyor';
    } else if (currentPath.includes('/dashboard') || currentPath.includes('/reset-password')) {
      loginRoute = '/login';
    }

    router.push(loginRoute);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <Image src="/done.png" alt="success" width={50} height={50} />
      <h2 className="text-xl md:text-3xl font-bold mb-4 mt-3">
        Password reset successful
      </h2>
      <p className="text-gray-600 text-base font-bold md:text-xl max-w-[350px] mb-4 md:mb-6">
        Your password has been changed successfully
      </p>
      <div className="flex items-center justify-between mb-6">
        <Button title="Proceed to login" onClick={handleProceedToLogin} />
      </div>
    </div>
  );
};

export default Success
