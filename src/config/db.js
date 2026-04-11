'use strict';

const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL || 'mongodb://mongo:27017/docker-node-mongo';

let client;

const getClient = async () => {
  if (!client) {
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

module.exports = { getDb };
