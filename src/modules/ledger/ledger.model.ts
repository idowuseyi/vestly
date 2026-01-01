import mongoose, { Schema, Document } from 'mongoose';
import { TransactionType } from '../../shared/types';

export interface IOwnershipCreditTransaction extends Document {
  orgId: string;
  tenantId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  memo: string;
  createdAt: Date;
}

const OwnershipCreditTransactionSchema = new Schema<IOwnershipCreditTransaction>(
  {
    orgId: {
      type: String,
      required: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    memo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
  }
);

// CRITICAL: Enforce immutability - prevent updates and deletes
OwnershipCreditTransactionSchema.pre('findOneAndUpdate', function (next) {
  next(new Error('Ledger transactions cannot be updated'));
});

OwnershipCreditTransactionSchema.pre('updateOne', function (next) {
  next(new Error('Ledger transactions cannot be updated'));
});

OwnershipCreditTransactionSchema.pre('updateMany', function (next) {
  next(new Error('Ledger transactions cannot be updated'));
});

OwnershipCreditTransactionSchema.pre('findOneAndDelete', function (next) {
  next(new Error('Ledger transactions cannot be deleted'));
});

OwnershipCreditTransactionSchema.pre('deleteOne', function (next) {
  next(new Error('Ledger transactions cannot be deleted'));
});

OwnershipCreditTransactionSchema.pre('deleteMany', function (next) {
  next(new Error('Ledger transactions cannot be deleted'));
});

// Compound indexes for efficient balance calculations and ledger queries
OwnershipCreditTransactionSchema.index({ orgId: 1, tenantId: 1, createdAt: -1 });
OwnershipCreditTransactionSchema.index({ orgId: 1, unitId: 1 });

export const OwnershipCreditTransaction = mongoose.model<IOwnershipCreditTransaction>(
  'OwnershipCreditTransaction',
  OwnershipCreditTransactionSchema
);
