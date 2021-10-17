import request from 'supertest';
import { app } from '../../app';
import { authenticate } from '../../test/auth-helper';

it('should return details from the current user', async () => {
    const cookie = await authenticate('test@test.com', '123456');

    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .expect(400);

    expect(response.body.currentUser).not.toBeNull();
    expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null when user is not authenticated', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .expect(200);

    expect(response.body.currentUser).toBeNull();
});