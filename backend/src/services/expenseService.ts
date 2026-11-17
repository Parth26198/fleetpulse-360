import { prisma } from '../lib/prisma';

export class ExpenseService {
  static async listExpenses(companyId: string, query?: { category?: string; date?: string; recoveryStatus?: string; search?: string }) {
    const where: any = { companyId };
    if (query?.category) where.category = query.category;
    if (query?.recoveryStatus) where.recoveryStatus = query.recoveryStatus;
    if (query?.search) {
      where.OR = [
        { beneficiary: { contains: query.search } },
        { description: { contains: query.search } },
        { paidBy: { contains: query.search } },
      ];
    }
    if (query?.date) {
      const d = new Date(query.date);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);
      where.expenseDate = { gte: d, lt: nextD };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { expenseDate: 'desc' },
    });

    const totalOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);
    const cngTotal = expenses
      .filter((e) => e.category.toUpperCase().includes('CNG') || e.category.toUpperCase().includes('FUEL'))
      .reduce((sum, e) => sum + e.amount, 0);
    const unrecoveredTotal = expenses
      .filter((e) => e.recoveryStatus === 'UNRECOVER')
      .reduce((sum, e) => sum + e.amount, 0);
    const unsettledTotal = expenses
      .filter((e) => e.approvalStatus === 'PENDING')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      summary: {
        totalOutflow: Math.round(totalOutflow),
        cngTotal: Math.round(cngTotal),
        unrecoveredTotal: Math.round(unrecoveredTotal),
        unsettledTotal: Math.round(unsettledTotal),
      },
      expenses,
    };
  }

  static async createExpense(companyId: string, data: any) {
    return prisma.expense.create({
      data: {
        companyId,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        category: data.category || 'OTHER',
        amount: Number(data.amount),
        paymentMode: data.paymentMode || 'ONLINE',
        paidBy: data.paidBy || null,
        beneficiary: data.beneficiary || null,
        description: data.description || null,
        vehicleId: data.vehicleId || null,
        driverId: data.driverId || null,
        billNumber: data.billNumber || null,
        receiptUrl: data.receiptUrl || null,
        approvalStatus: data.approvalStatus || 'DONE',
        recoveryStatus: data.recoveryStatus || 'UNRECOVER',
      },
    });
  }

  static async updateExpense(companyId: string, id: string, data: any) {
    return prisma.expense.updateMany({
      where: { id, companyId },
      data: {
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
        category: data.category,
        amount: data.amount !== undefined ? Number(data.amount) : undefined,
        paymentMode: data.paymentMode,
        paidBy: data.paidBy,
        beneficiary: data.beneficiary,
        description: data.description,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        approvalStatus: data.approvalStatus,
        recoveryStatus: data.recoveryStatus,
      },
    });
  }

  static async deleteExpense(companyId: string, id: string) {
    return prisma.expense.deleteMany({
      where: { id, companyId },
    });
  }
}
