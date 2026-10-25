import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/QuizApp_users';
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (process.env.NEXT_PHASE === 'phase-production-build') {
  clientPromise = Promise.resolve(null);
} else if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then(connectedClient => {
        console.log('✅ MongoDB connected successfully');
        return connectedClient;
      })
      .catch(err => {
        console.warn('⚠️ MongoDB not available yet, continuing without a DB connection for local development.');
        console.warn(err.message);
        return null;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(connectedClient => {
      console.log('✅ MongoDB connected successfully');
      return connectedClient;
    })
    .catch(err => {
      console.warn('⚠️ MongoDB connection failed during runtime startup.');
      console.warn(err.message);
      return null;
    });
}

export default clientPromise;
