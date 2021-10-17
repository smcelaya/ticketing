import { Publisher, Subjects, TicketUpdatedEvent } from "@smctickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}