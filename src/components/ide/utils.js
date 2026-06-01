import { 
  FileCode2, FileJson, FileText, Code, Binary, Hexagon, Coffee, 
  TerminalSquare, Hash, AlignLeft, Globe, FileDiff, Box, Layers, Settings, Brackets 
} from 'lucide-react';

export const getLanguageFromExtension = (filename) => {
  if (!filename) return 'javascript';
  const ext = filename.split('.').pop().toLowerCase();
  
  const map = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'c': 'c',
    'cpp': 'cpp',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'sql': 'sql',
    'sh': 'shell'
  };
  return map[ext] || 'plaintext';
};

export const getFileIcon = (filename) => {
  if (!filename) return FileText;
  const ext = filename.split('.').pop().toLowerCase();
  
  switch(ext) {
    case 'js':
    case 'jsx':
      return FileCode2;
    case 'ts':
    case 'tsx':
      return Brackets;
    case 'html':
      return Globe;
    case 'css':
      return Hash;
    case 'json':
      return FileJson;
    case 'md':
      return AlignLeft;
    case 'c':
    case 'cpp':
      return Binary;
    case 'py':
      return TerminalSquare;
    case 'java':
      return Coffee;
    case 'go':
      return Hexagon;
    case 'rs':
      return Box;
    case 'sql':
      return Layers;
    case 'env':
      return Settings;
    default:
      return FileText;
  }
};

export const getExecutionCommand = (filename, ext) => {
  const name = filename.startsWith('/') ? filename.substring(1) : filename;
  const base = name.replace(/\.[^/.]+$/, "");
  switch (ext) {
    case 'c': return `gcc ${name} -o ${base} && ./${base}`;
    case 'cpp': return `g++ ${name} -o ${base} && ./${base}`;
    case 'py': return `python ${name}`;
    case 'java': return `javac ${name} && java ${base}`;
    case 'go': return `go run ${name}`;
    case 'rs': return `rustc ${name} && ./${base}`;
    case 'php': return `php ${name}`;
    case 'sh': return `bash ${name}`;
    default: return `node ${name}`;
  }
};
