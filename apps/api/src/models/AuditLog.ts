import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  user_email: string;
  target_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    user_email: { type: String, required: true },
    target_id: { type: String },
    details: { type: Schema.Types.Mixed },
    ip_address: { type: String }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
