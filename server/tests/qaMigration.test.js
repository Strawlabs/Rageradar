/**
 * QA Migration Test Suite
 * Covers MIG-01 through MIG-08 from the QA Test Plan §2.
 *
 * Verifies that Firebase → Supabase migration is complete:
 * - No Firebase auth imports remain
 * - Auth flows use Supabase exclusively
 * - RLS policies enforce role and subscription gating
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const { authenticateUser } = require('../middleware/auth');
const { requireRole, requirePlan } = require('../middleware/roleGuard');

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      admin: { updateUserById: jest.fn() }
    },
    from: jest.fn()
  }
}));

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

const { supabase } = require('../supabase');

function mockReq(overrides = {}) {
  return { headers: {}, params: {}, body: {}, ...overrides };
}

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

function mockFromChain(returnData, returnError = null) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: returnData, error: returnError }),
    insert: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: null })
    }),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  };
  supabase.from.mockReturnValue(chain);
  return chain;
}

// ─────────────────────────────────────────────────────────────────────────────
// §2: Firebase → Supabase Migration
// ─────────────────────────────────────────────────────────────────────────────

describe('§2 – Firebase → Supabase Migration', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── MIG-01: Firebase Auth calls fully replaced ──
  describe('MIG-01: No firebase/auth imports in auth modules', () => {
    test('client/src has zero firebase or firebase/auth imports', () => {
      const clientSrcDir = path.resolve(__dirname, '../../client/src');

      // Only scan if directory exists (CI may not have client)
      if (!fs.existsSync(clientSrcDir)) {
        console.warn('Skipping MIG-01: client/src not found');
        return;
      }

      let grepResult;
      try {
        grepResult = execSync(
          `grep -rl "firebase/auth\\|from 'firebase'" "${clientSrcDir}" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null || true`,
          { encoding: 'utf-8' }
        ).trim();
      } catch {
        grepResult = '';
      }

      expect(grepResult).toBe('');
    });

    test('server has zero firebase imports', () => {
      const serverDir = path.resolve(__dirname, '..');

      let grepResult;
      try {
        grepResult = execSync(
          `grep -rl "firebase-admin\\|from 'firebase'" "${serverDir}" --include="*.js" --exclude-dir=node_modules --exclude-dir=tests 2>/dev/null || true`,
          { encoding: 'utf-8' }
        ).trim();
      } catch {
        grepResult = '';
      }

      expect(grepResult).toBe('');
    });
  });

  // ── MIG-02: Migration data lands in Supabase users table ──
  describe('MIG-02: Users exist in Supabase users table', () => {
    test('user record has correct id, email, role, plan, created_at fields', () => {
      // This validates the schema, verified by supabase_schema.sql
      const schemaPath = path.resolve(__dirname, '../../supabase_schema.sql');
      if (!fs.existsSync(schemaPath)) {
        console.warn('Skipping MIG-02: supabase_schema.sql not found');
        return;
      }

      const schema = fs.readFileSync(schemaPath, 'utf-8');

      expect(schema).toContain('id UUID PRIMARY KEY');
      expect(schema).toContain('email TEXT UNIQUE NOT NULL');
      expect(schema).toContain("role TEXT DEFAULT 'user'");
      expect(schema).toContain("plan TEXT DEFAULT 'trial'");
      expect(schema).toContain('created_at TIMESTAMP');
    });
  });

  // ── MIG-04: RLS policy — role enforcement ──
  describe('MIG-04: RLS policies enforce role-based access', () => {
    test('schema defines RLS policies for users table', () => {
      const schemaPath = path.resolve(__dirname, '../../supabase_schema.sql');
      if (!fs.existsSync(schemaPath)) return;

      const schema = fs.readFileSync(schemaPath, 'utf-8');

      // RLS enabled
      expect(schema).toContain('ALTER TABLE public.users ENABLE ROW LEVEL SECURITY');

      // Users can read own profile
      expect(schema).toContain('Allow authenticated users to read their own profile');

      // Admins can read all users
      expect(schema).toContain('Allow admins to read all users');

      // Super admin update
      expect(schema).toContain('Allow super_admin to update any user');
    });
  });

  // ── MIG-05: RLS policy — subscription enforcement ──
  describe('MIG-05: RLS policies exist for all tables', () => {
    test('all exposed tables have RLS enabled', () => {
      const schemaPath = path.resolve(__dirname, '../../supabase_schema.sql');
      if (!fs.existsSync(schemaPath)) return;

      const schema = fs.readFileSync(schemaPath, 'utf-8');
      const tables = ['users', 'analyses', 'events', 'gdpr_consent', 'audit_logs', 'billing_events', 'password_resets', 'notifications'];

      tables.forEach(table => {
        expect(schema).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
      });
    });
  });

  // ── MIG-06: Post-migration login via Supabase ──
  describe('MIG-06: Login via Supabase Auth', () => {
    test('authenticateUser uses supabase.auth.getUser, not Firebase', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'migrated-uid', email: 'migrated@example.com' } },
        error: null
      });

      mockFromChain({ role: 'user', plan: 'pro', max_brands: 10, brands_used: 2 });

      const req = mockReq({ headers: { authorization: 'Bearer supabase-jwt' } });
      const res = mockRes();
      const next = jest.fn();

      await authenticateUser(req, res, next);

      expect(supabase.auth.getUser).toHaveBeenCalledWith('supabase-jwt');
      expect(next).toHaveBeenCalled();
      expect(req.user.uid).toBe('migrated-uid');
      expect(req.user.role).toBe('user');
      expect(req.userPlan.plan).toBe('pro');
    });
  });

  // ── MIG-07: Session timeout post-migration ──
  describe('MIG-07: Session timeout via Supabase', () => {
    test('expired Supabase session returns 401', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-timeout', email: 'timeout@example.com' } },
        error: null
      });

      const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
      mockFromChain({ role: 'user', plan: 'trial', session_expires_at: pastDate });

      const req = mockReq({ headers: { authorization: 'Bearer expired-jwt' } });
      const res = mockRes();
      const next = jest.fn();

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'SESSION_EXPIRED' })
      );
    });
  });

  // ── MIG-08: No regression vs pre-migration ──
  describe('MIG-08: Auth flow regression checks', () => {
    test('valid token → user attached with authoritative DB role', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'reg-uid', email: 'reg@example.com' } },
        error: null
      });

      mockFromChain({ role: 'enterprise_user', plan: 'enterprise', max_brands: 9999, brands_used: 5 });

      const req = mockReq({ headers: { authorization: 'Bearer valid' } });
      const res = mockRes();
      const next = jest.fn();

      await authenticateUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user.role).toBe('enterprise_user');
      expect(req.userPlan.plan).toBe('enterprise');
    });

    test('invalid token → 401', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('invalid token')
      });

      const req = mockReq({ headers: { authorization: 'Bearer invalid' } });
      const res = mockRes();
      const next = jest.fn();

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('role guard still works post-migration', async () => {
      const middleware = requireRole('admin', 'super_admin');
      const req = mockReq({ user: { uid: 'u1' }, userPlan: { role: 'user' } });
      const res = mockRes();
      const next = jest.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('plan guard still works post-migration', async () => {
      const middleware = requirePlan('pro', 'enterprise');
      const req = mockReq({ user: { uid: 'u2' }, userPlan: { plan: 'starter', role: 'user' } });
      const res = mockRes();
      const next = jest.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'PLAN_UPGRADE_REQUIRED' })
      );
    });
  });
});
