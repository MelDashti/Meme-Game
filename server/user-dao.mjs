import db from './db.mjs';
import crypto from 'crypto';

export const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = {id: row.id, username: row.email, name: row.name};
        
        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err);
          
          const storedPasswordBuffer = Buffer.from(row.password, 'hex');
          console.log('Stored Password Buffer Length:', storedPasswordBuffer.length);
          console.log('Hashed Password Length:', hashedPassword.length);

          if (storedPasswordBuffer.length !== hashedPassword.length) {
            console.error('Hash length mismatch:', storedPasswordBuffer.length, hashedPassword.length);
            return reject(new Error('Hash length mismatch'));
          }

          if(!crypto.timingSafeEqual(storedPasswordBuffer, hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve({error: 'User not found!'}); 
      }
      else {
        const user = {id: row.id, username: row.email, name: row.name};
        resolve(user);
      }
    });
  });
};

export default {
  getUser,
  getUserById,
};