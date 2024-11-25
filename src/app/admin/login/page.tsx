import AdminLogin from '@/components/admin/AdminLogin';
import AuthLayout from '@/components/admin/AuthLayout';

import React from 'react'

const page = () => {
  return (
    <>
      <AuthLayout>
        <AdminLogin />
      </AuthLayout>
    </>
  );
}

export default page
