import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'Ticket',
        price: 20,
        userId: '12345'
    });

    await ticket.save();

    const firstIntance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstIntance!.set({ price: 25 });
    await firstIntance!.save();

    secondInstance!.set({ price: 30 });
    await expect(secondInstance!.save()).rejects.toThrow();
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Ticket',
        price: 12,
        userId: '12345'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
});