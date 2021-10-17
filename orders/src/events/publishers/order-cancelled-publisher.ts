import { OrderCancelledEvent, Publisher, Subjects } from "@smctickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}