import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { authenticate } from '../../test/auth-helper';

const createTicket = async (id: string, title: string, price: number) => {
    const ticket = Ticket.build({ id, title, price });
    await ticket.save();
    return ticket;
}

const createOrder = (cookies: string[], ticketId: string) => {
    return request(app)
        .post('/api/orders')
        .set('Cookie', cookies)
        .send({ ticketId })
        .expect(201);
}

it('returns the list of orders created by a particular user', async () => {
    // Create three tickets
    const ticketOne = await createTicket(mongoose.Types.ObjectId().toHexString(), 'Ticket 1', 10);
    const ticketTwo = await createTicket(mongoose.Types.ObjectId().toHexString(), 'Ticket 2', 20);
    const ticketThree = await createTicket(mongoose.Types.ObjectId().toHexString(), 'Ticket 3', 30);

    const userOne = authenticate();
    const userTwo = authenticate();

    // Create one order as user #1
    await createOrder(userOne, ticketOne.id);

    // Create two orders as user #2
    const { body: orderOne } = await createOrder(userTwo, ticketTwo.id);
    const { body: orderTwo } = await createOrder(userTwo, ticketThree.id);

    // Make request to get orders for user #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    // Make sure we only got the order for user #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
});

