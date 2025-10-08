const mongoose = require('mongoose');
require('dotenv').config();

// Get database name from connection string
const getDbName = (uri) => {
  try {
    const dbName = uri.split('/').pop().split('?')[0];
    return dbName || 'garden-scheduler';
  } catch (error) {
    return 'garden-scheduler';
  }
};

const connectDB = async () => {
  try {
    const dbName = getDbName(process.env.MONGODB_URI);
    console.log(`🔌 Connecting to MongoDB: ${dbName}...`);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB Connected to database:', mongoose.connection.name);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections:');
    console.log(collections.length > 0 
      ? collections.map(c => `- ${c.name}`).join('\n')
      : 'No collections found. They will be created automatically when you add data.');
    
    // Set up error handling
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('ℹ️ MongoDB disconnected');
    });
    
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your MongoDB Atlas IP whitelist');
    console.log('3. Check your database user permissions');
    console.log('4. Ensure the database name is correct in your .env file');
    
    process.exit(1);
  }
};

module.exports = connectDB;
