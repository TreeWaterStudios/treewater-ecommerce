import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticatePocketBase } from './utils/pocketbaseAuth.js';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/index.js';
import { multerErrorHandler } from './middleware/multer.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception:', error);
});
  
process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
	logger.info('Interrupted');
	process.exit(0);
});

process.on('SIGTERM', async () => {
	logger.info('SIGTERM signal received');

	await new Promise(resolve => setTimeout(resolve, 3000));

	logger.info('Exiting');
	process.exit();
});

app.use(helmet());

// CORS configuration - MUST come before routes
app.use(cors({
	origin: [
		'https://horizons.hostinger.com',
		'https://treewaterstudios.com',
		'http://treewaterstudios.com',
	],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images from /uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
logger.info(`[UPLOAD] Static file serving configured for /uploads directory`);

app.use('/', routes());

// Multer error handling middleware (must come after routes)
app.use(multerErrorHandler);

app.use(errorMiddleware);

app.get('/', (req, res) => {
	res.status(200).json({ ok: true, service: 'treewater-api' });
});

app.head('/', (req, res) => {
	res.sendStatus(200);
});

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

const startServer = async () => {
	try {
		await authenticatePocketBase();

		app.listen(port, () => {
			logger.info(`Server running on port ${port}`);
		});

	} catch (error) {
		logger.error('Failed to start server:', error);
		process.exit(1);
	}
};

startServer();

export default app;