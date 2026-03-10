import { Router } from 'express';
const router = Router();
import { sendSelectionEmail, sendBulkEmail } from '../Controllers/emailController.js';

router.post('/send-selection', sendSelectionEmail);
router.post('/send-bulk', sendBulkEmail);

export default router;
