import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { Subjects } from './subjects';

import { TicketCreatedEvent, TicketCreatedEventData } from './ticket-created-event';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = 'payments-service';

    onMessage(data: TicketCreatedEventData, msg: Message): void {
        console.log('Event data!', data);

        msg.ack();
    }
}