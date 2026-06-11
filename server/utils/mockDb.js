const fs = require('fs');
const path = require('path');

class MockDb {
  constructor() {
    this.filePath = path.join(__dirname, '..', 'logs', 'mock_db.json');
    this.loadData();
  }

  loadData() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = {};
        this.saveData();
      }
    } catch (error) {
      console.error('Failed to load mock database, resetting...', error);
      this.data = {};
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save mock database', error);
    }
  }

  collection(name) {
    if (!this.data[name]) {
      this.data[name] = {};
    }
    return new MockCollection(this, name);
  }

  batch() {
    return new MockBatch(this);
  }
}

class MockCollection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
    this.queryFilters = [];
    this.limitCount = null;
  }

  doc(id) {
    // If no id is passed, auto-generate one
    const docId = id || 'doc_' + Math.random().toString(36).substring(2, 11);
    return new MockDoc(this.db, this.name, docId);
  }

  async add(data) {
    const id = 'doc_' + Math.random().toString(36).substring(2, 11);
    const docData = replaceSentinels({ ...data, id, createdAt: new Date().toISOString() });
    this.db.data[this.name][id] = docData;
    this.db.saveData();
    return { id, get: async () => new MockDocSnapshot(id, docData, this.name, this.db) };
  }

  where(field, op, val) {
    const newColl = new MockCollection(this.db, this.name);
    newColl.queryFilters = [...this.queryFilters, { field, op, val }];
    newColl.limitCount = this.limitCount;
    return newColl;
  }

  orderBy(field, direction) {
    // Return self, sorting can be done during get
    return this;
  }

  limit(count) {
    const newColl = new MockCollection(this.db, this.name);
    newColl.queryFilters = [...this.queryFilters];
    newColl.limitCount = count;
    return newColl;
  }

  async get() {
    let items = Object.values(this.db.data[this.name] || {});
    
    // Apply filters
    for (const filter of this.queryFilters) {
      items = items.filter(item => {
        const itemVal = item[filter.field];
        if (filter.op === '==') {
          return itemVal === filter.val;
        } else if (filter.op === '>=') {
          return itemVal >= filter.val;
        } else if (filter.op === '<=') {
          return itemVal <= filter.val;
        } else if (filter.op === 'in') {
          return Array.isArray(filter.val) && filter.val.includes(itemVal);
        }
        return true;
      });
    }

    // Sort by default (createdAt desc if present)
    items.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    if (this.limitCount !== null) {
      items = items.slice(0, this.limitCount);
    }

    const docs = items.map(item => new MockDocSnapshot(item.id || item.uid, item, this.name, this.db));
    return new MockQuerySnapshot(docs);
  }
}

class MockDoc {
  constructor(db, collectionName, id) {
    this.db = db;
    this.collectionName = collectionName;
    this.id = id;
  }

  async get() {
    const coll = this.db.data[this.collectionName] || {};
    const docData = coll[this.id];
    return new MockDocSnapshot(this.id, docData, this.collectionName, this.db);
  }

  async set(data, options = {}) {
    if (!this.db.data[this.collectionName]) {
      this.db.data[this.collectionName] = {};
    }
    
    const existing = this.db.data[this.collectionName][this.id] || {};
    let finalData;
    if (options.merge) {
      finalData = { ...existing, ...data };
    } else {
      finalData = { ...data };
    }
    finalData.id = this.id;
    finalData = replaceSentinels(finalData);
    finalData.updatedAt = new Date().toISOString();
    
    this.db.data[this.collectionName][this.id] = finalData;
    this.db.saveData();
    return true;
  }

  async update(data) {
    if (!this.db.data[this.collectionName] || !this.db.data[this.collectionName][this.id]) {
      // If we are updating and document doesn't exist, create it (safe fallback for mock)
      return this.set(data, { merge: true });
    }
    const existing = this.db.data[this.collectionName][this.id];
    const updated = replaceSentinels({ ...existing, ...data });
    updated.updatedAt = new Date().toISOString();
    
    this.db.data[this.collectionName][this.id] = updated;
    this.db.saveData();
    return true;
  }

  async delete() {
    if (this.db.data[this.collectionName] && this.db.data[this.collectionName][this.id]) {
      delete this.db.data[this.collectionName][this.id];
      this.db.saveData();
    }
    return true;
  }
}

class MockDocSnapshot {
  constructor(id, data, collectionName, db) {
    this.id = id;
    this.exists = !!data;
    this._data = data || null;
    this.ref = new MockDoc(db, collectionName, id);
  }

  data() {
    if (!this._data) return null;
    
    // Mock toDate() for timestamp compatibility
    const copy = { ...this._data };
    for (const key of Object.keys(copy)) {
      const val = copy[key];
      if (typeof val === 'string' && (val.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(val))) {
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
          copy[key] = {
            toDate: () => date,
            toISOString: () => date.toISOString()
          };
        }
      }
    }
    return copy;
  }
}

class MockQuerySnapshot {
  constructor(docs) {
    this.docs = docs;
    this.empty = docs.length === 0;
    this.size = docs.length;
  }
  
  forEach(callback) {
    this.docs.forEach(callback);
  }
}

class MockBatch {
  constructor(db) {
    this.db = db;
    this.ops = [];
  }

  set(docRef, data, options = {}) {
    this.ops.push({ type: 'set', docRef, data, options });
    return this;
  }

  update(docRef, data) {
    this.ops.push({ type: 'update', docRef, data });
    return this;
  }

  delete(docRef) {
    this.ops.push({ type: 'delete', docRef });
    return this;
  }

  async commit() {
    for (const op of this.ops) {
      const { type, docRef, data, options } = op;
      if (type === 'set') {
        await docRef.set(data, options);
      } else if (type === 'update') {
        await docRef.update(data);
      } else if (type === 'delete') {
        await docRef.delete();
      }
    }
    return true;
  }
}

// Replaces FieldValue serverTimestamp placeholders with actual ISO strings
function replaceSentinels(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  if (obj === 'SERVER_TIMESTAMP_SENTINEL') {
    return new Date().toISOString();
  }
  
  for (const key of Object.keys(obj)) {
    if (obj[key] === 'SERVER_TIMESTAMP_SENTINEL') {
      obj[key] = new Date().toISOString();
    } else if (typeof obj[key] === 'object') {
      obj[key] = replaceSentinels(obj[key]);
    }
  }
  return obj;
}

module.exports = MockDb;
