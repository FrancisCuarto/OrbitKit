import mongoose, { Schema, Document } from 'mongoose';
import { ResourceType } from '@devdock/shared-types';

export interface IResource extends Document {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  author: string;
  license: string;
  tags: string[];
  latest_version: string;
  downloads_count: number;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'godot_addon',
        'ai_skill',
        'script_system',
        'shader_material',
        'graphic_asset',
        'tool'
      ],
      index: true
    },
    description: { type: String, required: true },
    author: { type: String, required: true, index: true },
    license: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    latest_version: { type: String, required: true },
    downloads_count: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Full text search index
ResourceSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const ResourceModel = mongoose.model<IResource>('Resource', ResourceSchema);
