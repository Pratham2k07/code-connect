const fetch = require('node-fetch'); // or just use built-in fetch in Node 18+

async function testPiston() {
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: 'c',
        version: '*',
        files: [{ name: 'main.c', content: '#include <stdio.h>\nint main() { printf("Hello"); return 0; }' }]
      })
    });
    console.log(response.status, response.statusText);
    const data = await response.text();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
testPiston();
