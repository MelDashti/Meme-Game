import crypto from 'crypto';
import db from './db.mjs';

const generateUserData = (id, username, password, email) => {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');

        crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
            if (err) {
                reject(err);
                return;
            }

            resolve({
                id,
                username,
                email,
                salt,
                hashedPassword: hashedPassword.toString('hex')
            });
        });
    });
};

const insertUser = (user) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO Users (id, username, password, email, salt) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [user.id, user.username, user.hashedPassword, user.email, user.salt], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const createAndInsertUsers = async () => {
    try {
        const user1 = await generateUserData(1, 'user1', 'password1', 'user1@example.com');
        const user2 = await generateUserData(2, 'user2', 'password2', 'user2@example.com');

        await insertUser(user1);
        await insertUser(user2);

        console.log('Users inserted successfully');
    } catch (err) {
        console.error('Error inserting users:', err);
    }
};

createAndInsertUsers();