import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { DashboardService } from '../services/dashboardService';
import { FleetService } from '../services/fleetService';
import { DriverService } from '../services/driverService';
import { TripService } from '../services/tripService';
import { TrackerService } from '../services/trackerService';
import { AttendanceService } from '../services/attendanceService';
import { PayrollService } from '../services/payrollService';
import { ExpenseService } from '../services/expenseService';
import { ClientService } from '../services/clientService';
import { InvoiceService } from '../services/invoiceService';
import { TaskService } from '../services/taskService';
import { ReportService } from '../services/reportService';
import { ExcelImportService } from '../services/excelImportService';
import { getTenantCompanyId } from '../middlewares/rbac';

// 1. Auth Controller
export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required.' });
      }
      const result = await AuthService.login(email, password);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.getMe(req.user!.id);
      res.json({ success: true, user: result });
    } catch (err) {
      next(err);
    }
  }

  static async listCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await AuthService.listCompanies();
      res.json({ success: true, companies });
    } catch (err) {
      next(err);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const users = await AuthService.listUsers(companyId);
      res.json({ success: true, users });
    } catch (err) {
      next(err);
    }
  }

  static async listRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AuthService.listRoles();
      res.json({ success: true, roles });
    } catch (err) {
      next(err);
    }
  }
}

// 2. Dashboard Controller
export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const stats = await DashboardService.getExecutiveStats(companyId);
      res.json({ success: true, stats });
    } catch (err) {
      next(err);
    }
  }
}

// 3. Fleet Controller
export class FleetController {
  static async listVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const vehicles = await FleetService.listVehicles(companyId, req.query as any);
      res.json({ success: true, vehicles });
    } catch (err) {
      next(err);
    }
  }

  static async getVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const vehicle = await FleetService.getVehicleById(companyId, req.params.id);
      res.json({ success: true, vehicle });
    } catch (err) {
      next(err);
    }
  }

  static async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const vehicle = await FleetService.createVehicle(companyId, req.body);
      res.status(201).json({ success: true, vehicle });
    } catch (err) {
      next(err);
    }
  }

  static async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await FleetService.updateVehicle(companyId, req.params.id, req.body);
      res.json({ success: true, message: 'Vehicle updated successfully.' });
    } catch (err) {
      next(err);
    }
  }

  static async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await FleetService.deleteVehicle(companyId, req.params.id);
      res.json({ success: true, message: 'Vehicle deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  static async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const doc = await FleetService.updateDocument(companyId, req.params.id, req.params.docType, req.body);
      res.json({ success: true, document: doc });
    } catch (err) {
      next(err);
    }
  }
}

// 4. Driver Controller
export class DriverController {
  static async listDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const drivers = await DriverService.listDrivers(companyId, req.query.search as string);
      res.json({ success: true, drivers });
    } catch (err) {
      next(err);
    }
  }

  static async getDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const driver = await DriverService.getDriverById(companyId, req.params.id);
      res.json({ success: true, driver });
    } catch (err) {
      next(err);
    }
  }

  static async createDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const driver = await DriverService.createDriver(companyId, req.body);
      res.status(201).json({ success: true, driver });
    } catch (err) {
      next(err);
    }
  }

  static async updateDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await DriverService.updateDriver(companyId, req.params.id, req.body);
      res.json({ success: true, message: 'Driver updated successfully.' });
    } catch (err) {
      next(err);
    }
  }

  static async deleteDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await DriverService.deleteDriver(companyId, req.params.id);
      res.json({ success: true, message: 'Driver deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
}

// 5. Trip Controller
export class TripController {
  static async listTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const trips = await TripService.listTrips(companyId, req.query as any);
      res.json({ success: true, trips });
    } catch (err) {
      next(err);
    }
  }

  static async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const trip = await TripService.createTrip(companyId, req.body);
      res.status(201).json({ success: true, trip });
    } catch (err) {
      next(err);
    }
  }

  static async deleteTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await TripService.deleteTrip(companyId, req.params.id);
      res.json({ success: true, message: 'Trip deleted.' });
    } catch (err) {
      next(err);
    }
  }
}

// 6. Tracker Controller
export class TrackerController {
  static async getDailyTracker(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const tracker = await TrackerService.getDailyTracker(companyId, req.query.date as string);
      res.json({ success: true, ...tracker });
    } catch (err) {
      next(err);
    }
  }

  static async updateCng(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const { vehicleId, cngToday, date } = req.body;
      const result = await TrackerService.updateVehicleCng(companyId, vehicleId, Number(cngToday), date);
      res.json({ success: true, tracking: result });
    } catch (err) {
      next(err);
    }
  }
}

// 7. Attendance Controller
export class AttendanceController {
  static async getMonthlyRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const m = req.query.month ? parseInt(req.query.month as string, 10) : 11;
      const y = req.query.year ? parseInt(req.query.year as string, 10) : 2026;
      const register = await AttendanceService.getMonthlyRegister(companyId, m, y);
      res.json({ success: true, register });
    } catch (err) {
      next(err);
    }
  }

  static async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const result = await AttendanceService.markAttendance(companyId, req.body);
      res.json({ success: true, record: result });
    } catch (err) {
      next(err);
    }
  }
}

