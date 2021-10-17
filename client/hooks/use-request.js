import { useState } from 'react';
import axios from 'axios';

export const useRequest = ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            const response = await axios[method](url, { ...body, ...props });

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (err) {
            setErrors(formatErrors(err.response.data.errors));
        }
    };

    const formatErrors = (errors) => {
        return (
            <div className="alert alert-danger">
                <h4>Ooops!</h4>
                <ul className="my-0">
                    {
                        errors.map(err => (
                            <li key={err.message}>{err.message}</li>
                        ))
                    }
                </ul>
            </div>
        );
    }

    return {
        doRequest,
        errors
    };
};