import AuthLayout from '@/components/admin/AuthLayout'
import NewPassword from '@/components/admin/NewPassword'
import React from 'react'

const page = () => {
    return (
        <div>
            <AuthLayout>
                <NewPassword />
            </AuthLayout>
        </div>
    )
}

export default page