import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URL; 
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URL) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then(connectedClient => {
        console.log('✅ MongoDB connected successfully');
        return connectedClient;
      })
      .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        console.error('Make sure MongoDB is running or check your MONGODB_URL in .env.local');
        throw err; // Propagate the error so callers get a real exception
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
      console.error('❌ MongoDB connection failed:', err.message);
      throw err; // Propagate the error so callers get a real exception
    });
}

export default clientPromise;
