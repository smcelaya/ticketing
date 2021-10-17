import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import { useRequest } from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    })

    useEffect(() => {
        const getTimeLeft = () => {
            const millisecondsLeft = new Date(order.expiresAt) - new Date();
            setSecondsLeft(Math.round(millisecondsLeft / 1000));
        };

        getTimeLeft();
        const timerId = setInterval(getTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };

    }, []);

    if (secondsLeft < 0) {
        return (
            <div>
                <h1>OrderShow</h1>
                <p>The order has expired</p>
            </div>
        );
    }

    return (
        <div>
            <h1>OrderShow</h1>
            <p>The order will expire in {secondsLeft} seconds</p>

            <StripeCheckout
                token={({ id }) => doRequest({ token: id })}
                stripeKey='pk_test_51JkGFzDRo28TOBW1EQ1ZG8botkp5H4CHG0da22I6seozLU11edBFK8rZ81qI8rVLn9dhoLuJ3tcRVuQ4vTkL9OZd00mfoRDVIY'
                amount={order.amount * 100}
                email={currentUser.email}
            />
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data: order } = await client.get(`/api/orders/${orderId}`);
    return { order };
};

export default OrderShow;