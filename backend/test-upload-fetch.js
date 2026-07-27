const fs = require('fs');

async function run() {
  try {
    // 1. Register a user
    let res = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@test.com',
        password: 'password123',
        age: 30,
        gender: 'Male'
      })
    });
    console.log('Register status:', res.status);
    let data = await res.json();
    console.log('Register data:', data);

    // 2. Login to get cookie
    res = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'password123',
        totpCode: '123456'
      })
    });
    console.log('Login status:', res.status);
    let loginData = await res.json();
    console.log('Login data:', loginData);
    const cookies = res.headers.get('set-cookie');

    // 3. Upload file
    fs.writeFileSync('test.pdf', 'dummy content');
    const blob = new Blob([fs.readFileSync('test.pdf')]);
    const formData = new FormData();
    formData.append('medicalReport', blob, 'test.pdf');
    formData.append('reportType', 'Lab Diagnostic Report');

    console.log('Uploading...');
    res = await fetch('http://localhost:5000/api/v1/reports/upload', {
      method: 'POST',
      headers: {
        'Cookie': cookies || ''
      },
      body: formData
    });
    console.log('Upload status:', res.status);
    console.log('Upload response:', await res.text());
  } catch (err) {
    console.error('Script error:', err);
  }
}
run();
