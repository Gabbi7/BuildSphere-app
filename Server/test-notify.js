const http = require('http');

// EDIT THESE TO CHANGE YOUR MESSAGE
const title = "Hello from BuildSphere!";
const message = "Hi Let's go Team Devign 🚀";

const data = JSON.stringify({
  user_id: 1,
  title: title,
  message: message
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/notifications/test',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

console.log('🚀 Sending test notification to User ID: 1...');

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('✅ Server Response:', responseData);
    console.log('\nCheck your phone now!');
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end();
