export interface Company {
  id: string;
  name: string;
  slug: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  panNumber?: string;
  subscriptionPlan: string;
  maxVehicles: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: string;
  company: {
    id: string;
    name: string;
    slug: string;
    code: string;
  };
  permissions: string[];
}

export interface VehicleDocument {
  id: string;
  documentType: string;
  documentNumber?: string;
  expiryDate?: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  alertDays: number;
  fileUrl?: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  capacity: string;
  fuelType: string;
  gpsInstalled: boolean;
  gpsImei?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'STOPPED';
  stopReason?: string;
  ownerName?: string;
  ownerPhone?: string;
  remark?: string;
  assignedDriver?: Driver;
  vehicleDocuments?: VehicleDocument[];
  complianceStatus?: string;
  nextExpiryDate?: string;
  daysRemaining?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone?: string;
  emergencyPhone?: string;
  tempAddress?: string;
  permanentAddress?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  pccDate?: string;
  medicalDate?: string;
  aadharNumber?: string;
  ownerName?: string;
  status: string;
  vehicles?: { id: string; registrationNumber: string; model: string; vehicleType: string }[];
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  department: string;
  roleTitle: string;
  shiftTiming?: string;
  emergencyContact?: string;
  location: string;
  baseSalary: number;
  status: string;
}

export interface TripStop {
  id: string;
  stopOrder: number;
  stopName: string;
  landmark?: string;
  scheduledTime?: string;
  stopType: string;
}

export interface Trip {
  id: string;
  tripDate: string;
  shift: string;
  tripDirection: string;
  status: string;
  routeName?: string;
  vehicle: Vehicle;
  driver?: Driver;
  client?: Client;
  stops: TripStop[];
}

export interface DailyTrackerRow {
  id: string;
  vehicleId: string;
  registrationNumber: string;
  assignedDriverName: string;
  driverPhone: string;
  tripCount: number;
  attendanceStatus: 'PRESENT' | 'ABSENT';
  cngExpenseToday: number;
  cngExpenseMtd: number;
  cngRecoveryRate: number;
  cngRecoveryAmount: number;
  totalRecoverableCng: number;
}

export interface AttendanceDay {
  day: number;
  status: string;
  checkIn?: string;
  checkOut?: string;
  isLate: boolean;
}

export interface AttendanceRow {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  roleTitle: string;
  shiftTiming?: string;
  days: AttendanceDay[];
  summary: {
    presentDays: number;
    absentDays: number;
    weekOffDays: number;
    lateMarks: number;
    lateDeductionDays: number;
    payableDays: number;
    attendancePercentage: number;
  };
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  roleTitle: string;
  presentDays: number;
  absentDays: number;
  weekOffDays: number;
  lateMarks: number;
  lateDeductionDays: number;
  payableDays: number;
  attendancePercentage: number;
  baseSalary: number;
  absentDeduction: number;
  lateDeduction: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
  approvedBy?: string;
}

export interface Expense {
  id: string;
  expenseDate: string;
  category: string;
  amount: number;
  paymentMode: string;
  paidBy?: string;
  beneficiary?: string;
  description?: string;
  vehicleId?: string;
  approvalStatus: string;
  recoveryStatus: string;
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface ClientRateCard {
  id: string;
  vehicleType: string;
  isAc: boolean;
  minDistanceKm: number;
  maxDistanceKm: number;
  rateType: string;
  baseRate: number;
  extraKmRate?: number;
  shiftTiming?: string;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  officeContact?: string;
  misContact?: string;
  inductionContact?: string;
  billingContact?: string;
  address?: string;
  gstNumber?: string;
  status: string;
  rateCards?: ClientRateCard[];
  _count?: { trips: number; invoices: number };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  notes?: string;
  client: Client;
}

export interface Task {
  id: string;
  department: string;
  assigneeName?: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'ON_HOLD';
  bossRemarks?: string;
  createdAt: string;
}
