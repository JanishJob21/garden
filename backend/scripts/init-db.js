require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Import models
const User = require('../models/User');
const Member = require('../models/Member');
const { Plot, Booking } = require('../models/Plot');
const Tool = require('../models/Tool');
const Feedback = require('../models/Feedback');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Gardener',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  }
];

const sampleMembers = [
  {
    fullName: 'John Gardener',
    email: 'john@example.com',
    phone: '555-0101',
    address: {
      street: '123 Garden St',
      city: 'Greentown',
      state: 'GT',
      zipCode: '12345'
    },
    dateOfBirth: new Date('1985-05-15'),
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '555-0102'
    },
    membershipType: 'individual',
    status: 'active',
    skills: ['vegetable gardening', 'composting']
  },
  {
    fullName: 'Alice Farmer',
    email: 'alice@example.com',
    phone: '555-0202',
    address: {
      street: '456 Orchard Ave',
      city: 'Greentown',
      state: 'GT',
      zipCode: '12345'
    },
    dateOfBirth: new Date('1990-08-22'),
    emergencyContact: {
      name: 'Bob Farmer',
      relationship: 'Partner',
      phone: '555-0203'
    },
    membershipType: 'family',
    status: 'active',
    skills: ['fruit trees', 'beekeeping']
  }
];

const samplePlots = [
  {
    plotNumber: 'A-101',
    size: 100,
    location: 'North Section',
    status: 'available',
    pricePerMonth: 50,
    features: ['shade', 'water', 'fencing'],
    description: 'Sunny plot with good soil and easy access to water.'
  },
  {
    plotNumber: 'A-102',
    size: 120,
    location: 'North Section',
    status: 'available',
    pricePerMonth: 60,
    features: ['full sun', 'water', 'compost'],
    description: 'Ideal for sun-loving plants.'
  },
  {
    plotNumber: 'B-201',
    size: 80,
    location: 'South Section',
    status: 'booked',
    pricePerMonth: 45,
    features: ['partial shade', 'water'],
    description: 'Great for leafy greens and herbs.'
  }
];

const sampleTools = [
  {
    name: 'Rototiller',
    description: 'Gas-powered garden tiller for preparing soil',
    category: 'power',
    status: 'available',
    condition: 'good',
    location: 'Tool Shed A',
    purchaseDate: new Date('2022-03-15'),
    purchasePrice: 599.99
  },
  {
    name: 'Wheelbarrow',
    description: 'Heavy-duty wheelbarrow for transporting soil and plants',
    category: 'hand',
    status: 'available',
    condition: 'excellent',
    location: 'Tool Shed B',
    purchaseDate: new Date('2023-01-10'),
    purchasePrice: 129.99
  },
  {
    name: 'Pruning Shears',
    description: 'Sharp bypass pruners for clean cuts',
    category: 'pruning',
    status: 'checked_out',
    condition: 'good',
    location: 'Tool Shed A',
    purchaseDate: new Date('2023-02-20'),
    purchasePrice: 24.99
  }
];

const sampleFeedback = [
  {
    title: 'More tools needed',
    message: 'We need more wheelbarrows during peak season',
    type: 'suggestion',
    rating: 4,
    category: ['tools', 'facility'],
    status: 'new'
  },
  {
    title: 'Great community garden!',
    message: 'I love being part of this garden. The community is wonderful!',
    type: 'praise',
    rating: 5,
    category: ['community'],
    status: 'resolved'
  }
];

const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Member.deleteMany({}),
      Plot.deleteMany({}),
      Booking.deleteMany({}),
      Tool.deleteMany({}),
      Feedback.deleteMany({})
    ]);
    
    // Create users with hashed passwords
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const user of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      createdUsers.push(newUser);
    }
    
    // Create members
    console.log('👥 Creating members...');
    const createdMembers = [];
    for (const member of sampleMembers) {
      const user = createdUsers.find(u => u.email === member.email);
      const newMember = await Member.create({
        ...member,
        user: user ? user._id : null
      });
      createdMembers.push(newMember);
    }
    
    // Create plots
    console.log('🌱 Creating plots...');
    const createdPlots = [];
    for (const plot of samplePlots) {
      const newPlot = await Plot.create(plot);
      createdPlots.push(newPlot);
    }
    
    // Create bookings
    console.log('📅 Creating bookings...');
    if (createdPlots.length > 0 && createdMembers.length > 0) {
      await Booking.create({
        plot: createdPlots[2]._id, // B-201 is booked
        member: createdMembers[0]._id,
        startDate: new Date('2023-11-01'),
        endDate: new Date('2024-10-31'),
        status: 'confirmed',
        paymentStatus: 'paid',
        totalAmount: 540,
        paymentMethod: 'credit_card',
        notes: 'Annual booking'
      });
    }
    
    // Create tools
    console.log('🔧 Creating tools...');
    for (const tool of sampleTools) {
      await Tool.create(tool);
    }
    
    // Create feedback
    console.log('💬 Creating feedback...');
    for (const feedback of sampleFeedback) {
      await Feedback.create({
        ...feedback,
        member: createdMembers[0]._id
      });
    }
    
    console.log('\n✅ Database initialized successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Members: ${createdMembers.length}`);
    console.log(`- Plots: ${createdPlots.length}`);
    console.log(`- Tools: ${sampleTools.length}`);
    console.log(`- Feedback: ${sampleFeedback.length}`);
    
    console.log('\n🔑 Admin Login:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeDatabase();
