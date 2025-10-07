import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../lib/db.js';
import { Admin } from '../models/Admin.js';
import { Manager } from '../models/Manager.js';
import { Member } from '../models/Member.js';
import { Registration } from '../models/Registration.js';
import { Booking } from '../models/Booking.js';
import { ToolsConfirmation } from '../models/ToolsConfirmation.js';
import { Feedback } from '../models/Feedback.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    const existing = await Admin.findOne({ email: 'admin@garden.local' });
    if (!existing) {
      await Admin.create({
        name: 'Admin User',
        email: 'admin@garden.local',
        password: 'Admin@123',
      });
      await Manager.create({
        name: 'Manager User',
        email: 'manager@garden.local',
        password: 'Manager@123',
      });
      await Member.create({
        name: 'Member User',
        email: 'member@garden.local',
        password: 'Member@123',
      });
      console.log('Seeded default users in separate collections: admins, managers, members');
    }

    // Ensure requested accounts exist
    // Helper: ensure user exists with specified password (reset if exists)
    const ensureUser = async (Model, email, name, password) => {
      let doc = await Model.findOne({ email });
      if (!doc) {
        await Model.create({ name, email, password });
        console.log(`Created ${email} with new password`);
        return;
      }
      // Reset password by saving (triggers pre-save hash)
      doc.password = password;
      await doc.save();
      console.log(`Reset password for ${email}`);
    };

    await ensureUser(Admin, 'admin@garden.com', 'Admin', 'garden 123');
    await ensureUser(Manager, 'manager@garden.com', 'Manager', 'manager 123');

    // Create one sample document in each domain collection if empty so Compass shows them
    if ((await Registration.estimatedDocumentCount()) === 0) {
      await Registration.create({ memberName: 'Sample Member', email: 'sample@garden.local', consent: true, newsletter: true });
      console.log('Seeded sample registration');
    }
    if ((await Booking.estimatedDocumentCount()) === 0) {
      await Booking.create({ memberName: 'Sample Member', plotId: 'P01', plotSize: 'Small', startDate: '2025-09-01', endDate: '2025-10-01', status: 'Pending' });
      console.log('Seeded sample booking');
    }
    if ((await ToolsConfirmation.estimatedDocumentCount()) === 0) {
      await ToolsConfirmation.create({ orientationDate: '2025-09-05', orientationTime: '09:00', toolPickupLocation: 'Shed A', gloves: 'M', safetyWaiverAccepted: true });
      console.log('Seeded sample tools confirmation');
    }
    if ((await Feedback.estimatedDocumentCount()) === 0) {
      await Feedback.create({ rating: 5, comments: 'Great!', maintenanceType: 'None', urgency: 'Low', contactMethod: 'Email' });
      console.log('Seeded sample feedback');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
