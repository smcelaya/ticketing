import { Listener, OrderCreatedEvent, OrderCreatedEventData, Subjects } from "@smctickets/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { QUEUE_GROUP_NAME } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCreatedEventData, msg: Message): Promise<void> {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log(`Waiting ${delay} miliseconds to process the event`);

        await expirationQueue.add({
            orderId: data.id
        }, {
            delay
        });

        msg.ack();
    }
}