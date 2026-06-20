export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-me',
    expiresIn: '7d',
};
