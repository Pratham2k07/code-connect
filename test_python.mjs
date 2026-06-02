async function run() {
  const r = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler: 'cpython-3.12.7', code: 'print("hello python 3.12")', stdin: '' })
  });
  console.log(await r.json());
}
run();
