import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  orgId: string;
  nickname: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    orgId: {
      type: String,
      required: true,
      index: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
        index: true,
      },
      state: {
        type: String,
        required: true,
        index: true,
      },
      zip: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient org-scoped queries
PropertySchema.index({ orgId: 1, createdAt: -1 });
PropertySchema.index({ orgId: 1, 'address.city': 1 });
PropertySchema.index({ orgId: 1, 'address.state': 1 });

export const Property = mongoose.model<IProperty>('Property', PropertySchema);
