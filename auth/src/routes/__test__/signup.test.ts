import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: '123456'
        })
        .expect(201);
});

it('returns a 400 error with an invalid email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test.com',
            password: '123456'
        })
        .expect(400);
});

it('returns a 400 error with an invalid password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: '123'
        })
        .expect(400);
});

it('returns a 400 error when email and password are missing', async () => {
    await request(app)
        .post('/api/users/signup')
        .expect(400);
});

it('disallows duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: '123456'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: '123456'
        })
        .expect(400);
});

it('sets cookie after succesful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: '123456'
        });

        expect(response.get('Set-Cookie')).toBeDefined();
});