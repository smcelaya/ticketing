import { ExpirationCompleteEvent, Publisher, Subjects } from "@smctickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}