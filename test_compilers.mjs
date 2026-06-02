async function runTest(compiler, code) {
  const r = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler, code, stdin: '' })
  });
  console.log(`--- ${compiler} ---`);
  console.log(await r.json());
}

async function run() {
  await runTest('gcc-head', '#include <iostream>\nint main() { std::cout << "hello cpp" << std::endl; return 0; }');
  await runTest('openjdk-jdk-22+36', 'public class Main { public static void main(String[] args) { System.out.println("hello java"); } }');
  await runTest('go-1.23.2', 'package main\nimport "fmt"\nfunc main() { fmt.Println("hello go") }');
}
run();
