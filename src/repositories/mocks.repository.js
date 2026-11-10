import mongoose from 'mongoose';
import { UserModel } from '../models/user.model.js';
import { OrderModel } from '../models/order.model.js';
import { DeliveryModel } from '../models/delivery.model.js';

const idsOf = (docs) => docs.map((doc) => doc._id);

class MocksRepository {
  generateId() {
    return new mongoose.Types.ObjectId();
  }

  async insertUsers(users) {
    try {
      const inserted = await UserModel.insertMany(users, { ordered: true });
      return inserted.length;
    } catch (error) {
      await this.removeByIds({ users });
      throw error;
    }
  }

  async insertDataset({ users, orders, deliveries }) {
    try {
      const insertedUsers = await UserModel.insertMany(users, { ordered: true });
      const insertedOrders = await OrderModel.insertMany(orders, { ordered: true });
      const insertedDeliveries = await DeliveryModel.insertMany(deliveries, { ordered: true });

      return {
        users: insertedUsers.length,
        orders: insertedOrders.length,
        deliveries: insertedDeliveries.length,
      };
    } catch (error) {
      await this.removeByIds({ users, orders, deliveries });
      throw error;
    }
  }

  // Si la carga falla a mitad de camino, borra lo que se llegó a guardar
  async removeByIds({ users = [], orders = [], deliveries = [] }) {
    await Promise.allSettled([
      UserModel.deleteMany({ _id: { $in: idsOf(users) } }),
      OrderModel.deleteMany({ _id: { $in: idsOf(orders) } }),
      DeliveryModel.deleteMany({ _id: { $in: idsOf(deliveries) } }),
    ]);
  }
}

export const mocksRepository = new MocksRepository();