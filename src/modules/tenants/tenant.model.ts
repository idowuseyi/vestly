import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  unitId: mongoose.Types.ObjectId;
  orgId: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    unitId: {
      type: Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
      index: true,
    },
    orgId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
TenantSchema.index({ orgId: 1, userId: 1 });
TenantSchema.index({ orgId: 1, unitId: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
