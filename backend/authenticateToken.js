const jwt = require('jsonwebtoken');
const secretKey = 'super_secret_key_for_TIC2601!';

const authenticateToken = (req, res, next) => {
    console.log('authenticateToken middleware is running.');
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.log('Invalid or expired token');
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user;
        console.log('Token verified, user:', user);
        next();
    });
};

module.exports = authenticateToken;
