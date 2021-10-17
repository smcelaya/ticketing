import { OrderCreatedEventData, OrderStatus } from "@smctickets/common";
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEventData = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: '',
        status: OrderStatus.Created,
        ticket: {
            id: mongoose.Types.ObjectId().toHexString(),
            price: 30
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('replicates the order data when an OrderCreated event is received', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order).toBeDefined();
    expect(order!.id).toEqual(data.id);
    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});