// 8. Payroll Controller
export class PayrollController {
  static async getMonthlyPayroll(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const m = req.query.month ? parseInt(req.query.month as string, 10) : 11;
      const y = req.query.year ? parseInt(req.query.year as string, 10) : 2026;
      const payroll = await PayrollService.getMonthlyPayroll(companyId, m, y);
      res.json({ success: true, payroll });
    } catch (err) {
      next(err);
    }
  }

  static async recalculatePayroll(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const m = req.body.month ? parseInt(req.body.month, 10) : 11;
      const y = req.body.year ? parseInt(req.body.year, 10) : 2026;
      const payroll = await PayrollService.generatePayrollFromAttendance(companyId, m, y);
      res.json({ success: true, payroll });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await PayrollService.updateStatus(companyId, req.params.id, req.body.status, req.user?.name);
      res.json({ success: true, message: `Payroll status set to ${req.body.status}` });
    } catch (err) {
      next(err);
    }
  }
}

// 9. Expense Controller
export class ExpenseController {
  static async listExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const result = await ExpenseService.listExpenses(companyId, req.query as any);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const expense = await ExpenseService.createExpense(companyId, req.body);
      res.status(201).json({ success: true, expense });
    } catch (err) {
      next(err);
    }
  }

  static async updateExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await ExpenseService.updateExpense(companyId, req.params.id, req.body);
      res.json({ success: true, message: 'Expense updated.' });
    } catch (err) {
      next(err);
    }
  }

  static async deleteExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await ExpenseService.deleteExpense(companyId, req.params.id);
      res.json({ success: true, message: 'Expense deleted.' });
    } catch (err) {
      next(err);
    }
  }
}

// 10. Client Controller
export class ClientController {
  static async listClients(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const clients = await ClientService.listClients(companyId);
      res.json({ success: true, clients });
    } catch (err) {
      next(err);
    }
  }

  static async getClient(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const client = await ClientService.getClientById(companyId, req.params.id);
      res.json({ success: true, client });
    } catch (err) {
      next(err);
    }
  }

  static async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const client = await ClientService.createClient(companyId, req.body);
      res.status(201).json({ success: true, client });
    } catch (err) {
      next(err);
    }
  }

  static async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await ClientService.updateClient(companyId, req.params.id, req.body);
      res.json({ success: true, message: 'Client updated.' });
    } catch (err) {
      next(err);
    }
  }

  static async addRateCard(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const rateCard = await ClientService.addRateCard(companyId, req.params.id, req.body);
      res.status(201).json({ success: true, rateCard });
    } catch (err) {
      next(err);
    }
  }

  static async deleteRateCard(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await ClientService.deleteRateCard(companyId, req.params.id);
      res.json({ success: true, message: 'Rate card deleted.' });
    } catch (err) {
      next(err);
    }
  }
}

// 11. Invoice Controller
export class InvoiceController {
  static async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const invoices = await InvoiceService.listInvoices(companyId, req.query.status as string);
      res.json({ success: true, invoices });
    } catch (err) {
      next(err);
    }
  }

  static async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const invoice = await InvoiceService.getInvoiceById(companyId, req.params.id);
      res.json({ success: true, invoice });
    } catch (err) {
      next(err);
    }
  }

  static async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const invoice = await InvoiceService.createInvoice(companyId, req.body);
      res.status(201).json({ success: true, invoice });
    } catch (err) {
      next(err);
    }
  }

  static async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const invoice = await InvoiceService.recordPayment(companyId, req.params.id, Number(req.body.amount));
      res.json({ success: true, invoice });
    } catch (err) {
      next(err);
    }
  }

  static async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const buffer = await InvoiceService.generateInvoicePDF(companyId, req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${req.params.id}.pdf`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
}

// 12. Task Controller
export class TaskController {
  static async listTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const result = await TaskService.listTasks(companyId, req.query as any);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const task = await TaskService.createTask(companyId, req.body);
      res.status(201).json({ success: true, task });
    } catch (err) {
      next(err);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await TaskService.updateTask(companyId, req.params.id, req.body);
      res.json({ success: true, message: 'Task updated.' });
    } catch (err) {
      next(err);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      await TaskService.deleteTask(companyId, req.params.id);
      res.json({ success: true, message: 'Task deleted.' });
    } catch (err) {
      next(err);
    }
  }
}

// 13. Reports Controller
export class ReportController {
  static async exportFleet(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const buffer = await ReportService.exportFleetCompliance(companyId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Fleet_Compliance_Register.xlsx');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }

  static async exportPayroll(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const m = req.query.month ? parseInt(req.query.month as string, 10) : 11;
      const y = req.query.year ? parseInt(req.query.year as string, 10) : 2026;
      const buffer = await ReportService.exportPayroll(companyId, m, y);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Payroll_${m}_${y}.xlsx`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }

  static async exportTracker(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const buffer = await ReportService.exportDailyTracker(companyId, req.query.date as string);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Daily_Vehicle_Tracker.xlsx');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
}

// 14. Excel Import Controller
export class ExcelImportController {
  static async inspectFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload an Excel (.xlsx) file.' });
      }
      const result = await ExcelImportService.inspectWorkbook(req.file.buffer);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async importWorksheet(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload an Excel (.xlsx) file.' });
      }
      const companyId = getTenantCompanyId(req);
      const { sheetName, targetModule } = req.body;
      const result = await ExcelImportService.importWorksheet(
        companyId,
        req.file.buffer,
        sheetName,
        targetModule,
        req.user?.name
      );
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = getTenantCompanyId(req);
      const jobs = await ExcelImportService.listImportJobs(companyId);
      res.json({ success: true, jobs });
    } catch (err) {
      next(err);
    }
  }
}
