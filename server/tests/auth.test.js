const { authenticateUser } = require('../middleware/auth');

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}));

const { supabase } = require('../supabase');

describe('authenticateUser Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 401 with NO_TOKEN when authorization header is missing', async () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authenticateUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided', code: 'NO_TOKEN' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 with INVALID_TOKEN when supabase.auth.getUser fails', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Bad token') });
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authenticateUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when session_expires_at is in the past', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    });

    const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
    const selectMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockReturnThis();
    const singleMock = jest.fn().mockResolvedValue({
      data: { role: 'user', plan: 'pro', session_expires_at: pastDate },
      error: null
    });

    supabase.from.mockReturnValue({
      select: selectMock,
      eq: eqMock,
      single: singleMock
    });

    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authenticateUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Session expired. Please sign in again.', code: 'SESSION_EXPIRED' });
    expect(next).not.toHaveBeenCalled();
  });

  test('successfully attaches authoritative DB role and plan to req.user and req.userPlan', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'admin@example.com' } },
      error: null
    });

    const selectMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockReturnThis();
    const singleMock = jest.fn().mockResolvedValue({
      data: { role: 'super_admin', plan: 'enterprise', max_brands: 'unlimited', brands_used: 5 },
      error: null
    });

    const updateMock = jest.fn().mockReturnThis();
    const updateEqMock = jest.fn().mockResolvedValue({ data: null, error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: selectMock,
          eq: eqMock,
          single: singleMock,
          update: updateMock,
        };
      }
    });

    // Mock chaining update().eq()
    updateMock.mockReturnValue({ eq: updateEqMock });

    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authenticateUser(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.role).toBe('super_admin');
    expect(req.userPlan.plan).toBe('enterprise');
  });
});
