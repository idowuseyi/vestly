import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
  propertyId: mongoose.Types.ObjectId;
  orgId: string;
  unitNumber: string;
  rent: number;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
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
    unitNumber: {
      type: String,
      required: true,
      trim: true,
    },
    rent: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
UnitSchema.index({ orgId: 1, propertyId: 1 });
UnitSchema.index({ orgId: 1, unitNumber: 1 });

// Ensure unique unit numbers per property within an org
UnitSchema.index({ orgId: 1, propertyId: 1, unitNumber: 1 }, { unique: true });

export const Unit = mongoose.model<IUnit>('Unit', UnitSchema);
