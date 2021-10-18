import axios from 'axios';

export const buildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // We are on the server
        return axios.create({
            baseURL: 'http://www.smcelaya.com',
            headers: req.headers
        });
    } else {
        // we must be on the browser
        return axios.create();
    }
};