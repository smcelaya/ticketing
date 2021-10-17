import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@smctickets/common';

import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
    '/api/tickets/:id',
    [
        requireAuth,
        param('id', 'Must be a valid id').isMongoId(),
        body('title', 'Title is required').notEmpty(),
        body('price', 'Price must be greater than 0').isFloat({ gt: 0 }),
        validateRequest
    ],
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);
        const { title, price } = req.body;

        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.userId !== req.currentUser?.id) {
            throw new NotAuthorizedError();
        }

        if (ticket.orderId) {
            throw new BadRequestError('Cannot edit a reserved ticket');
        }

        ticket.set({
            title,
            price
        });

        await ticket.save();

        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        });

        res.send(ticket);
    }
);

export { router as updateTicketRouter };