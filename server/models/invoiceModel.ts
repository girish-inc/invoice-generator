import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  userId: string;
  products: Array<any>;
  date: Date;
}

const invoiceSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);