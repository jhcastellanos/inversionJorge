const fetch = require('node-fetch');

(async () => {
  console.log('Testing login...');
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'jhcastellanos', password: 'Ruudvan123*' })
  });
  
  console.log('Status:', res.status);
  console.log('Headers:', res.headers.raw()['set-cookie']);
  const data = await res.json();
  console.log('Response:', data);
})();
