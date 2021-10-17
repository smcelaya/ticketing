import { Listener, OrderCancelledEvent, OrderCancelledEventData, OrderStatus, Subjects } from '@smctickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCancelledEventData, msg: Message): Promise<void> {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    }
}