import request from 'supertest';
import { app } from '../../app';

it('fails when an email that does not exist is supplied', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'smercado@test.com',
            password: '123456'
        })
        .expect(400);
});

it('fails when a wrong password is provided', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({ email: 'test@test.com', password: '123456' })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: '1234567'
        })
        .expect(400);
});

it('responds with a cookie when valid credentials are supplied', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({ email: 'test@test.com', password: '123456' })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: '123456'
        })
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});