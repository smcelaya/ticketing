import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@smctickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId', 'Ticket Id must be provided').isMongoId()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        // Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }

        // Make sure that this ticket is not already reserved
        const isReserved = await ticket.isReserved();

        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }

        // Calculate the expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        // Build the order and save it to the database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });

        await order.save();

        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            userId: order.userId,
            status: order.status,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: order.ticket.id,
                price: order.ticket.price
            }
        });

        res.status(201).send(order);
    });

export { router as createOrderRouter };