// Netlify Function wrapper for Redux Brain API
const handler = require('../../.next/server/pages/api/redux-brain.js');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);

    // Create a mock Next.js request/response
    const req = {
      method: 'POST',
      body: body,
      headers: event.headers
    };

    const res = {
      status: (code) => ({
        json: (data) => ({
          statusCode: code,
          body: JSON.stringify(data)
        })
      }),
      json: (data) => ({
        statusCode: 200,
        body: JSON.stringify(data)
      })
    };

    // Call the Next.js API handler
    const result = await handler(req, res);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: result.body || JSON.stringify({ error: 'No response from handler' })
    };
  } catch (error) {
    console.error('Netlify Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};