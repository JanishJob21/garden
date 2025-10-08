require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    // Mask password in connection string for logging
    const maskedUri = process.env.MONGODB_URI.replace(/:([^:]*?)@/, ':***@');
    console.log('🔍 Testing connection to:', maskedUri);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log('✅ Successfully connected to MongoDB');
    
    // Get database name
    const db = mongoose.connection.db;
    console.log('📂 Database:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Collections:');
    if (collections.length > 0) {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    } else {
      console.log('No collections found. Creating a test collection...');
      await db.createCollection('test_collection');
      console.log('✅ Created test_collection');
    }
    
    // Test insert
    const testDoc = { message: 'Test document', timestamp: new Date() };
    const result = await db.collection('test_connection').insertOne(testDoc);
    console.log('\n✅ Test document inserted with _id:', result.insertedId);
    
    // Count documents
    const count = await db.collection('test_connection').countDocuments();
    console.log(`📝 Total test documents: ${count}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    // Provide specific troubleshooting tips
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify your MongoDB Atlas IP whitelist');
      console.log('3. Check your database user credentials');
      console.log('4. Make sure the database name is correct');
    }
    
    process.exit(1);
  }
};

testConnection();
