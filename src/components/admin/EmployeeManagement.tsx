"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, MoreVertical, Eye, Edit, UserPlus, Search } from 'lucide-react';
import { adminApi, withErrorHandling } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Employee {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  employeeRole: {
    role: string;
  };
  employeeStatus: {
    status: string;
  };
  createdAt: string;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [