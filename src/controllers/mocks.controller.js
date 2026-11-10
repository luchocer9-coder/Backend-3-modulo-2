import { mocksService } from '../services/mocks.service.js';

class MocksController {
  getUsers(req, res) {
    res.status(200).json(mocksService.getUsers(req.query.qty));
  }

  getDrivers(req, res) {
    res.status(200).json(mocksService.getDrivers(req.query.qty));
  }

  getDataset(req, res) {
    res.status(200).json(mocksService.getDataset(req.query.qty));
  }

  async seedUsers(req, res) {
    const result = await mocksService.seedUsers(req.query.qty);
    res.status(201).json(result);
  }

  async seedDataset(req, res) {
    const result = await mocksService.seedDataset(req.query.qty);
    res.status(201).json(result);
  }
}

export const mocksController = new MocksController();