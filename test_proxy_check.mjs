// Using native fetch (Node 18+)

async function test() {
  try {
    const r = await fetch('http://localhost:5173/api/wandbox/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler: 'cpython-3.12.7', code: 'print(42)' })
    });
    const d = await r.json();
    console.log('Proxy Python result:', d.program_output, 'status:', d.status);
  } catch(e) {
    console.error('Proxy Error:', e.message);
  }
}

test();
