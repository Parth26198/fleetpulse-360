import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FLEETPULSE 360 database seed...');

  // 1. Roles & Permissions
  const roleNames = [
    { name: 'SUPER_ADMIN', description: 'Global System Administrator' },
    { name: 'COMPANY_ADMIN', description: 'Enterprise Company Administrator' },
    { name: 'MANAGER', description: 'Operations & Departmental Manager' },
    { name: 'OPERATIONS_EXECUTIVE', description: 'Daily Trip & Dispatch Executive' },
    { name: 'ACCOUNTS_EXECUTIVE', description: 'Finance, Expense & Invoicing Specialist' },
    { name: 'HR_EXECUTIVE', description: 'Workforce Attendance & Payroll Executive' },
    { name: 'FLEET_MANAGER', description: 'Fleet Maintenance & Compliance Manager' },
    { name: 'CLIENT_VIEWER', description: 'Client Portal Read-Only Representative' },
  ];

  const rolesMap = new Map<string, string>();
  for (const r of roleNames) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, description: r.description, isSystem: true },
    });
    rolesMap.set(r.name, role.id);
  }

  // Modules and actions
  const modules = [
    'dashboard', 'fleet', 'compliance', 'drivers', 'employees',
    'trips', 'daily_tracker', 'attendance', 'payroll', 'expenses',
    'invoices', 'clients', 'rate_cards', 'tasks', 'reports', 'users', 'settings'
  ];
  const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

  for (const mod of modules) {
    for (const act of actions) {
      const perm = await prisma.permission.upsert({
        where: { module_action: { module: mod, action: act } },
        update: {},
        create: { module: mod, action: act, description: `Permission to ${act} ${mod}` },
      });

      // Grant all permissions to SUPER_ADMIN and COMPANY_ADMIN
      for (const roleName of ['SUPER_ADMIN', 'COMPANY_ADMIN']) {
        const roleId = rolesMap.get(roleName)!;
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId: perm.id } },
          update: {},
          create: { roleId, permissionId: perm.id },
        });
      }
    }
  }

  // 2. Companies
  const shreejCompany = await prisma.company.upsert({
    where: { slug: 'shreej-logistics' },
    update: {},
    create: {
      name: 'Shreej Logistics & Operations',
      slug: 'shreej-logistics',
      code: 'SHREEJ',
      address: 'Office #402, Fortune Business Center, Baner-Pashan Link Road, Pune, Maharashtra 411045',
      phone: '+91 86985 79000',
      email: 'operations@shreejlogistics.com',
      gstNumber: '27AAECP1234F1Z8',
      panNumber: 'AAECP1234F',
      subscriptionPlan: 'ENTERPRISE',
      maxVehicles: 150,
      status: 'ACTIVE',
    },
  });

  const apexCompany = await prisma.company.upsert({
    where: { slug: 'apex-transport' },
    update: {},
    create: {
      name: 'Apex Corporate Transport Ltd',
      slug: 'apex-transport',
      code: 'APEX',
      address: 'Plot 18, Hinjewadi Phase 1, Pune 411057',
      phone: '+91 98220 11223',
      email: 'admin@apextransport.com',
      subscriptionPlan: 'PROFESSIONAL',
      maxVehicles: 50,
      status: 'ACTIVE',
    },
  });

  const companyId = shreejCompany.id;

  // 3. Pre-configured Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const users = [
    { email: 'admin@fleetpulse.com', name: 'Master Super Admin', role: 'SUPER_ADMIN', companyId: shreejCompany.id },
    { email: 'admin@shreej.com', name: 'Shashi Shekhar (Director)', role: 'COMPANY_ADMIN', companyId: shreejCompany.id },
    { email: 'ops@shreej.com', name: 'Rahul Patil (Ops Lead)', role: 'OPERATIONS_EXECUTIVE', companyId: shreejCompany.id },
    { email: 'fleet@shreej.com', name: 'Chhaya K (Fleet Lead)', role: 'FLEET_MANAGER', companyId: shreejCompany.id },
    { email: 'accounts@shreej.com', name: 'Shivani Joshi (Accounts)', role: 'ACCOUNTS_EXECUTIVE', companyId: shreejCompany.id },
    { email: 'hr@shreej.com', name: 'Anshika Kumari (HR & MIS)', role: 'HR_EXECUTIVE', companyId: shreejCompany.id },
    { email: 'client@orix.com', name: 'Pravin Adte (Orix MIS)', role: 'CLIENT_VIEWER', companyId: shreejCompany.id },
    { email: 'admin@apex.com', name: 'Apex Admin (Isolated)', role: 'COMPANY_ADMIN', companyId: apexCompany.id },
  ];

  const userMap = new Map<string, string>();
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        companyId: u.companyId,
        email: u.email,
        name: u.name,
        passwordHash,
        roleId: rolesMap.get(u.role)!,
        status: 'ACTIVE',
      },
    });
    userMap.set(u.email, user.id);
  }

  // 4. Load JSON seed data (Prioritizes demoSeedData.json to protect real confidential client data)
  const candidateFiles = process.env.USE_REAL_DATA === 'true'
    ? ['seedData.json', 'demoSeedData.json']
    : ['demoSeedData.json', 'seedData.json'];

  let resolvedPath = '';
  for (const fileName of candidateFiles) {
    const candidates = [
      path.join(__dirname, fileName),
      path.join(process.cwd(), 'prisma', fileName),
      path.join(process.cwd(), 'backend', 'prisma', fileName),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        resolvedPath = p;
        break;
      }
    }
    if (resolvedPath) break;
  }

  if (!resolvedPath) {
    console.error('No seed JSON dataset found in prisma directory!');
    return;
  }
  console.log(`📦 Loading seed dataset from: ${path.basename(resolvedPath)}`);
  const rawData = fs.readFileSync(resolvedPath, 'utf-8');
  const seedData = JSON.parse(rawData);

  // Clean up operational data for Shreej company to ensure clean, idempotent seed
  console.log('Cleaning up previous seed operational data...');
  await prisma.payroll.deleteMany({ where: { companyId } });
  await prisma.attendance.deleteMany({ where: { companyId } });
  await prisma.employee.deleteMany({ where: { companyId } });
  await prisma.dailyVehicleTracking.deleteMany({ where: { companyId } });
  await prisma.tripStop.deleteMany();
  await prisma.trip.deleteMany({ where: { companyId } });
  await prisma.expense.deleteMany({ where: { companyId } });
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany({ where: { companyId } });
  await prisma.clientRateCard.deleteMany({ where: { companyId } });
  await prisma.client.deleteMany({ where: { companyId } });
  await prisma.vehicleDocument.deleteMany({ where: { companyId } });
  await prisma.vehicle.deleteMany({ where: { companyId } });
  await prisma.driver.deleteMany({ where: { companyId } });
  await prisma.task.deleteMany({ where: { companyId } });

  // 5. Seed Vehicles, Drivers and Documents
  console.log(`Seeding ${seedData.active_vehicles.length} active vehicles & drivers...`);
  const vehicleMap = new Map<string, string>();
  const driverMap = new Map<string, string>();

  for (const v of seedData.active_vehicles) {
    // Upsert Driver
    let driverId: string | undefined = undefined;
    if (v.driver && v.driver.name) {
      const drv = await prisma.driver.create({
        data: {
          companyId,
          name: v.driver.name,
          phone: v.driver.phone || null,
          emergencyPhone: v.driver.emergencyPhone || null,
          tempAddress: v.driver.tempAddress || null,
          permanentAddress: v.driver.permanentAddress || null,
          licenseNumber: v.driver.licenseNumber || null,
          licenseDate: v.driver.licenseDate ? new Date(v.driver.licenseDate) : null,
          licenseExpiry: v.driver.licenseExpiry ? new Date(v.driver.licenseExpiry) : null,
          pccDate: v.driver.pccDate ? new Date(v.driver.pccDate) : null,
          pccReceipt: v.driver.pccReceipt || 'YES',
          medicalDate: v.driver.medicalDate ? new Date(v.driver.medicalDate) : null,
          schoolDone: v.driver.schoolDone || 'YES',
          aadharNumber: v.driver.aadharNumber || null,
          ownerName: v.driver.ownerName || null,
          ownerPhone: v.driver.ownerPhone || null,
          status: 'ACTIVE',
        },
      });
      driverId = drv.id;
      driverMap.set(v.registrationNumber, drv.id);
    }

    // Upsert Vehicle
    const veh = await prisma.vehicle.upsert({
      where: { companyId_registrationNumber: { companyId, registrationNumber: v.registrationNumber } },
      update: {},
      create: {
        companyId,
        registrationNumber: v.registrationNumber,
        vehicleType: v.vehicleType,
        make: v.make,
        model: v.model,
        capacity: v.capacity,
        fuelType: v.fuelType,
        gpsInstalled: v.gpsInstalled,
        ownerName: v.ownerName,
        ownerPhone: v.ownerPhone,
        remark: v.remark || null,
        assignedDriverId: driverId,
        status: 'ACTIVE',
      },
    });
    vehicleMap.set(v.registrationNumber, veh.id);

    // Seed Documents with computed compliance status
    if (v.documents && v.documents.length) {
      const now = new Date();
      for (const doc of v.documents) {
        if (!doc.expiry) continue;
        const expDate = new Date(doc.expiry);
        const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let docStatus = 'VALID';
        if (diffDays < 0) {
          docStatus = 'EXPIRED';
        } else if (diffDays <= 30) {
          docStatus = 'EXPIRING_SOON';
        }

        await prisma.vehicleDocument.upsert({
          where: { vehicleId_documentType: { vehicleId: veh.id, documentType: doc.type } },
          update: {},
          create: {
            companyId,
            vehicleId: veh.id,
            documentType: doc.type,
            expiryDate: expDate,
            status: docStatus,
            alertDays: 30,
          },
        });
      }
    }
  }

  // Stopped Cabs
  for (const sv of seedData.stop_vehicles) {
    await prisma.vehicle.upsert({
      where: { companyId_registrationNumber: { companyId, registrationNumber: sv.registrationNumber } },
      update: {},
      create: {
        companyId,
        registrationNumber: sv.registrationNumber,
        vehicleType: sv.vehicleType,
        make: sv.make,
        model: sv.model,
        capacity: sv.capacity,
        fuelType: sv.fuelType,
        gpsInstalled: sv.gpsInstalled,
        status: 'STOPPED',
        stopReason: sv.stopReason,
      },
    });
  }

  // 6. Seed Employees, Attendance, and Payroll
  console.log(`Seeding ${seedData.employees.length} employees with November attendance & payroll...`);
  let empIdx = 101;
  for (const emp of seedData.employees) {
    const employee = await prisma.employee.create({
      data: {
        companyId,
        employeeCode: `EMP-${empIdx++}`,
        name: emp.name,
        department: emp.department,
        roleTitle: emp.roleTitle,
        shiftTiming: emp.shiftTiming,
        emergencyContact: emp.emergencyContact,
        location: emp.location,
        baseSalary: emp.baseSalary,
        status: 'ACTIVE',
      },
    });

    // Seed 30 days attendance
    if (emp.attendance) {
      for (const att of emp.attendance) {
        await prisma.attendance.create({
          data: {
            companyId,
            employeeId: employee.id,
            attendanceDate: new Date(att.date),
            status: att.status,
            isLateMark: att.isLate,
            checkInTime: att.checkIn || null,
            checkOutTime: att.checkOut || null,
          },
        });
      }
    }

    // Seed Payroll record
    if (emp.payroll) {
      await prisma.payroll.create({
        data: {
          companyId,
          employeeId: employee.id,
          month: emp.payroll.month,
          year: emp.payroll.year,
          presentDays: emp.payroll.presentDays,
          absentDays: emp.payroll.absentDays,
          weekOffDays: emp.payroll.weekOffDays,
          lateMarks: emp.payroll.lateMarks,
          lateDeductionDays: emp.payroll.lateDeductionDays,
          payableDays: emp.payroll.payableDays,
          attendancePercentage: emp.payroll.attendancePercentage,
          baseSalary: emp.payroll.baseSalary,
          absentDeduction: emp.payroll.absentDeduction,
          lateDeduction: emp.payroll.lateDeduction,
          netSalary: emp.payroll.netSalary,
          status: 'APPROVED',
          approvedBy: 'Shashi Shekhar',
          approvedAt: new Date('2026-11-15'),
        },
      });
    }
  }

  // 7. Seed Daily Vehicle Tracking
  console.log(`Seeding ${seedData.daily_vehicle_tracking.length} daily vehicle tracking records...`);
  for (const dvt of seedData.daily_vehicle_tracking) {
    const vehId = vehicleMap.get(dvt.registrationNumber);
    if (!vehId) continue;
    await prisma.dailyVehicleTracking.create({
      data: {
        companyId,
        trackingDate: new Date('2026-11-16'),
        vehicleId: vehId,
        tripCount: dvt.tripCount,
        attendanceStatus: dvt.attendanceStatus,
        cngExpenseToday: dvt.cngToday,
        cngExpenseMtd: dvt.cngMtd,
        cngRecoveryRate: 5.0,
        cngRecoveryAmount: dvt.cngRecovery,
        totalRecoverableCng: dvt.totalRecoverable,
      },
    });
  }

  // 8. Seed Expenses
  console.log(`Seeding ${seedData.expenses.length} real expenses...`);
  for (const exp of seedData.expenses) {
    let vehId: string | undefined = undefined;
    if (exp.vehicleRef) {
      for (const [reg, id] of vehicleMap.entries()) {
        if (reg.includes(exp.vehicleRef)) {
          vehId = id;
          break;
        }
      }
    }

    await prisma.expense.create({
      data: {
        companyId,
        expenseDate: new Date(exp.expenseDate),
        amount: exp.amount,
        paymentMode: exp.paymentMode,
        paidBy: exp.paidBy,
        category: exp.category,
        beneficiary: exp.beneficiary,
        vehicleId: vehId,
        approvalStatus: exp.approvalStatus,
        recoveryStatus: exp.recoveryStatus,
      },
    });
  }

  // 9. Seed Clients & Rate Cards
  console.log(`Seeding ${seedData.clients.length} clients and rate cards...`);
  const clientMap = new Map<string, string>();
  for (const c of seedData.clients) {
    const client = await prisma.client.upsert({
      where: { companyId_code: { companyId, code: c.code } },
      update: {},
      create: {
        companyId,
        name: c.name,
        code: c.code,
        officeContact: c.officeContact,
        misContact: c.misContact,
        billingContact: c.billingContact,
        status: 'ACTIVE',
      },
    });
    clientMap.set(c.name, client.id);
  }

  // Seed rate cards for default client (ORIX / WIPRO)
  const defaultClientId = clientMap.get('WIPRO') || clientMap.values().next().value;
  if (defaultClientId) {
    for (const rc of seedData.rate_cards) {
      await prisma.clientRateCard.create({
        data: {
          companyId,
          clientId: defaultClientId,
          vehicleType: rc.vehicleType,
          isAc: rc.isAc,
          minDistanceKm: rc.minDist,
          maxDistanceKm: rc.maxDist,
          rateType: 'SLAB',
          baseRate: rc.rate,
        },
      });
    }
  }

  // 10. Seed Invoices
  console.log(`Seeding ${seedData.invoices.length} invoices...`);
  for (const inv of seedData.invoices) {
    const cId = clientMap.get(inv.clientName) || defaultClientId || '';
    await prisma.invoice.create({
      data: {
        companyId,
        clientId: cId,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: new Date('2026-11-01'),
        dueDate: new Date('2026-11-30'),
        subtotal: inv.amount,
        taxAmount: inv.amount * 0.05,
        totalAmount: inv.amount * 1.05,
        paidAmount: inv.status === 'PAID' ? inv.amount * 1.05 : 0,
        balanceAmount: inv.status === 'PAID' ? 0 : inv.amount * 1.05,
        status: inv.status,
        notes: `Billing for ${inv.period}`,
      },
    });
  }

  // 11. Seed Trips & Stops
  console.log(`Seeding ${seedData.trips.length} daily trips with stops...`);
  for (const trp of seedData.trips) {
    let vehId: string | undefined = undefined;
    for (const [reg, id] of vehicleMap.entries()) {
      const cleanNum = trp.vehicleNumber.split(' ')[0];
      if (reg.includes(cleanNum)) {
        vehId = id;
        break;
      }
    }
    if (!vehId && vehicleMap.size > 0) {
      vehId = vehicleMap.values().next().value;
    }
    if (!vehId) continue;

    const cId = clientMap.get(trp.clientName) || defaultClientId;

    const createdTrip = await prisma.trip.create({
      data: {
        companyId,
        tripDate: new Date('2026-11-16'),
        clientId: cId,
        vehicleId: vehId,
        shift: trp.shift,
        tripDirection: trp.shift === 'LOGIN' ? 'IN' : 'OUT',
        status: 'COMPLETED',
      },
    });

    if (trp.stops && trp.stops.length) {
      let stopIdx = 1;
      for (const stopStr of trp.stops) {
        const parts = stopStr.split(' ');
        const schedTime = parts[0] || '14:00';
        const stopName = parts.slice(1).join(' ') || stopStr;
        await prisma.tripStop.create({
          data: {
            tripId: createdTrip.id,
            stopOrder: stopIdx++,
            stopName,
            scheduledTime: schedTime,
            stopType: trp.shift === 'LOGIN' ? 'PICKUP' : 'DROP',
          },
        });
      }
    }
  }

  // 12. Seed Tasks
  console.log(`Seeding ${seedData.tasks.length} departmental tasks...`);
  const adminUserId = userMap.get('admin@shreej.com');
  for (const tsk of seedData.tasks) {
    await prisma.task.create({
      data: {
        companyId,
        taskDate: new Date('2026-11-16'),
        department: tsk.department,
        assigneeName: tsk.assigneeName,
        assigneeId: adminUserId,
        description: tsk.description,
        priority: tsk.priority,
        status: tsk.status,
      },
    });
  }

  console.log('✅ FLEETPULSE 360 database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
