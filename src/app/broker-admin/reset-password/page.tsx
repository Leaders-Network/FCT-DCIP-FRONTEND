import AuthLayout from '@/components/admin/AuthLayout';
import ResetPassword from '@/components/admin/ResetPassword';
import React from 'react';

const Page = () => {
  return (
    <div>
      <AuthLayout>
        <ResetPassword />
      </AuthLayout>
    </div>
  );
};

export default Page;
