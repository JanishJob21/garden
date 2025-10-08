const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔌 Testing MongoDB Atlas connection...');
console.log('Using connection string:', 
  process.env.MONGODB_URI.replace(/:([^:]*?)@/, ':***@'));

const testConnection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Successfully connected to MongoDB Atlas');
    
    // Create a test collection and insert a document
    const testCollection = mongoose.connection.db.collection('testConnection');
    await testCollection.insertOne({ 
      message: 'Test connection successful',
      timestamp: new Date() 
    });
    
    console.log('✅ Successfully created test document');
    
    // List all databases (requires admin privileges)
    try {
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.listDatabases();
      console.log('\n📦 Available databases:');
      console.log(result.databases.map(db => `- ${db.name}`));
    } catch (adminError) {
      console.log('\n⚠️ Could not list all databases (admin access required)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your MongoDB Atlas IP whitelist');
    console.log('3. Check your database user permissions');
    console.log('4. Ensure the database name is correct');
    process.exit(1);
  }
};

testConnection();
