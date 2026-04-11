'use strict';

const { MongoClient } = require('mongodb');

let client;

const getClient = async () => {
  if (!client) {
    const url = process.env.MONGO_URL || 'mongodb://mongo:27017/docker-node-mongo';
    client = new MongoClient(url);
    await client.connect();
    console.log('Conectado a MongoDB');
  }
  return client;
};

const getDb = async (dbName = 'AlexDB') => {
  const c = await getClient();
  return c.db(dbName);
};

const closeClient = async () => {
  if (client) {
    await client.close();
    client = null;
  }
};

module.exports = { getDb, closeClient };
