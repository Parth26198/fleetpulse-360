import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { ENV } from '../config/env';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Account has been deactivated. Please contact your administrator.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const permissions = user.role.rolePermissions.map(
      (rp) => `${rp.permission.module}:${rp.permission.action}`
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        phone: user.phone,
        status: user.status,
        company: {
          id: user.company.id,
          name: user.company.name,
          slug: user.company.slug,
          code: user.company.code,
        },
        permissions,
      },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const permissions = user.role.rolePermissions.map(
      (rp) => `${rp.permission.module}:${rp.permission.action}`
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      phone: user.phone,
      status: user.status,
      company: {
        id: user.company.id,
        name: user.company.name,
        slug: user.company.slug,
        code: user.company.code,
      },
      permissions,
    };
  }

  static async listCompanies() {
    return prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async listUsers(companyId: string) {
    return prisma.user.findMany({
      where: { companyId },
      include: {
        role: true,
        company: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async listRoles() {
    return prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
