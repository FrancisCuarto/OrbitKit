import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  resource_count: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    icon: { type: String },
    resource_count: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
