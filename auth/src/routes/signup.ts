import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@smctickets/common';

import { User } from '../models/user';

const router = express.Router();

router.post(
    '/api/users/signup',
    [
        body('email', 'Email is not valid').isEmail(),
        body('password', 'Password must be between 4 and 20 characters').isLength({ min: 4, max: 20 })
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new BadRequestError('Email in use');
        }

        const user = User.build({ email, password });
        await user.save();

        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY!);

        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);
    });

export { router as signupRouter };