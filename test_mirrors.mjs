async function testEndpoints() {
  const endpoints = [
    'https://piston.pterodactyl.io/api/v2/execute',
    'https://piston.valour.gg/api/v2/execute',
    'https://emkc.org/api/v2/piston/execute'
  ];

  for (const ep of endpoints) {
    try {
      console.log('Testing', ep);
      const response = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error('Failed', ep, err.message);
    }
  }
}
testEndpoints();
