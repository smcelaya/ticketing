import { useRequest } from '../../hooks/use-request';
import Router from 'next/router';

const TicketCreate = ({ ticket }) => {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    });

    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>Price: ${ticket.price}</h4>

            <div className="mt-3">
                {errors}
            </div>

            <button onClick={() => doRequest()} className="btn btn-primary">Purchase</button>
        </div>
    );
};

TicketCreate.getInitialProps = async (context, client) => {
    const { ticketId } = context.query;
    const { data: ticket } = await client.get(`/api/tickets/${ticketId}`);
    return { ticket };
};

export default TicketCreate;