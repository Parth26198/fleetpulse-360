import { prisma } from '../lib/prisma';

export class TaskService {
  static async listTasks(companyId: string, query?: { department?: string; priority?: string; status?: string }) {
    const where: any = { companyId };
    if (query?.department) where.department = query.department;
    if (query?.priority) where.priority = query.priority;
    if (query?.status) where.status = query.status;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const totalTasks = tasks.length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const processing = tasks.filter((t) => t.status === 'PROCESSING').length;
    const notStarted = tasks.filter((t) => t.status === 'NOT_STARTED').length;
    const onHold = tasks.filter((t) => t.status === 'ON_HOLD').length;
    const completionRate = totalTasks > 0 ? Number(((completed / totalTasks) * 100).toFixed(1)) : 0;

    return {
      summary: {
        totalTasks,
        completed,
        processing,
        notStarted,
        onHold,
        completionRate,
      },
      tasks,
    };
  }

  static async createTask(companyId: string, data: any) {
    return prisma.task.create({
      data: {
        companyId,
        department: data.department || 'Operations',
        assigneeName: data.assigneeName || null,
        assigneeId: data.assigneeId || null,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'NOT_STARTED',
        bossRemarks: data.bossRemarks || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }

  static async updateTask(companyId: string, id: string, data: any) {
    return prisma.task.updateMany({
      where: { id, companyId },
      data: {
        department: data.department,
        assigneeName: data.assigneeName,
        assigneeId: data.assigneeId,
        description: data.description,
        priority: data.priority,
        status: data.status,
        bossRemarks: data.bossRemarks,
        completedDate: data.status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  static async deleteTask(companyId: string, id: string) {
    return prisma.task.deleteMany({
      where: { id, companyId },
    });
  }
}
