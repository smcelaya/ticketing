import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { authenticate } from '../../test/auth-helper';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the ticket does not exist', async () => {
    const id = mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', authenticate())
        .send({
            title: 'Ticket updated',
            price: 20
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'Ticket updated',
            price: 20
        })
        .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
    const createTicketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', authenticate())
        .send({ title: 'Ticket', price: 30 })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${createTicketResponse.body.id}`)
        .set('Cookie', authenticate())
        .send({ title: 'Ticket updated', price: 35 })
        .expect(401);
});

it('returns a 400  if the user provides an invalid title or price', async () => {
    const cookies = authenticate();

    const createTicketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({ title: 'Ticket', price: 30 })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${createTicketResponse.body.id}`)
        .set('Cookie', cookies)
        .send({ title: '', price: 20 })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${createTicketResponse.body.id}`)
        .set('Cookie', cookies)
        .send({ title: 'Ticket updated', price: -20 })
        .expect(400);
});

it('updates the ticket when valid inputs are provided', async () => {
    const cookies = authenticate();

    const createTicketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({ title: 'Ticket', price: 30 })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${createTicketResponse.body.id}`)
        .set('Cookie', cookies)
        .send({ title: 'Ticket updated', price: 20 })
        .expect(200);

    const response = await request(app)
        .get(`/api/tickets/${createTicketResponse.body.id}`)
        .expect(200);

    expect(response.body.title).toEqual('Ticket updated');
    expect(response.body.price).toEqual(20);
});

it('publishes an event when a ticket is updated', async () => {
    const cookies = authenticate();

    const createTicketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({ title: 'Ticket', price: 30 })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${createTicketResponse.body.id}`)
        .set('Cookie', cookies)
        .send({ title: 'Ticket updated', price: 20 })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects an update if the ticket is reserved', async () => {
    const cookies = authenticate();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({ title: 'Ticket', price: 30 })
        .expect(201);

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
    await ticket?.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookies)
        .send({ title: 'Ticket updated', price: 20 })
        .expect(400);
});