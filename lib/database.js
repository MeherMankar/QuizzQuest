import clientPromise from './mongodb.js';

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (!this.client) {
      this.client = await clientPromise;
      this.db = this.client.db('QuizApp_users');
    }
    return this.db;
  }

  async getCollection(collectionName) {
    const db = await this.connect();
    return db.collection(collectionName);
  }

  // User operations
  async findUser(email) {
    const users = await this.getCollection('users');
    return users.findOne({ email });
  }

  async createUser(userData) {
    const users = await this.getCollection('users');
    return users.insertOne(userData);
  }

  async updateUser(email, updateData) {
    const users = await this.getCollection('users');
    return users.updateOne({ email }, { $set: updateData });
  }

  // Question operations
  async findQuestions(filter = {}) {
    const questions = await this.getCollection('questions');
    return questions.find(filter).toArray();
  }

  async insertQuestions(questionsArray) {
    const questions = await this.getCollection('questions');
    return questions.insertMany(questionsArray);
  }

  // Score operations
  async recordScore(scoreData) {
    const scores = await this.getCollection('scores');
    return scores.insertOne(scoreData);
  }

  async getUserScores(email) {
    const scores = await this.getCollection('scores');
    return scores.find({ email }).sort({ timestamp: -1 }).toArray();
  }

  async getTopScores(limit = 10) {
    const scores = await this.getCollection('scores');
    return scores.find({}).sort({ score: -1 }).limit(limit).toArray();
  }
}

export default new DatabaseManager();