import { Router } from 'express';
import { mocksController } from '../controllers/mocks.controller.js';

const router = Router();

router.get('/users', mocksController.getUsers);
router.get('/drivers', mocksController.getDrivers);
router.get('/dataset', mocksController.getDataset);
router.post('/seed', mocksController.seedUsers);
router.post('/seed/dataset', mocksController.seedDataset);

export default router;