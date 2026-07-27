import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

async function runTest() {
  try {
    // Register and login to get JWT cookie
    const authRes = await axios.post('http://localhost:3000/api/v1/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      age: 30,
      gender: 'Male'
    });

    const verifyRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123',
      totpCode: '123456' // It bypasses or accepts anything?
    });

    const cookies = verifyRes.headers['set-cookie'];

    // Upload a mock file
    fs.writeFileSync('mock_report.pdf', 'MOCK PDF CONTENT');
    const form = new FormData();
    form.append('medicalReport', fs.createReadStream('mock_report.pdf'));
    form.append('reportType', 'Lab Diagnostic Report');

    console.log('Sending upload request...');
    const uploadRes = await axios.post('http://localhost:3000/api/v1/reports/upload', form, {
      headers: {
        ...form.getHeaders(),
        Cookie: cookies ? cookies.join(';') : ''
      }
    });

    console.log('Upload success:', uploadRes.data);
  } catch (err: any) {
    console.error('Upload test failed:', err.response?.data || err.message);
    if (err.response?.status === 500) {
      console.log('Check backend logs.txt for full error trace.');
    }
  }
}

runTest();
