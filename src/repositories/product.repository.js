import mongoose from 'mongoose';
import { ProductModel } from '../models/product.model.js';

const PUBLIC_FIELDS = 'name price stock status';

class ProductRepository {
  isValidId(id) {
    return mongoose.isObjectIdOrHexString(id);
  }

  async getAll(filters = {}) {
    return ProductModel.find(filters)
      .select(PUBLIC_FIELDS)
      .sort({ name: 1 })
      .lean();
  }

  async getById(id) {
    return ProductModel.findById(id)
      .select(PUBLIC_FIELDS)
      .lean();
  }

  async create(data) {
    const product = await ProductModel.create(data);
    return product.toObject();
  }

  async update(id, data) {
    return ProductModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    })
      .select(PUBLIC_FIELDS)
      .lean();
  }

  async delete(id) {
    return ProductModel.findByIdAndDelete(id).lean();
  }
}

export const productRepository = new ProductRepository();