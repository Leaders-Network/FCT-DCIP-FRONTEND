import AuthLayout from '@/components/admin/AuthLayout';
import Success from '@/components/admin/Success';
import React from 'react';

const Page = () => {
  return (
    <div>
      <AuthLayout>
        <Success />
      </AuthLayout>
    </div>
  );
};

export default Page;
