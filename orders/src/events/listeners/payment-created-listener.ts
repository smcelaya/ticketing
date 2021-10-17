import { Listener, PaymentCreatedEvent, PaymentCreatedEventData, Subjects } from '@smctickets/common';
import { Message } from 'node-nats-streaming';
import { Order, OrderStatus } from '../../models/order';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: PaymentCreatedEventData, msg: Message): Promise<void> {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        msg.ack();
    }
}