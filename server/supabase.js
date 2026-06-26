const { createClient } = require('@supabase/supabase-js');
const logger = require('./utils/logger');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isMockMode = !supabaseUrl || 
                   supabaseUrl === 'your_supabase_url' || 
                   !supabaseServiceKey || 
                   supabaseServiceKey.startsWith('your_');

function snakeToCamel(str) {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelCaseKeys(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCaseKeys);
  // Do not traverse objects that might be special date/timestamp formats or other complex classes
  if (typeof obj !== 'object' || obj instanceof Date || (obj.toDate && typeof obj.toDate === 'function')) return obj;
  
  const result = {};
  for (const key of Object.keys(obj)) {
    result[snakeToCamel(key)] = toCamelCaseKeys(obj[key]);
  }
  return result;
}

function toSnakeCaseKeys(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCaseKeys);
  if (typeof obj !== 'object' || obj instanceof Date || (obj.toDate && typeof obj.toDate === 'function')) return obj;
  
  const result = {};
  for (const key of Object.keys(obj)) {
    result[camelToSnake(key)] = toSnakeCaseKeys(obj[key]);
  }
  return result;
}

let supabaseClient;

if (isMockMode) {
  logger.info('🔧 Supabase Backend Client: Running in LOCAL MOCK MODE');
  
  const MockDb = require('./utils/mockDb');
  const mockDb = new MockDb();

  supabaseClient = {
    auth: {
      admin: {
        getUser: async (uid) => {
          const userDoc = mockDb.collection('users').doc(uid);
          const snap = await userDoc.get();
          if (snap.exists) {
            const data = snap.data();
            const snakeData = toSnakeCaseKeys(data);
            return { data: { user: { id: uid, email: data.email, user_metadata: snakeData } }, error: null };
          }
          return { data: { user: null }, error: new Error('User not found') };
        },
        deleteUser: async (uid) => {
          await mockDb.collection('users').doc(uid).delete();
          return { error: null };
        },
        updateUserById: async (uid, properties) => {
          return { data: { user: { id: uid } }, error: null };
        }
      },
      getUser: async (token) => {
        if (token && (token.startsWith('mock-token-') || token === 'mock-token')) {
          const email = token === 'mock-token' ? 'admin@rageradar.com' : token.replace('mock-token-', '');
          const uid = 'mock-uid-' + email.replace(/[@.]/g, '-');
          return { 
            data: { 
              user: { 
                id: uid, 
                email, 
                role: email === 'admin@rageradar.com' ? 'admin' : 'user',
                user_metadata: { firstName: 'Demo', lastName: 'User' }
              } 
            }, 
            error: null 
          };
        }
        return { data: { user: null }, error: new Error('Invalid token') };
      }
    },
    from: (table) => {
      const coll = mockDb.collection(table);
      
      const query = {
        filters: [],
        ordering: null,
        limitCount: null,
        
        select: function(fields) {
          return this;
        },
        
        eq: function(col, val) {
          this.filters.push({ col: snakeToCamel(col), op: '==', val });
          return this;
        },
        
        neq: function(col, val) {
          this.filters.push({ col: snakeToCamel(col), op: '!=', val });
          return this;
        },
        
        gte: function(col, val) {
          this.filters.push({ col: snakeToCamel(col), op: '>=', val });
          return this;
        },
        
        lte: function(col, val) {
          this.filters.push({ col: snakeToCamel(col), op: '<=', val });
          return this;
        },
        
        in: function(col, valArray) {
          this.filters.push({ col: snakeToCamel(col), op: 'in', val: valArray });
          return this;
        },
        
        order: function(col, { ascending = true } = {}) {
          this.ordering = { col: snakeToCamel(col), ascending };
          return this;
        },
        
        limit: function(count) {
          this.limitCount = count;
          return this;
        },
        
        single: async function() {
          const res = await this.then();
          return { data: res.data ? (Array.isArray(res.data) ? res.data[0] : res.data) : null, error: res.error };
        },
        
        insert: function(data) {
          const items = Array.isArray(data) ? data.map(toCamelCaseKeys) : [toCamelCaseKeys(data)];
          return {
            select: () => {
              return {
                single: async () => {
                  const created = [];
                  for (const item of items) {
                    const docRef = await coll.add(item);
                    const snap = await docRef.get();
                    created.push(toSnakeCaseKeys({ id: docRef.id, ...snap.data() }));
                  }
                  return { data: Array.isArray(data) ? created : created[0], error: null };
                }
              };
            },
            then: async (resolve) => {
              for (const item of items) {
                await coll.add(item);
              }
              if (resolve) resolve({ error: null });
              return { error: null };
            }
          };
        },
        
        update: function(updates) {
          const camelUpdates = toCamelCaseKeys(updates);
          return {
            eq: (col, val) => {
              return {
                then: async (resolve) => {
                  let mockColl = coll.where(snakeToCamel(col), '==', val);
                  const snapshot = await mockColl.get();
                  snapshot.forEach(async (docSnap) => {
                    await docSnap.ref.update(camelUpdates);
                  });
                  if (resolve) resolve({ error: null });
                  return { error: null };
                }
              };
            }
          };
        },
        
        delete: function() {
          return {
            eq: (col, val) => {
              return {
                then: async (resolve) => {
                  let mockColl = coll.where(snakeToCamel(col), '==', val);
                  const snapshot = await mockColl.get();
                  snapshot.forEach(async (docSnap) => {
                    await docSnap.ref.delete();
                  });
                  if (resolve) resolve({ error: null });
                  return { error: null };
                }
              };
            }
          };
        },
        
        then: async function(resolve) {
          let mockColl = coll;
          for (const f of this.filters) {
            mockColl = mockColl.where(f.col, f.op, f.val);
          }
          if (this.limitCount !== null) {
            mockColl = mockColl.limit(this.limitCount);
          }
          const snapshot = await mockColl.get();
          const list = [];
          snapshot.forEach(docSnap => {
            const docData = docSnap.data();
            // Unwrap date objects if they are present in mock db snapshot helper
            const plainDocData = {};
            for (const key of Object.keys(docData)) {
              const val = docData[key];
              if (val && typeof val === 'object' && typeof val.toDate === 'function') {
                plainDocData[key] = val.toDate().toISOString();
              } else {
                plainDocData[key] = val;
              }
            }
            list.push(toSnakeCaseKeys({ id: docSnap.id, ...plainDocData }));
          });
          
          if (resolve) resolve({ data: list, error: null });
          return { data: list, error: null };
        }
      };
      
      return query;
    }
  };
} else {
  // Real Supabase Client with service role key for bypassing RLS on server side
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

module.exports = {
  supabase: supabaseClient,
  isMockMode
};
