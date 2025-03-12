// export const KEYCHAIN_LOCALSTORAGE_KEY = 'keychain';
// 
// export function getKeychain() {
//   const storedKeychain = localStorage.getItem(KEYCHAIN_LOCALSTORAGE_KEY);
//   let keychain = {};
//   if (storedKeychain) {
//     try {
//       keychain = JSON.parse(storedKeychain);
//     } catch (err) {
//       console.log("Couldn't parse stored keychain", err);
//     }
//   }
//   return keychain;
// }
// 
// export function hasAccounts() {
//   const keychain = getKeychain();
//   return Object.keys(keychain).length !== 0;
// }
// 
// export function addToKeychain(username, encryptedPassword) {
//   const keychain = getKeychain();
//   keychain[username] = encryptedPassword;
//   localStorage.setItem(KEYCHAIN_LOCALSTORAGE_KEY, JSON.stringify(keychain));
// }
// 
// export function removeFromKeychain(username) {
//   const keychain = getKeychain();
//   delete keychain[username];
//   localStorage.setItem(KEYCHAIN_LOCALSTORAGE_KEY, JSON.stringify(keychain));
// }

// src/helpers/keychain.js
const axios = require('axios').defaults;

const DATA_PATH = '/db';

export async function getKeychain() {
  try {
    const response = await axios.get(`${DATA_PATH}/getAllUsers`);
    const users = {};
    response.data.users.forEach(user => {
      users[user.username] = user.encrypted_password;
    });
    return users;
  } catch (error) {
    console.error('Error get all accounts:', error);
    return false;
  }
}

export async function hasAccounts() {
  try {
      const users = await getKeychain();
      return users.length !== 0;
  } catch (error) {
      console.error('Error checking for accounts:', error);
      return false;
  }
}

export async function addToKeychain(username, encryptedPassword) {
  try {
      await axios.post(`${DATA_PATH}/addUser`, {
          username,
          encryptedPassword
      });
      console.log('User added to keychain');
  } catch (error) {
      console.error('Error adding user to keychain:', error);
  }
}

export async function removeFromKeychain(username) {
  try {
    await axios.delete(`${DATA_PATH}/removeUser/${username}`);
    console.log('User removed from keychain');
  } catch (error) {
      console.error('Error removing user from keychain:', error);
  }
}