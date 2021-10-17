import { Subjects } from "./subjects";

export interface TicketCreatedEvent {
    subject: Subjects.TicketCreated;
    data: TicketCreatedEventData
}

export type TicketCreatedEventData = {
    id: string;
    title: string;
    price: number;
};