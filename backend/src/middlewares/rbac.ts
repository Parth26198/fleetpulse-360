import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    if (req.user.role === 'SUPER_ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
    });
  };
};

export const requirePermission = (module: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'COMPANY_ADMIN') {
      return next();
    }

    const required = `${module}:${action}`;
    if (req.user.permissions.includes(required)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Missing permission: ${required}`,
    });
  };
};

// Strict tenant isolation middleware helper
export const getTenantCompanyId = (req: Request): string => {
  if (!req.user) {
    throw new Error('Unauthenticated tenant request.');
  }
  // Super admin can optionally specify companyId in query or header, otherwise defaults to their company
  if (req.user.role === 'SUPER_ADMIN' && req.query.companyId) {
    return req.query.companyId as string;
  }
  return req.user.companyId;
};
