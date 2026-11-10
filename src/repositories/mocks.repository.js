import mongoose from 'mongoose';
import { UserModel } from '../models/user.model.js';
import { OrderModel } from '../models/order.model.js';
import { DeliveryModel } from '../models/delivery.model.js';

class MocksRepository {
  generateId() {
    return new mongoose.Types.ObjectId();
  }

  async insertUsers(users) {
    const inserted = await UserModel.insertMany(users, { ordered: true });
    return inserted.length;
  }

  async insertDataset({ users, orders, deliveries }) {
    const insertedUsers = await UserModel.insertMany(users, { ordered: true });
    const insertedOrders = await OrderModel.insertMany(orders, { ordered: true });
    const insertedDeliveries = await DeliveryModel.insertMany(deliveries, { ordered: true });

    return {
      users: insertedUsers.length,
      orders: insertedOrders.length,
      deliveries: insertedDeliveries.length,
    };
  }
}

export const mocksRepository = new MocksRepository();