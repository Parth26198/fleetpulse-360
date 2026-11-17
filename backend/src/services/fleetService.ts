import { prisma } from '../lib/prisma';

export class FleetService {
  static async listVehicles(companyId: string, query?: { status?: string; search?: string }) {
    const where: any = { companyId };
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.search) {
      where.OR = [
        { registrationNumber: { contains: query.search } },
        { make: { contains: query.search } },
        { model: { contains: query.search } },
        { ownerName: { contains: query.search } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        assignedDriver: true,
        vehicleDocuments: true,
      },
      orderBy: { registrationNumber: 'asc' },
    });

    const now = new Date();

    return vehicles.map((v) => {
      // Compute overall compliance status
      let nextExpiryDate: Date | null = null;
      let earliestDays = 999999;
      let overallStatus = 'DONE';

      for (const doc of v.vehicleDocuments) {
        if (doc.expiryDate) {
          const exp = new Date(doc.expiryDate);
          const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (!nextExpiryDate || exp < nextExpiryDate) {
            nextExpiryDate = exp;
          }
          if (diffDays < earliestDays) {
            earliestDays = diffDays;
          }
        }
      }

      if (earliestDays < 0) {
        overallStatus = 'EXPIRED';
      } else if (earliestDays <= 30) {
        overallStatus = 'EXPIRING SOON';
      } else {
        overallStatus = 'DONE';
      }

      return {
        ...v,
        complianceStatus: v.vehicleDocuments.length > 0 ? overallStatus : 'NO_DOCS',
        nextExpiryDate,
        daysRemaining: earliestDays !== 999999 ? earliestDays : null,
      };
    });
  }

  static async getVehicleById(companyId: string, id: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, companyId },
      include: {
        assignedDriver: true,
        vehicleDocuments: true,
        dailyTrackings: {
          orderBy: { trackingDate: 'desc' },
          take: 7,
        },
        trips: {
          orderBy: { tripDate: 'desc' },
          take: 10,
          include: { stops: true, client: true },
        },
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found.');
    }

    return vehicle;
  }

  static async createVehicle(companyId: string, data: any) {
    return prisma.vehicle.create({
      data: {
        companyId,
        registrationNumber: data.registrationNumber.trim().toUpperCase(),
        vehicleType: data.vehicleType || 'Sedan',
        make: data.make || 'Maruti Suzuki',
        model: data.model || 'Swift Dzire',
        capacity: data.capacity || '4+1',
        fuelType: data.fuelType || 'CNG',
        gpsInstalled: Boolean(data.gpsInstalled),
        gpsImei: data.gpsImei || null,
        ownerName: data.ownerName || null,
        ownerPhone: data.ownerPhone || null,
        assignedDriverId: data.assignedDriverId || null,
        status: data.status || 'ACTIVE',
        remark: data.remark || null,
      },
    });
  }

  static async updateVehicle(companyId: string, id: string, data: any) {
    return prisma.vehicle.updateMany({
      where: { id, companyId },
      data: {
        registrationNumber: data.registrationNumber?.trim().toUpperCase(),
        vehicleType: data.vehicleType,
        make: data.make,
        model: data.model,
        capacity: data.capacity,
        fuelType: data.fuelType,
        gpsInstalled: data.gpsInstalled !== undefined ? Boolean(data.gpsInstalled) : undefined,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        assignedDriverId: data.assignedDriverId,
        status: data.status,
        stopReason: data.stopReason,
        remark: data.remark,
      },
    });
  }

  static async deleteVehicle(companyId: string, id: string) {
    return prisma.vehicle.deleteMany({
      where: { id, companyId },
    });
  }

  static async updateDocument(companyId: string, vehicleId: string, docType: string, data: { expiryDate: string; documentNumber?: string; fileUrl?: string }) {
    const expDate = new Date(data.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let status = 'VALID';
    if (diffDays < 0) {
      status = 'EXPIRED';
    } else if (diffDays <= 30) {
      status = 'EXPIRING_SOON';
    }

    return prisma.vehicleDocument.upsert({
      where: { vehicleId_documentType: { vehicleId, documentType: docType } },
      update: {
        expiryDate: expDate,
        documentNumber: data.documentNumber,
        fileUrl: data.fileUrl,
        status,
      },
      create: {
        companyId,
        vehicleId,
        documentType: docType,
        expiryDate: expDate,
        documentNumber: data.documentNumber,
        fileUrl: data.fileUrl,
        status,
        alertDays: 30,
      },
    });
  }
}
