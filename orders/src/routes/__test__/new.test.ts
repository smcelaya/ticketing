import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import { authenticate } from '../../test/auth-helper';

it('returns an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', authenticate())
        .send({ ticketId })
        .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'The ticket',
        price: 20
    });

    await ticket.save();

    const order = Order.build({
        ticket,
        userId: '123456',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });

    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', authenticate())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'The ticket',
        price: 20
    });

    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', authenticate())
        .send({ ticketId: ticket.id })
        .expect(201);

    const orders = await Order.find({});
    expect(orders.length).toEqual(1);
});

it('emits and order created event', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'The ticket',
        price: 20
    });

    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', authenticate())
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});