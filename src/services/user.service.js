import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { USER_ROLES } from '../constants/index.js';
import {
  InvalidIdError,
  UserNotFoundError,
  InvalidPasswordError,
} from '../errors/custom-errors.js';

const MIN_PASSWORD_LENGTH = 8;
const SALT_ROUNDS = 10;

const ensureValidId = (id) => {
  if (!userRepository.isValidId(id)) {
    throw new InvalidIdError(id);
  }
};

const hashPassword = async (password) => {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new InvalidPasswordError(MIN_PASSWORD_LENGTH);
  }

  return bcrypt.hash(password, SALT_ROUNDS);
};

class UserService {
  async getAll() {
    return userRepository.getAll();
  }

  async getById(id) {
    ensureValidId(id);
    const user = await userRepository.getById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return user;
  }

  async create(data = {}) {
    const password = await hashPassword(data.password);

    return userRepository.create({
      ...data,
      password,
      role: USER_ROLES.USER,
    });
  }

  async update(id, data = {}) {
    ensureValidId(id);
    const { role, ...changes } = data;

    if (changes.password !== undefined) {
      changes.password = await hashPassword(changes.password);
    }

    const updatedUser = await userRepository.update(id, changes);

    if (!updatedUser) {
      throw new UserNotFoundError(id);
    }

    return updatedUser;
  }

  async delete(id) {
    ensureValidId(id);
    const deletedUser = await userRepository.delete(id);

    if (!deletedUser) {
      throw new UserNotFoundError(id);
    }

    return deletedUser;
  }
}

export const userService = new UserService();