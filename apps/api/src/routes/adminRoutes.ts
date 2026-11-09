import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Administrative routes protected by Argon2id authenticated session/JWT
router.use(requireAdmin);

router.post('/resources', ResourceController.publishVersion);
router.post('/resources/:id/versions', ResourceController.publishVersion);

export default router;
