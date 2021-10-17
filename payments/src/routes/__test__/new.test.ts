import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';
import { authenticate } from '../../test/auth-helper';

jest.mock('../../stripe');

it('returns a 401 if the user is not authorized', async () => {
    await request(app)
        .post('/api/payments')
        .expect(401);
});

it('returns a 404 if the order does not exist', async () => {
    const cookies = authenticate();
    const orderId = mongoose.Types.ObjectId().toHexString();

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookies)
        .send({ token: '123456', orderId })
        .expect(404);
});

it('returns a 401 if the order does not belong to the user', async () => {
    const order = await createOrder();
    const cookies = authenticate();

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookies)
        .send({ token: '123456', orderId: order.id })
        .expect(401);
});

it('returns a 400 if the order is cancelled', async () => {
    const order = await createOrder();
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    const cookies = authenticate(order.userId);

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookies)
        .send({ token: '123456', orderId: order.id })
        .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const order = await createOrder();
    const cookies = authenticate(order.userId);

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookies)
        .send({ token: 'tok_visa', orderId: order.id })
        .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.currency).toEqual('usd');
    expect(chargeOptions.amount).toEqual(order.price * 100);
    expect(chargeOptions.source).toEqual('tok_visa');
});

const createOrder = async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        price: 20
    });
    await order.save();
    return order;
}

