import mongoose from 'mongoose';

const toolsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    orientationDate: String,
    orientationTime: String,
    toolPickupLocation: String,
    wheelbarrow: Boolean,
    hoe: Boolean,
    rake: Boolean,
    shovel: Boolean,
    gloves: String,
    safetyWaiverAccepted: Boolean,
    remarks: String,
  },
  { timestamps: true }
);

export const ToolsConfirmation = mongoose.model('ToolsConfirmation', toolsSchema);
