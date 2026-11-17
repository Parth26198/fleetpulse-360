import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Fleet } from './pages/Fleet';
import { Compliance } from './pages/Compliance';
import { Drivers } from './pages/Drivers';
import { Employees } from './pages/Employees';
import { Trips } from './pages/Trips';
import { DailyTracker } from './pages/DailyTracker';
import { Attendance } from './pages/Attendance';
import { Payroll } from './pages/Payroll';
import { Expenses } from './pages/Expenses';
import { Clients } from './pages/Clients';
import { Invoices } from './pages/Invoices';
import { Tasks } from './pages/Tasks';
import { Reports } from './pages/Reports';
import { ExcelImport } from './pages/ExcelImport';
import { CompanySettings } from './pages/CompanySettings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="employees" element={<Employees />} />
            <Route path="trips" element={<Trips />} />
            <Route path="daily-tracker" element={<DailyTracker />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="clients" element={<Clients />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="reports" element={<Reports />} />
            <Route path="excel-import" element={<ExcelImport />} />
            <Route path="settings" element={<CompanySettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
