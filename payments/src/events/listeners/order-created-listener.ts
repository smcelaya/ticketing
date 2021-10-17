import { Listener, OrderCreatedEvent, OrderCreatedEventData, Subjects } from '@smctickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCreatedEventData, msg: Message): Promise<void> {
        const order = Order.build({
            id: data.id,
            version: data.version,
            userId: data.userId,
            price: data.ticket.price,
            status: data.status
        });

        await order.save();

        msg.ack();
    }

}