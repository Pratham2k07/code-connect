const WANDBOX_API_URL = '/api/wandbox/compile.json';

// Map file extensions to Wandbox compilers with fallbacks
const EXTENSION_TO_COMPILER = {
  'c':   ['gcc-head-c', 'gcc-13.2.0-c', 'gcc-12.3.0-c'],
  'cpp': ['gcc-head', 'gcc-13.2.0', 'gcc-12.3.0'],
  'cc':  ['gcc-head', 'gcc-13.2.0'],
  'cxx': ['gcc-head', 'gcc-13.2.0'],
  'py':  ['cpython-3.11.4', 'cpython-3.10.4', 'cpython-3.12.7', 'cpython-3.9.7'],
  'js':  ['nodejs-20.17.0', 'nodejs-18.16.0'],
  'ts':  ['typescript-5.6.2', 'typescript-5.2.2'],
  'java':['openjdk-jdk-22+36', 'openjdk-head'],
  'go':  ['go-1.23.2', 'go-1.22.0'],
  'rs':  ['rust-1.82.0', 'rust-1.78.0'],
  'php': ['php-8.3.12', 'php-8.2.24'],
  'rb':  ['ruby-3.4.9', 'ruby-3.3.11'],
  'sh':  ['bash'],
};

export const isPistonSupported = (filename) => {
  if (!filename) return false;
  const ext = filename.split('.').pop().toLowerCase();
  return !!EXTENSION_TO_COMPILER[ext];
};

const tryCompiler = async (compiler, code, stdin) => {
  const response = await fetch(WANDBOX_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler, code, stdin })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Detect OCI/infrastructure errors and throw so we can fallback
  const isInfraError = data.program_error?.includes('OCI runtime') ||
                       data.program_message?.includes('OCI runtime') ||
                       data.compiler_error?.includes('OCI runtime') ||
                       data.status === '' ||
                       (!data.program_output && !data.compiler_error && data.status === '');

  if (isInfraError) {
    throw new Error(`Compiler ${compiler} unavailable (OCI error)`);
  }

  return data;
};

export const executeCode = async (filename, code, stdin = "") => {
  const ext = filename.split('.').pop().toLowerCase();
  const compilers = EXTENSION_TO_COMPILER[ext];

  if (!compilers) {
    throw new Error(`Language not supported for extension .${ext}`);
  }

  let lastError = null;

  // Try each compiler in order until one works
  for (const compiler of compilers) {
    try {
      const data = await tryCompiler(compiler, code, stdin);

      const isCompileError = data.compiler_error && data.compiler_error.trim().length > 0;

      return {
        compile: {
          code: isCompileError ? 1 : 0,
          stderr: data.compiler_error || '',
          output: data.compiler_error || ''
        },
        run: {
          code: parseInt(data.status || '0'),
          output: data.program_message || data.program_output || '',
          stderr: data.program_error || ''
        }
      };
    } catch (err) {
      console.warn(`Compiler ${compiler} failed:`, err.message);
      lastError = err;
      // Continue to next fallback compiler
    }
  }

  // All compilers failed
  throw new Error(`All compilers failed. Last error: ${lastError?.message || 'Unknown error'}`);
};
