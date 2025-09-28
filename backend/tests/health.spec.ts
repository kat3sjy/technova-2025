import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock mongoose so server.js health route uses the stubbed connection
// Also provide minimal Schema/model so importing models does not throw
vi.mock('mongoose', () => {
	const mockConn = {
		readyState: 1,
		db: {
			databaseName: 'technova',
			admin: () => ({
				ping: async () => ({ ok: 1 }),
			}),
		},
	};

	class Schema {
		constructor(def: any, opts?: any) {
			Object.assign(this, { def, opts });
		}
			index() { /* no-op for tests */ }
	}
		// Provide Types.ObjectId used in schemas
		(Schema as any).Types = { ObjectId: function ObjectId() {} };

	const models: Record<string, any> = {};
	const model = (name: string, _schema: any) => {
		if (!models[name]) {
			// create a minimal mock model with common static methods used in code
			const M = function(this: any, doc: any) { Object.assign(this, doc); } as any;
			M.findById = () => ({ lean: async () => ({ _id: 'x' }) });
			M.findOne = () => ({ select: () => ({}) });
			M.find = () => ({ sort: () => ({ limit: () => ({ lean: async () => [] }) }) });
			M.findByIdAndUpdate = () => ({ lean: async () => ({}) });
			M.findOneAndUpdate = () => ({ lean: async () => ({}) });
			M.prototype.save = async function() { return this; };
			models[name] = M;
		}
		return models[name];
	};

	return {
			default: { connection: mockConn, Schema, model, models, connect: async () => ({ connection: mockConn }) },
		connection: mockConn,
		Schema,
		model,
		models,
	};
});

// Ensure the server sees a Mongo URI so it reports driver/mongoose
process.env.MONGODB_URI = 'mongodb://example.test/technova';
// Import after mocks and env are in place
const { app } = await import('../server.js');

describe('GET /health/db', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('returns ok: true when connected and ping succeeds', async () => {
		const res = await request(app as any).get('/health/db').expect(200);
		expect(res.body).toMatchObject({
			ok: true,
			driver: 'mongoose',
			state: 1,
			db: 'technova',
			ping: 1,
		});
	});
});
