import AuthLayout from '@/components/admin/AuthLayout'
import RegistrationSuccess from '@/components/admin/RegistrationSuccess'
import React from 'react'

const page = () => {
  return (
    <div>
      <AuthLayout>
        <RegistrationSuccess />
      </AuthLayout>
    </div>
  )
}

export default page