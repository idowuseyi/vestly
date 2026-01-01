import mongoose, { Schema, Document } from 'mongoose';

export interface IValuationSnapshot extends Document {
  propertyId: mongoose.Types.ObjectId;
  orgId: string;
  unitCount: number;
  totalRent: number;
  totalCredits: number;
  createdAt: Date;
}

const ValuationSnapshotSchema = new Schema<IValuationSnapshot>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    orgId: {
      type: String,
      required: true,
      index: true,
    },
    unitCount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalRent: {
      type: Number,
      required: true,
      default: 0,
    },
    totalCredits: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for efficient queries
ValuationSnapshotSchema.index({ orgId: 1, propertyId: 1, createdAt: -1 });

export const ValuationSnapshot = mongoose.model<IValuationSnapshot>(
  'ValuationSnapshot',
  ValuationSnapshotSchema
);
