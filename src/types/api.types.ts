// User related types
export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  employeeStatus: {
    _id: string;
    status: string;
  };
  employeeRole: {
    _id: string;
    role: string;
  };
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const enum UserRoles {
  SUPER_ADMIN = "67097fb3f07f5547278be69b",
  ADMIN = "67097fb3f07f5547278be69c",
  STAFF = "67097fb3f07f5547278be69d"
}

export interface Role {
  _id: string;
  name: string;
}

export interface EmployeeRegistrationData {
  firstname: string;
  lastname: string;
  phonenumber: string;
  email: string;
  roleId: string;
  statusId: string;
}

// API Response types
export interface LoginResponse {
  success: boolean;
  employee: User;
  token: string;
}

export interface AvailableRolesResponse {
  role: string;
  roles: Role[];
}

export interface GetAllEmployeesResponse {
  success: boolean;
  allStaff: {
    count: number;
    sanitizedEmployees: User[];
  };
}
