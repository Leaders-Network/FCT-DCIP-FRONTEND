import AdminLogin from '@/components/admin/AdminLogin';
import AuthLayout from '@/components/admin/AuthLayout';
import Header from '@/components/Header';
import Image from 'next/image';
import React from 'react'

const page = () => {
  return (
    <>
      <AuthLayout
      >
        <AdminLogin />
      </AuthLayout>
    </>
  );
}

export default page
