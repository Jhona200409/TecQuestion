const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const content = `PORT=5000
MONGO_URI=mongodb+srv://admin:1234@cluster0.1ykf3wo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=supersecret_dev_key_12345`;

fs.writeFileSync(envPath, content, { encoding: 'utf8' });
console.log('.env created with UTF-8');
