import express from 'express';
import { passwordConfig as SQLAuthentication } from './config.js';
import { createDatabaseConnection } from './database.js';

const router = express.Router();
router.use(express.json());

//Connect to SQL server and create the users and notes tables if not existing
const database = await createDatabaseConnection(SQLAuthentication);

export default router;