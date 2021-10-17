import { OrderCancelledEventData } from '@smctickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from '../../../nats-wrapper';
import { Order, OrderStatus } from "../../../models/order";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        price: 30
    });
    await order.save();

    const data: OrderCancelledEventData = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: mongoose.Types.ObjectId().toHexString(),
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, order, data, msg };
};

it('updates the status of the order', async () => {
    const { listener, order, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('throws an error if the order does not exist', async () => {
    const { listener, data, msg } = await setup();
    data.id = mongoose.Types.ObjectId().toHexString();
    await expect(listener.onMessage(data, msg)).rejects.toThrow();
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});
