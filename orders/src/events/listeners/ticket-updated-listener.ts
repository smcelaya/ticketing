import { Listener, Subjects, TicketUpdatedEventData, TicketUpdatedEvent } from "@smctickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { QUEUE_GROUP_NAME } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: TicketUpdatedEventData, msg: Message): Promise<void> {
        const ticket = await Ticket.findPreviousVersion(data);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        const { title, price } = data;

        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}