import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'admin' | 'maintainer';
  created_at: Date;
  last_login?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'maintainer'], default: 'admin' },
    last_login: { type: Date }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
