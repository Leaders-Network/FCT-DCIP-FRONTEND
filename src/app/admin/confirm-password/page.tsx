import AuthLayout from '@/components/admin/AuthLayout'
import Success from '@/components/admin/Success'
import React from 'react'

const page = () => {
  return (
    <div>
      <AuthLayout>
        <Success />
      </AuthLayout>
    </div>
  )
}

export default page
