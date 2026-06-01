const WANDBOX_API_URL = 'https://wandbox.org/api/compile.json';

// Map file extensions to Wandbox compilers
const EXTENSION_TO_COMPILER = {
  'c': 'gcc-head-c',
  'cpp': 'gcc-head',
  'cc': 'gcc-head',
  'cxx': 'gcc-head',
  'py': 'cpython-head',
  'js': 'nodejs-20.17.0',
  'ts': 'typescript-5.6.2',
  'java': 'openjdk-jdk-22+36',
  'go': 'go-1.23.2',
  'rs': 'rust-1.82.0',
  'php': 'php-8.3.12',
  'rb': 'ruby-4.0.2',
  'sh': 'bash'
};

export const isPistonSupported = (filename) => {
  if (!filename) return false;
  const ext = filename.split('.').pop().toLowerCase();
  return !!EXTENSION_TO_COMPILER[ext];
};

export const executeCode = async (filename, code, stdin = "") => {
  const ext = filename.split('.').pop().toLowerCase();
  const compiler = EXTENSION_TO_COMPILER[ext];

  if (!compiler) {
    throw new Error(`Language not supported for extension .${ext}`);
  }

  const payload = {
    compiler: compiler,
    code: code,
    stdin: stdin
  };

  try {
    const response = await fetch(WANDBOX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Execution engine error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map Wandbox format to our existing Piston-like format so IDEMenuBar doesn't break
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
  } catch (error) {
    console.error("Execution error:", error);
    throw error;
  }
};
