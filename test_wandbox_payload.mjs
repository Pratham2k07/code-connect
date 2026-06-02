async function runTest() {
  const r = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'openjdk-jdk-22+36',
      codes: [{ file: "MyClass.java", code: 'public class MyClass { public static void main(String[] args) { System.out.println("hello java"); } }' }]
    })
  });
  console.log(await r.json());
}
runTest();
