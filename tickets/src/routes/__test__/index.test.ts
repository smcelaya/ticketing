import request from 'supertest';
import { app } from '../../app';
import { authenticate } from '../../test/auth-helper';

const createTicket = () => {
    const cookies = authenticate();

    return request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({
            title: 'the ticket',
            price: 20
        });
}

it('can retrieve the list of tickets', async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const response = await request(app)
        .get('/api/tickets')
        .expect(200);

    expect(response.body.length).toEqual(3);
});