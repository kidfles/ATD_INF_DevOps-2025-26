const request = require('supertest');
const app = require('../../app');
const { db, client } = require('../../services/database');

describe('Audit Logs', () => {
    beforeEach(async () => {
        await db.collection('audit-logs').deleteMany({});
    });

    afterAll(async () => {
        client.close();
    });

    it('should return empty array when no logs exist', async () => {
        const res = await request(app).get('/audit-logs');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]);
    });

    it('should create an audit log entry', async () => {
        const entry = { action: 'user.created', data: { name: 'Test User' } };

        const res = await request(app).post('/audit-logs').send(entry);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.action).toEqual('user.created');
        expect(res.body.data).toEqual({ name: 'Test User' });
        expect(res.body).toHaveProperty('timestamp');
    });

    it('should reject POST without action field', async () => {
        const res = await request(app).post('/audit-logs').send({ data: { name: 'Test' } });
        expect(res.statusCode).toEqual(400);
    });

    it('should return all audit logs', async () => {
        await db.collection('audit-logs').insertOne({
            action: 'user.created',
            data: { name: 'John' },
            timestamp: new Date().toISOString()
        });

        const res = await request(app).get('/audit-logs');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].action).toEqual('user.created');
    });

    it('should filter audit logs by action', async () => {
        await db.collection('audit-logs').insertMany([
            { action: 'user.created', data: { name: 'John' }, timestamp: new Date().toISOString() },
            { action: 'user.deleted', data: { name: 'Jane' }, timestamp: new Date().toISOString() }
        ]);

        const res = await request(app).get('/audit-logs?action=user.created');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].action).toEqual('user.created');
    });
});
