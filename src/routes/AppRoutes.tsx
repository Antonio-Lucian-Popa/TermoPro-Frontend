import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import AuthLayout from '@/components/layout/AuthLayout';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Role } from '@/types';
import CreateTeam from '@/pages/teams/CreateTeam';

// Auth pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const RegisterInvite = lazy(() => import('@/pages/auth/RegisterInvite'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

// Dashboard
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

// Company
const CreateCompany = lazy(() => import('@/pages/company/CreateCompany'));
const CompanyDetails = lazy(() => import('@/pages/company/CompanyDetails'));
const ManageEmployees = lazy(() => import('@/pages/company/ManageEmployees'));
const Invitations = lazy(() => import('@/pages/invitations/Invitations'));

// Teams
const Teams = lazy(() => import('@/pages/teams/Teams'));
const TeamDetails = lazy(() => import('@/pages/teams/TeamDetails'));

// Tasks
const Tasks = lazy(() => import('@/pages/tasks/Tasks'));
const TaskDetails = lazy(() => import('@/pages/tasks/TaskDetails'));
const CreateTask = lazy(() => import('@/pages/tasks/CreateTask'));

// Orders
const Orders = lazy(() => import('@/pages/orders/Orders'));
const OrderDetails = lazy(() => import('@/pages/orders/OrderDetails'));
const CreateOrder = lazy(() => import('@/pages/orders/CreateOrder'));

// Time-off
const TimeOff = lazy(() => import('@/pages/timeoff/TimeOff'));
const TimeOffRequests = lazy(() => import('@/pages/timeoff/TimeOffRequests'));
const CreateTimeOff = lazy(() => import('@/pages/timeoff/CreateTimeOff'));

// Profile
const Profile = lazy(() => import('@/pages/profile/Profile'));

// 404
const NotFound = lazy(() => import('@/pages/error/NotFound'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/invite" element={<RegisterInvite />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Company Routes */}
            <Route path="/company/create" element={<CreateCompany />} />
            <Route path="/company/:companyId" element={<CompanyDetails />} />
            <Route path="/company/:companyId/employees" element={<ManageEmployees />} />

            {/* Teams Routes */}
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:teamId" element={<TeamDetails />} />
            <Route path="/teams/create" element={<CreateTeam />} />

            {/* Tasks Routes */}
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:taskId" element={<TaskDetails />} />
            <Route 
              path="/tasks/create" 
              element={
                <ProtectedRoute allowedRoles={[Role.OWNER, Role.MANAGER]}>
                  <CreateTask />
                </ProtectedRoute>
              } 
            />

            {/* Orders Routes */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route 
              path="/orders/create" 
              element={
                <ProtectedRoute allowedRoles={[Role.OWNER, Role.MANAGER, Role.OPERATOR]}>
                  <CreateOrder />
                </ProtectedRoute>
              } 
            />

            {/* Time-off Routes */}
            <Route path="/timeoff" element={<TimeOff />} />
            <Route 
              path="/timeoff/requests" 
              element={
                <ProtectedRoute allowedRoles={[Role.OWNER]}>
                  <TimeOffRequests />
                </ProtectedRoute>
              } 
            />

            {/* Invitations Routes */}
            <Route
              path="/invitations/:companyId"
              element={
                <ProtectedRoute allowedRoles={[Role.OWNER, Role.MANAGER]}>
                  <Invitations />
                </ProtectedRoute>
              }
            />


            <Route path="/timeoff/create" element={<CreateTimeOff />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}