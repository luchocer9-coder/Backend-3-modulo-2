import bcrypt from 'bcryptjs';
import { fakerES as faker } from '@faker-js/faker';
import { mocksRepository } from '../repositories/mocks.repository.js';
import { config } from '../config/env.config.js';
import {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS,
} from '../constants/index.js';
import { AppError } from '../utils/app-error.js';

const DEFAULT_QTY = 5;
const MAX_QTY = 100;
const MOCK_PASSWORD = 'mock1234';
const SALT_ROUNDS = 10;
const MOCK_ROLES = [USER_ROLES.USER, USER_ROLES.DRIVER];

// Cada estado de pedido tiene un estado de entrega coherente
const DELIVERY_STATUS_BY_ORDER = Object.freeze({
  [ORDER_STATUS.PENDING]: DELIVERY_STATUS.PENDING_ASSIGNMENT,
  [ORDER_STATUS.PREPARING]: DELIVERY_STATUS.ASSIGNED,
  [ORDER_STATUS.SHIPPED]: DELIVERY_STATUS.IN_TRANSIT,
  [ORDER_STATUS.DELIVERED]: DELIVERY_STATUS.DELIVERED,
  [ORDER_STATUS.CANCELLED]: DELIVERY_STATUS.CANCELLED,
});

// Solo estas entregas tienen un repartidor asignado
const STATUSES_WITH_DRIVER = [
  DELIVERY_STATUS.ASSIGNED,
  DELIVERY_STATUS.IN_TRANSIT,
  DELIVERY_STATUS.DELIVERED,
];

const parseQty = (qty) => {
  if (qty === undefined) return DEFAULT_QTY;

  const value = Number(qty);

  if (!Number.isInteger(value) || value < 1 || value > MAX_QTY) {
    throw new AppError(`qty debe ser un número entero entre 1 y ${MAX_QTY}`, 400);
  }

  return value;
};

const toEmailPart = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const generateUser = (role) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const suffix = faker.string.alphanumeric({ length: 5, casing: 'lower' });

  return {
    _id: mocksRepository.generateId(),
    name: `${firstName} ${lastName}`,
    email: `${toEmailPart(firstName)}.${toEmailPart(lastName)}.${suffix}@test.com`,
    role,
  };
};

const generateOrder = (client) => ({
  _id: mocksRepository.generateId(),
  user: client._id,
  address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
  total: faker.number.int({ min: 1000, max: 50000 }),
  status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
  priority: faker.helpers.arrayElement(Object.values(ORDER_PRIORITY)),
});

const generateDelivery = (order, drivers) => {
  const status = DELIVERY_STATUS_BY_ORDER[order.status];
  const needsDriver = STATUSES_WITH_DRIVER.includes(status);

  return {
    _id: mocksRepository.generateId(),
    order: order._id,
    driver: needsDriver ? faker.helpers.arrayElement(drivers)._id : null,
    status,
    deliveredAt: status === DELIVERY_STATUS.DELIVERED ? faker.date.recent({ days: 10 }) : null,
  };
};

const generateDataset = (qty) => {
  const clients = Array.from({ length: Math.ceil(qty / 2) }, () => generateUser(USER_ROLES.USER));
  const drivers = Array.from({ length: Math.ceil(qty / 3) }, () => generateUser(USER_ROLES.DRIVER));
  const orders = Array.from({ length: qty }, () => generateOrder(faker.helpers.arrayElement(clients)));
  const deliveries = orders.map((order) => generateDelivery(order, drivers));

  return { users: [...clients, ...drivers], orders, deliveries };
};

const withPassword = async (users) => {
  const password = await bcrypt.hash(MOCK_PASSWORD, SALT_ROUNDS);
  return users.map((user) => ({ ...user, password }));
};

const ensureSeedAllowed = () => {
  if (config.nodeEnv === 'production') {
    throw new AppError('La carga de datos de prueba no está permitida en producción', 403);
  }
};

class MocksService {
  getUsers(qty) {
    return Array.from({ length: parseQty(qty) }, () =>
      generateUser(faker.helpers.arrayElement(MOCK_ROLES)),
    );
  }

  getDrivers(qty) {
    return Array.from({ length: parseQty(qty) }, () => generateUser(USER_ROLES.DRIVER));
  }

  getDataset(qty) {
    return generateDataset(parseQty(qty));
  }

  async seedUsers(qty) {
    ensureSeedAllowed();
    const users = await withPassword(this.getUsers(qty));
    const inserted = await mocksRepository.insertUsers(users);
    return { insertados: inserted, coleccion: 'users' };
  }

  async seedDataset(qty) {
    ensureSeedAllowed();
    const dataset = generateDataset(parseQty(qty));
    const users = await withPassword(dataset.users);
    const inserted = await mocksRepository.insertDataset({ ...dataset, users });
    return { insertados: inserted };
  }
}

export const mocksService = new MocksService();