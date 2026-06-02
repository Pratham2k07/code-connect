// Using native fetch (Node 18+)

async function test() {
  try {
    const r = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler: 'cpython-3.12.7', code: 'print(42)' })
    });
    const d = await r.json();
    console.log('Python result:', JSON.stringify(d));
  } catch(e) {
    console.error('Error:', e.message);
  }

  try {
    const r2 = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler: 'gcc-head', code: '#include<stdio.h>\nint main(){printf("hello");return 0;}' })
    });
    const d2 = await r2.json();
    console.log('C result:', JSON.stringify(d2));
  } catch(e) {
    console.error('C Error:', e.message);
  }
}

test();
