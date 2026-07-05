import bcrypt from 'bcrypt';

const password = process.argv[2];
if (!password) {
  console.log('Usage: node generate-hash.js <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(`\nPassword: ${password}`);
console.log(`Hash:     ${hash}`);
console.log(`\nAdd to .env:\nADMIN_HASH=${hash}\n`);
