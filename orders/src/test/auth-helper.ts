import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const authenticate = () => {
    // Build JWT payload. { id, email }
    const payload = {
        id: mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build the session object. { jwt: JWT}
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return string that contains cookie with the encoded data
    return [`express:sess=${base64}`];
};