import { PaymentCreatedEvent, Publisher, Subjects } from '@smctickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}