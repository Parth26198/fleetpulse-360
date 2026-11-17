import { prisma } from '../lib/prisma';

export class ClientService {
  static async listClients(companyId: string) {
    return prisma.client.findMany({
      where: { companyId },
      include: {
        rateCards: true,
        _count: {
          select: { trips: true, invoices: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getClientById(companyId: string, id: string) {
    const client = await prisma.client.findFirst({
      where: { id, companyId },
      include: {
        rateCards: {
          orderBy: [{ vehicleType: 'asc' }, { minDistanceKm: 'asc' }],
        },
        invoices: {
          orderBy: { invoiceDate: 'desc' },
        },
        trips: {
          take: 15,
          orderBy: { tripDate: 'desc' },
          include: { vehicle: true, driver: true, stops: true },
        },
      },
    });
    if (!client) throw new Error('Client not found.');
    return client;
  }

  static async createClient(companyId: string, data: any) {
    return prisma.client.create({
      data: {
        companyId,
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        officeContact: data.officeContact || null,
        misContact: data.misContact || null,
        inductionContact: data.inductionContact || null,
        billingContact: data.billingContact || null,
        address: data.address || null,
        gstNumber: data.gstNumber || null,
        status: data.status || 'ACTIVE',
      },
    });
  }

  static async updateClient(companyId: string, id: string, data: any) {
    return prisma.client.updateMany({
      where: { id, companyId },
      data: {
        name: data.name?.trim(),
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        officeContact: data.officeContact,
        misContact: data.misContact,
        inductionContact: data.inductionContact,
        billingContact: data.billingContact,
        address: data.address,
        gstNumber: data.gstNumber,
        status: data.status,
      },
    });
  }

  static async addRateCard(companyId: string, clientId: string, data: any) {
    return prisma.clientRateCard.create({
      data: {
        companyId,
        clientId,
        vehicleType: data.vehicleType,
        isAc: Boolean(data.isAc),
        minDistanceKm: Number(data.minDistanceKm || 0),
        maxDistanceKm: Number(data.maxDistanceKm || 10),
        rateType: data.rateType || 'SLAB',
        baseRate: Number(data.baseRate),
        extraKmRate: data.extraKmRate ? Number(data.extraKmRate) : null,
        shiftTiming: data.shiftTiming || null,
      },
    });
  }

  static async deleteRateCard(companyId: string, id: string) {
    return prisma.clientRateCard.deleteMany({
      where: { id, companyId },
    });
  }
}
