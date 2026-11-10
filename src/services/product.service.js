import { productRepository } from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import {
  InvalidIdError,
  ProductNotFoundError,
  InvalidProductStatusError,
} from '../errors/custom-errors.js';

const getStatusFromStock = (stock) =>
  stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

const ensureValidId = (id) => {
  if (!productRepository.isValidId(id)) {
    throw new InvalidIdError(id);
  }
};

const ensureNoStatus = (data) => {
  if (data.status !== undefined) {
    throw new InvalidProductStatusError(data.status);
  }
};

class ProductService {
  async getAll() {
    return productRepository.getAll({ status: PRODUCT_STATUS.AVAILABLE });
  }

  async getById(id) {
    ensureValidId(id);
    const product = await productRepository.getById(id);

    if (!product) {
      throw new ProductNotFoundError(id);
    }

    return product;
  }

  async create(data = {}) {
    ensureNoStatus(data);
    const stock = data.stock ?? 0;

    return productRepository.create({
      ...data,
      stock,
      status: getStatusFromStock(stock),
    });
  }

  async update(id, data = {}) {
    ensureValidId(id);
    ensureNoStatus(data);
    const changes = { ...data };

    if (changes.stock !== undefined) {
      changes.status = getStatusFromStock(changes.stock);
    }

    const updatedProduct = await productRepository.update(id, changes);

    if (!updatedProduct) {
      throw new ProductNotFoundError(id);
    }

    return updatedProduct;
  }

  async delete(id) {
    ensureValidId(id);
    const deletedProduct = await productRepository.delete(id);

    if (!deletedProduct) {
      throw new ProductNotFoundError(id);
    }

    return deletedProduct;
  }
}

export const productService = new ProductService();