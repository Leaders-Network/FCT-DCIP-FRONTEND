"use client";
import React from "react";
import UnderwriterAdminManagement from "@/components/admin/UnderwriterAdminManagement";
import RequireSession from "@/components/shared/RequireSession";

export default function UnderwriterAdminsPage() {
    return (
        <RequireSession area="admin">
            <div className="min-h-screen bg-gray-50">
                <UnderwriterAdminManagement />
            </div>
        </RequireSession>
    );
}
