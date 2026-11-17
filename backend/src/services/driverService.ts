import { prisma } from '../lib/prisma';

export class DriverService {
  static async listDrivers(companyId: string, search?: string) {
    const where: any = { companyId };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { licenseNumber: { contains: search } },
      ];
    }
    return prisma.driver.findMany({
      where,
      include: {
        vehicles: {
          select: { id: true, registrationNumber: true, model: true, vehicleType: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getDriverById(companyId: string, id: string) {
    const driver = await prisma.driver.findFirst({
      where: { id, companyId },
      include: {
        vehicles: true,
        trips: {
          take: 10,
          orderBy: { tripDate: 'desc' },
          include: { stops: true, client: true },
        },
      },
    });
    if (!driver) {
      throw new Error('Driver not found.');
    }
    return driver;
  }

  static async createDriver(companyId: string, data: any) {
    return prisma.driver.create({
      data: {
        companyId,
        name: data.name.trim(),
        phone: data.phone || null,
        emergencyPhone: data.emergencyPhone || null,
        tempAddress: data.tempAddress || null,
        permanentAddress: data.permanentAddress || null,
        licenseNumber: data.licenseNumber || null,
        licenseDate: data.licenseDate ? new Date(data.licenseDate) : null,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
        pccDate: data.pccDate ? new Date(data.pccDate) : null,
        pccReceipt: data.pccReceipt || 'YES',
        medicalDate: data.medicalDate ? new Date(data.medicalDate) : null,
        schoolDone: data.schoolDone || 'YES',
        aadharNumber: data.aadharNumber || null,
        ownerName: data.ownerName || null,
        ownerPhone: data.ownerPhone || null,
        status: data.status || 'ACTIVE',
      },
    });
  }

  static async updateDriver(companyId: string, id: string, data: any) {
    return prisma.driver.updateMany({
      where: { id, companyId },
      data: {
        name: data.name?.trim(),
        phone: data.phone,
        emergencyPhone: data.emergencyPhone,
        tempAddress: data.tempAddress,
        permanentAddress: data.permanentAddress,
        licenseNumber: data.licenseNumber,
        licenseDate: data.licenseDate ? new Date(data.licenseDate) : undefined,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : undefined,
        pccDate: data.pccDate ? new Date(data.pccDate) : undefined,
        pccReceipt: data.pccReceipt,
        medicalDate: data.medicalDate ? new Date(data.medicalDate) : undefined,
        schoolDone: data.schoolDone,
        aadharNumber: data.aadharNumber,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        status: data.status,
      },
    });
  }

  static async deleteDriver(companyId: string, id: string) {
    return prisma.driver.deleteMany({
      where: { id, companyId },
    });
  }
}
