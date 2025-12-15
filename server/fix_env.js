const fs = require('fs');
const path = require('path');

const content = `PORT=5000
MONGO_URI=mongodb+srv://admin:tecquestion2025@cluster0.1ykf3wo.mongodb.net/?appName=Cluster0
JWT_SECRET=supersecret_dev_key_12345
STUDENT_ACCESS_CODE=TecQuestion2024
`;

fs.writeFileSync(path.join(__dirname, '.env'), content, { encoding: 'utf8' });
console.log('.env fixed with UTF-8');
