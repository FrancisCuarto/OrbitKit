import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController.js';

const router = Router();

// Public routes for Godot Editor Plugin and Web
router.get('/', ResourceController.list);
router.get('/:id', ResourceController.getById);
router.get('/:id/versions', ResourceController.getVersions);
router.get('/:id/compatibility', ResourceController.checkCompatibility);

export default router;
