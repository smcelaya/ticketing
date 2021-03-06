import Link from 'next/link';

const Index = ({ currentUser, tickets }) => {
    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        tickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td>{ticket.title}</td>
                                <td>{ticket.price}</td>
                                <td>
                                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                                        <a>View</a>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
};

Index.getInitialProps = async (context, client) => {
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
};

export default Index;