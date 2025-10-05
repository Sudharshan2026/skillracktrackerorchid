// Simple test script to verify the API function
const handler = require('./parse-profile.ts').default;

// Mock request and response objects
const mockReq = {
  method: 'POST',
  body: {
    url: 'https://skillrack.com/profile/123/abc123'
  },
  headers: {},
  connection: { remoteAddress: '127.0.0.1' }
};

const mockRes = {
  headers: {},
  statusCode: 200,
  setHeader: function(key, value) {
    this.headers[key] = value;
  },
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('Response Status:', this.statusCode);
    console.log('Response Data:', JSON.stringify(data, null, 2));
  },
  end: function() {
    console.log('Response ended');
  }
};

console.log('Testing API function with mock data...');
handler(mockReq, mockRes).catch(console.error);