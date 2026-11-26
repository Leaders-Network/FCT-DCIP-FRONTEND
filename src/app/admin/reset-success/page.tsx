import AuthLayout from '@/components/admin/AuthLayout'
import Success from '@/components/admin/Success'
import React from 'react'

// Shown after an admin finishes a password reset. "Proceed to login" goes to
// /admin/login. (/admin/registration-success is the post-employee-registration
// screen and links to the dashboard, so it must not be reused here.)
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
