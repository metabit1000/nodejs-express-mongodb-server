'use strict';

/**
 * Integration-style tests using Jest mocks for the MongoDB layer.
 * All 4 endpoints are exercised through the Express app with supertest.
 */

const request = require('supertest');

// ─── Mock MongoDB ─────────────────────────────────────────────────────────────
// We mock ../src/config/db so that every controller gets an in-memory store
// without needing a real (or in-process) MongoDB server.

const store = {
  login: [],
  contactos: [],
};

const makeCollection = (name) => ({
  countDocuments: jest.fn(async (query) => {
    const key = Object.values(query)[0]?.$eq ?? Object.values(query)[0];
    return store[name].filter((d) => d.user === key).length;
  }),
  insertOne: jest.fn(async (doc) => {
    store[name].push({ ...doc });
  }),
  findOne: jest.fn(async (query) => {
    const key = Object.values(query)[0]?.$eq ?? Object.values(query)[0];
    return store[name].find((d) => d.user === key) ?? null;
  }),
  find: jest.fn((query) => ({
    toArray: async () => {
      const key = Object.values(query)[0]?.$eq ?? Object.values(query)[0];
      return store[name].filter((d) => d.user === key);
    },
  })),
  updateOne: jest.fn(async (query, update) => {
    const key = Object.values(query)[0]?.$eq ?? Object.values(query)[0];
    const idx = store[name].findIndex((d) => d.user === key);
    if (idx !== -1) Object.assign(store[name][idx], update.$set);
  }),
});

jest.mock('../src/config/db', () => ({
  getDb: jest.fn(async () => ({
    collection: (name) => makeCollection(name),
  })),
  closeClient: jest.fn(async () => {}),
}));

// Load app AFTER mocks are in place
const app = require('../app');

// Reset the in-memory store between test suites
beforeEach(() => {
  store.login.length = 0;
  store.contactos.length = 0;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  it('201 — registers a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ user: 'alice', password: 'secret123', email: 'alice@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registro correcto/i);
  });

  it('409 — rejects duplicate user', async () => {
    store.login.push({ user: 'alice', password: 'hash', email: 'alice@example.com' });
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ user: 'alice', password: 'secret123', email: 'alice2@example.com' });
    expect(res.status).toBe(409);
  });

  it('400 — rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ user: 'bob' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  // Seed a real bcrypt hash for 'secret123' so login can verify it
  const bcrypt = require('bcryptjs');
  let passwordHash;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('secret123', 1); // low rounds for speed in tests
  });

  beforeEach(() => {
    store.login.push({ user: 'alice', password: passwordHash, email: 'alice@example.com' });
  });

  it('200 — logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ user: 'alice', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/login correcto/i);
  });

  it('401 — rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ user: 'alice', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('401 — rejects unknown user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ user: 'nobody', password: 'pass' });
    expect(res.status).toBe(401);
  });

  it('400 — rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ user: 'alice' });
    expect(res.status).toBe(400);
  });
});

// ─── Contacts ─────────────────────────────────────────────────────────────────

describe('POST /api/v1/contacts', () => {
  it('201 — creates a new contact', async () => {
    const res = await request(app)
      .post('/api/v1/contacts')
      .send({ user: 'alice', telf: '+34600000001' });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registrado/i);
  });

  it('200 — updates existing contact', async () => {
    store.contactos.push({ user: 'alice', telf: '+34600000001' });
    const res = await request(app)
      .post('/api/v1/contacts')
      .send({ user: 'alice', telf: '+34600000002' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/modificado/i);
  });

  it('400 — rejects missing telf', async () => {
    const res = await request(app)
      .post('/api/v1/contacts')
      .send({ user: 'alice' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/contacts', () => {
  beforeEach(() => {
    store.contactos.push({ user: 'alice', telf: '+34600000002' });
  });

  it('200 — returns contacts for a known user', async () => {
    const res = await request(app)
      .get('/api/v1/contacts')
      .query({ user: 'alice' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].telf).toBe('+34600000002');
  });

  it('404 — returns 404 for user with no contacts', async () => {
    const res = await request(app)
      .get('/api/v1/contacts')
      .query({ user: 'nobody' });
    expect(res.status).toBe(404);
  });

  it('400 — rejects missing user query param', async () => {
    const res = await request(app).get('/api/v1/contacts');
    expect(res.status).toBe(400);
  });
});

