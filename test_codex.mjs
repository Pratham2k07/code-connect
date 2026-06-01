async function testCodex() {
  try {
    const response = await fetch('https://api.codex.jaagrav.in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: '#include <stdio.h>\nint main() { printf("Hello from CodeX"); return 0; }',
        language: 'c',
        input: ''
      })
    });
    console.log(response.status, response.statusText);
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
testCodex();
