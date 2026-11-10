import mongoose from 'mongoose';
import { UserModel } from '../models/user.model.js';

const PUBLIC_FIELDS = 'name email role';

class UserRepository {
  isValidId(id) {
    return mongoose.isObjectIdOrHexString(id);
  }

  async getAll(filters = {}) {
    return UserModel.find(filters)
      .select(PUBLIC_FIELDS)
      .sort({ name: 1 })
      .lean();
  }

  async getById(id) {
    return UserModel.findById(id).select(PUBLIC_FIELDS).lean();
  }

  async create(data) {
    const user = await UserModel.create(data);
    const { password, ...publicUser } = user.toObject();
    return publicUser;
  }

  async update(id, data) {
    return UserModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    })
      .select(PUBLIC_FIELDS)
      .lean();
  }

  async delete(id) {
    return UserModel.findByIdAndDelete(id).select(PUBLIC_FIELDS).lean();
  }
}

export const userRepository = new UserRepository();