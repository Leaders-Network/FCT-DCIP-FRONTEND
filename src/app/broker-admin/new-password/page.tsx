import AuthLayout from '@/components/admin/AuthLayout';
import NewPassword from '@/components/admin/NewPassword';
import React from 'react';

const Page = () => {
  return (
    <div>
      <AuthLayout>
        <NewPassword />
      </AuthLayout>
    </div>
  );
};

export default Page;
