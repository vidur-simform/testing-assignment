const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
        return;
    }
    const { email, name, password } = req.body;
    try {
        const hashedPw = await bcrypt.hash(password, 12);
        const createdUser = await User.create({ email: email, password: hashedPw, name: name });
        res.status(201).json({ message: 'User created!', userId: createdUser._id });
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
};

exports.signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            next(error);
            return;
        }
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            next(error);
            return;
        }
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            'somesecret',
            { expiresIn: '10h' }
        );
        res.status(200).json({ token: token, userId: user._id.toString() });
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
};