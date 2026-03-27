const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URL;

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri);
  
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log('✅ MongoDB connected successfully!');
    
    const db = client.db('QuizApp_users');
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await client.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Start local MongoDB: Run "mongod" in terminal');
    console.log('2. Use MongoDB Atlas: Get free cluster at https://www.mongodb.com/cloud/atlas');
    console.log('3. Update MONGODB_URL in .env.local with Atlas connection string');
  }
}

testConnection();
