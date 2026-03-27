const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'cyy123',
      password: '...',
    });
    console.log('Login successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Login 500 error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.log('Request error:', error.message);
    }
  }
}

// Wait, I can't easily run localhost from here.
// I'll run the logic in a local script instead.
