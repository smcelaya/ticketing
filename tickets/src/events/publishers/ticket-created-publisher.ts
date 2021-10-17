import { Publisher, Subjects, TicketCreatedEvent } from "@smctickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}