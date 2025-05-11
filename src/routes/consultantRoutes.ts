import express from 'express';
import { submitConsultation } from '@app/controllers/consultantController';

const router = express.Router();

router.post('/consult', submitConsultation);

export default router;
