import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@smctickets/common';

import { Password } from '../services/password';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signin',
    [
        body('email', 'Email is not valid').isEmail(),
        body('password', 'Password is required').notEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordsMatch = await Password.compare(existingUser.password, password);

        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!);

        req.session = {
            jwt: userJwt
        };

        res.send(existingUser);
    });

export { router as signinRouter };