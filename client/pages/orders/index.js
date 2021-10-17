
const OrderIndex = ({ orders }) => {
    return (
        <div>
            <h1>My Orders</h1>

            <ul>
                {
                    orders.map(order => (
                        <li key={order.id}>{order.ticket.title} (${order.ticket.price}) - {order.status}</li>
                    ))
                }
            </ul>
        </div>
    );
};

OrderIndex.getInitialProps = async (context, client) => {
    const { data: orders } = await client.get('/api/orders');
    return orders;
}

export default OrderIndex;