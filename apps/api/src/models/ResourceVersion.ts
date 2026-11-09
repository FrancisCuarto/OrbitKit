import mongoose, { Schema, Document } from 'mongoose';
import { ResourceManifest } from '@devdock/shared-types';

export interface IResourceVersion extends Document {
  resource_id: string;
  version: string;
  manifest: ResourceManifest;
  changelog?: string;
  verified: boolean;
  created_at: Date;
}

const ResourceVersionSchema = new Schema<IResourceVersion>(
  {
    resource_id: { type: String, required: true, index: true },
    version: { type: String, required: true },
    manifest: { type: Schema.Types.Mixed, required: true },
    changelog: { type: String },
    verified: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

// Compound index to guarantee uniqueness of resource_id + version
ResourceVersionSchema.index({ resource_id: 1, version: 1 }, { unique: true });

export const ResourceVersionModel = mongoose.model<IResourceVersion>(
  'ResourceVersion',
  ResourceVersionSchema
);
