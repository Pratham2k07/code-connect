async function testWandbox() {
  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: 'gcc-head',
        code: '#include <stdio.h>\nint main() { printf("Hello Wandbox"); return 0; }',
        stdin: ''
      })
    });
    console.log(response.status, response.statusText);
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
testWandbox();
