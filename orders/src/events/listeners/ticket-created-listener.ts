import { Listener, Subjects, TicketCreatedEvent, TicketCreatedEventData } from "@smctickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { QUEUE_GROUP_NAME } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: TicketCreatedEventData, msg: Message): Promise<void> {
        const { id, title, price } = data;

        const ticket = Ticket.build({
            id, title, price
        });

        await ticket.save();
        
        msg.ack();
    }
}