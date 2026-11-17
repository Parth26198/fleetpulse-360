import { Router } from 'express';
import multer from 'multer';
import {
  AuthController,
  DashboardController,
  FleetController,
  DriverController,
  TripController,
  TrackerController,
  AttendanceController,
  PayrollController,
  ExpenseController,
  ClientController,
  InvoiceController,
  TaskController,
  ReportController,
  ExcelImportController,
} from '../controllers/apiControllers';
import { authenticate } from '../middlewares/auth';
import { requireRole, requirePermission } from '../middlewares/rbac';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

export const apiRouter = Router();

// Public Auth routes
apiRouter.post('/auth/login', AuthController.login);

// Protected routes (All endpoints below require valid JWT token)
apiRouter.use(authenticate);

// Current User & Organization Management
apiRouter.get('/auth/me', AuthController.getMe);
apiRouter.get('/auth/companies', AuthController.listCompanies);
apiRouter.get('/auth/users', requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']), AuthController.listUsers);
apiRouter.get('/auth/roles', requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']), AuthController.listRoles);

// 1. Executive Dashboard (LIVE METRICS)
apiRouter.get('/dashboard/stats', DashboardController.getStats);

// 2. Fleet & Vehicle Compliance
apiRouter.get('/fleet/vehicles', FleetController.listVehicles);
apiRouter.get('/fleet/vehicles/:id', FleetController.getVehicle);
apiRouter.post('/fleet/vehicles', requirePermission('fleet', 'create'), FleetController.createVehicle);
apiRouter.put('/fleet/vehicles/:id', requirePermission('fleet', 'edit'), FleetController.updateVehicle);
apiRouter.delete('/fleet/vehicles/:id', requirePermission('fleet', 'delete'), FleetController.deleteVehicle);
apiRouter.put('/fleet/vehicles/:id/documents/:docType', requirePermission('compliance', 'edit'), FleetController.updateDocument);

// 3. Drivers
apiRouter.get('/drivers', DriverController.listDrivers);
apiRouter.get('/drivers/:id', DriverController.getDriver);
apiRouter.post('/drivers', requirePermission('drivers', 'create'), DriverController.createDriver);
apiRouter.put('/drivers/:id', requirePermission('drivers', 'edit'), DriverController.updateDriver);
apiRouter.delete('/drivers/:id', requirePermission('drivers', 'delete'), DriverController.deleteDriver);

// 4. Trips & 5-Stage Dispatch
apiRouter.get('/trips', TripController.listTrips);
apiRouter.post('/trips', requirePermission('trips', 'create'), TripController.createTrip);
apiRouter.delete('/trips/:id', requirePermission('trips', 'delete'), TripController.deleteTrip);

// 5. Daily Vehicle Tracker (24-Hour & 5% CNG Recovery)
apiRouter.get('/tracker', TrackerController.getDailyTracker);
apiRouter.post('/tracker/cng', requirePermission('fleet', 'edit'), TrackerController.updateCng);

// 6. Attendance Management
apiRouter.get('/attendance', AttendanceController.getMonthlyRegister);
apiRouter.post('/attendance', requirePermission('attendance', 'edit'), AttendanceController.markAttendance);

// 7. Executive Payroll System
apiRouter.get('/payroll', PayrollController.getMonthlyPayroll);
apiRouter.post('/payroll/recalculate', requirePermission('payroll', 'create'), PayrollController.recalculatePayroll);
apiRouter.put('/payroll/:id/status', requirePermission('payroll', 'approve'), PayrollController.updateStatus);

// 8. Expense Management & Cash Advances
apiRouter.get('/expenses', ExpenseController.listExpenses);
apiRouter.post('/expenses', requirePermission('expenses', 'create'), ExpenseController.createExpense);
apiRouter.put('/expenses/:id', requirePermission('expenses', 'edit'), ExpenseController.updateExpense);
apiRouter.delete('/expenses/:id', requirePermission('expenses', 'delete'), ExpenseController.deleteExpense);

// 9. Client Directory & Rate Cards
apiRouter.get('/clients', ClientController.listClients);
apiRouter.get('/clients/:id', ClientController.getClient);
apiRouter.post('/clients', requirePermission('clients', 'create'), ClientController.createClient);
apiRouter.put('/clients/:id', requirePermission('clients', 'edit'), ClientController.updateClient);
apiRouter.post('/clients/:id/rate-cards', requirePermission('rate_cards', 'create'), ClientController.addRateCard);
apiRouter.delete('/clients/rate-cards/:id', requirePermission('rate_cards', 'delete'), ClientController.deleteRateCard);

// 10. Invoicing & Billing
apiRouter.get('/invoices', InvoiceController.listInvoices);
apiRouter.get('/invoices/:id', InvoiceController.getInvoice);
apiRouter.post('/invoices', requirePermission('invoices', 'create'), InvoiceController.createInvoice);
apiRouter.post('/invoices/:id/payment', requirePermission('invoices', 'edit'), InvoiceController.recordPayment);
apiRouter.get('/invoices/:id/pdf', InvoiceController.downloadPDF);

// 11. Department Tasks
apiRouter.get('/tasks', TaskController.listTasks);
apiRouter.post('/tasks', requirePermission('tasks', 'create'), TaskController.createTask);
apiRouter.put('/tasks/:id', requirePermission('tasks', 'edit'), TaskController.updateTask);
apiRouter.delete('/tasks/:id', requirePermission('tasks', 'delete'), TaskController.deleteTask);

// 12. Reports Export (ExcelJS)
apiRouter.get('/reports/fleet/export', ReportController.exportFleet);
apiRouter.get('/reports/payroll/export', ReportController.exportPayroll);
apiRouter.get('/reports/tracker/export', ReportController.exportTracker);

// 13. Excel Import System
apiRouter.post('/import/inspect', upload.single('file'), ExcelImportController.inspectFile);
apiRouter.post('/import/execute', upload.single('file'), ExcelImportController.importWorksheet);
apiRouter.get('/import/jobs', ExcelImportController.listJobs);
