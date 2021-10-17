import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { authenticate } from '../../test/auth-helper';

it('returns a 404 if the ticket is not found', async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    
    await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404);
});

it('returns the ticket if the ticket is not found', async () => {
    const cookies = authenticate();

    const title = 'The ticket';
    const price = 23;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({
            title,
            price
        })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});