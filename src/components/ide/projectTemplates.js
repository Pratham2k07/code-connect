export const PROJECT_TEMPLATES = {
  react: {
    name: 'React (Web)',
    template: 'react',
    files: {
      '/App.jsx': `import React, { useState } from 'react';\nimport './styles.css';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="container">\n      <h1>React Sandbox</h1>\n      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>\n    </div>\n  );\n}`,
      '/styles.css': `body {\n  background: #0d1117;\n  color: white;\n  font-family: system-ui, sans-serif;\n}\n.container {\n  padding: 2rem;\n  text-align: center;\n}\nbutton {\n  padding: 8px 16px;\n  background: #3b82f6;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}`,
      '/package.json': `{\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  }\n}`
    }
  },
  c: {
    name: 'C Program',
    template: 'vanilla',
    files: {
      '/main.c': `#include <stdio.h>\n\nint main() {\n    printf("Hello, World from C!\\n");\n    return 0;\n}`
    }
  },
  python: {
    name: 'Python Script',
    template: 'vanilla',
    files: {
      '/main.py': `def main():\n    print("Hello from Python!")\n\nif __name__ == "__main__":\n    main()`
    }
  },
  node: {
    name: 'Node.js Backend',
    template: 'node',
    files: {
      '/index.js': `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Hello from Node Backend!');\n});\n\napp.listen(3000, () => {\n  console.log('Server is running on port 3000');\n});`,
      '/package.json': `{\n  "dependencies": {\n    "express": "^4.18.2"\n  }\n}`
    }
  }
};
