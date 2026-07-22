const {
  ROLE_HIERARCHY,
  VALID_ROLES,
  getRoleLevel,
  meetsMinimumRole,
  requireRole,
  requireRoleOrSelf,
  requirePlan
} = require('../middleware/roleGuard');

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

const { supabase } = require('../supabase');

describe('roleGuard middleware & helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Helper Functions', () => {
    test('getRoleLevel returns correct hierarchy index', () => {
      expect(getRoleLevel('user')).toBe(0);
      expect(getRoleLevel('enterprise_user')).toBe(1);
      expect(getRoleLevel('admin')).toBe(2);
      expect(getRoleLevel('super_admin')).toBe(3);
      expect(getRoleLevel('invalid_role')).toBe(-1);
    });

    test('meetsMinimumRole verifies hierarchy correctly', () => {
      expect(meetsMinimumRole('super_admin', 'user')).toBe(true);
      expect(meetsMinimumRole('admin', 'admin')).toBe(true);
      expect(meetsMinimumRole('user', 'enterprise_user')).toBe(false);
      expect(meetsMinimumRole('enterprise_user', 'admin')).toBe(false);
    });
  });

  describe('requireRole Middleware', () => {
    test('returns 401 when req.user or req.user.uid is missing', async () => {
      const middleware = requireRole('admin', 'super_admin');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('allows access and calls next() if req.userPlan.role is already attached and allowed', async () => {
      const middleware = requireRole('admin', 'super_admin');
      const req = { user: { uid: 'user-123' }, userPlan: { role: 'super_admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('fetches role from DB when not on req.userPlan, denies 403 if role not allowed', async () => {
      const selectMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();
      const singleMock = jest.fn().mockResolvedValue({ data: { role: 'user' }, error: null });

      supabase.from.mockReturnValue({
        select: selectMock,
        eq: eqMock,
        single: singleMock
      });

      const middleware = requireRole('admin', 'super_admin');
      const req = { user: { uid: 'user-123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(eqMock).toHaveBeenCalledWith('id', 'user-123');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Insufficient permissions',
        code: 'ROLE_ACCESS_DENIED'
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requirePlan Middleware', () => {
    test('denies access with 403 and upgrade advice when plan is insufficient', async () => {
      const middleware = requirePlan('pro', 'enterprise');
      const req = { user: { uid: 'user-123' }, userPlan: { plan: 'trial', role: 'user' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Plan upgrade required',
        code: 'PLAN_UPGRADE_REQUIRED'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    test('allows access when user has an allowed plan', async () => {
      const middleware = requirePlan('pro', 'enterprise');
      const req = { user: { uid: 'user-123' }, userPlan: { plan: 'enterprise', role: 'user' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('admins and super_admins bypass plan restrictions automatically', async () => {
      const middleware = requirePlan('enterprise');
      const req = { user: { uid: 'admin-1' }, userPlan: { plan: 'trial', role: 'super_admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
