import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { authenticate } from '../../test/auth-helper';

it('returns an error if the order does not exist', async () => {
    const orderId = mongoose.Types.ObjectId().toHexString();

    await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Cookie', authenticate())
        .expect(404);
});

it('returns an error if the order does not belong to the user', async () => {
    const ticket = Ticket.build({ id: mongoose.Types.ObjectId().toHexString(), title: 'Ticket', price: 15 });
    await ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', authenticate())
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', authenticate())
        .expect(401);
});

it('returns the found order', async () => {
    const ticket = Ticket.build({ id: mongoose.Types.ObjectId().toHexString(), title: 'Ticket', price: 15 });
    await ticket.save();

    const cookies = authenticate();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookies)
        .send({ ticketId: ticket.id })
        .expect(201);

    const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', cookies)
        .expect(200);

    expect(response.body.id).toEqual(order.id);
    expect(response.body.ticket.id).toEqual(order.ticket.id);
});