import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';
import { authenticate } from '../../test/auth-helper';


it('has a route handler listening to /api/tickets for post request', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.statusCode).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
    const cookie = authenticate();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({});

    expect(response.statusCode).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
    const cookie = authenticate();

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({})
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ price: 10 })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: '', price: 10 })
        .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    const cookie = authenticate();

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({})
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Ticket' })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Ticket', price: -10 })
        .expect(400);
});

it('creates a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const cookies = authenticate();

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({
            title: 'Ticket 1',
            price: 50
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual('Ticket 1');
    expect(tickets[0].price).toEqual(50);
});

it('publishes an event when a ticket is created', async () => {
    const cookies = authenticate();

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookies)
        .send({
            title: 'Ticket 1',
            price: 50
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});