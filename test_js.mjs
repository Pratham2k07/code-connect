async function run() {
  const r = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler: 'nodejs-20.17.0', code: 'console.log("hello js")', stdin: '' })
  });
  console.log(await r.json());
}
run();
