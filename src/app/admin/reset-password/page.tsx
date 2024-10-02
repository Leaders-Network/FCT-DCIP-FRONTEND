import AuthLayout from '@/components/admin/AuthLayout'
import ResetPassword from '@/components/admin/ResetPassword'
import React from 'react'

const page = () => {
  return (
    <div>
      <AuthLayout >
        <ResetPassword />

      </AuthLayout>
    </div>
  )
}

export default page
