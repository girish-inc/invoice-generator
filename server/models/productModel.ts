import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  qty: number;
  rate: number;
  userId: string;
}

const productSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', productSchema);