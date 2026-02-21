// custom-ai-code-generator.js
// A self-contained AI code generator with pattern matching and templates

class CustomCodeAI {
  constructor() {
    this.languages = ['javascript', 'python', 'html', 'css', 'java', 'c++'];
    this.patterns = this.initializePatterns();
    this.learnedPatterns = new Map(); // For "learning" new patterns
  }

  initializePatterns() {
    return {
      // Function patterns
      function: {
        javascript: (name, params) => 
          `function ${name}(${params.join(', ')}) {\n  // TODO: Implement\n  return null;\n}`,
        python: (name, params) => 
          `def ${name}(${params.join(', ')}):\n    # TODO: Implement\n    pass`,
        java: (name, params) => 
          `public static void ${name}(${this.formatJavaParams(params)}) {\n    // TODO: Implement\n}`,
        cpp: (name, params) => 
          `void ${name}(${this.formatCppParams(params)}) {\n    // TODO: Implement\n}`,
      },

      // Loop patterns
      loop: {
        javascript: (type, count) => {
          if (type === 'for') 
            return `for (let i = 0; i < ${count}; i++) {\n  // Loop body\n}`;
          return `while (condition) {\n  // Loop body\n}`;
        },
        python: (type, count) => {
          if (type === 'for') 
            return `for i in range(${count}):\n    # Loop body\n    pass`;
          return `while condition:\n    # Loop body\n    pass`;
        }
      },

      // Class patterns
      class: {
        javascript: (className, methods) => {
          let code = `class ${className} {\n  constructor() {\n    // Initialize properties\n  }\n\n`;
          methods.forEach(m => {
            code += `  ${m}() {\n    // TODO: Implement ${m}\n  }\n\n`;
          });
          return code + '}';
        },
        python: (className, methods) => {
          let code = `class ${className}:\n    def __init__(self):\n        # Initialize properties\n        pass\n\n`;
          methods.forEach(m => {
            code += `    def ${m}(self):\n        # TODO: Implement ${m}\n        pass\n\n`;
          });
          return code;
        }
      },

      // Array operations
      array: {
        javascript: (operation, items) => {
          const arr = JSON.stringify(items);
          switch(operation) {
            case 'map': return `${arr}.map(item => {\n  // Transform item\n  return item;\n})`;
            case 'filter': return `${arr}.filter(item => {\n  // Filter condition\n  return true;\n})`;
            case 'reduce': return `${arr}.reduce((acc, curr) => {\n  // Accumulate\n  return acc;\n}, initialValue)`;
            default: return `const array = ${arr};`;
          }
        },
        python: (operation, items) => {
          const arr = str(items);
          switch(operation) {
            case 'map': return `[func(x) for x in ${arr}]`;
            case 'filter': return `[x for x in ${arr} if condition]`;
            default: return `${arr}`;
          }
        }
      },

      // HTTP request patterns
      http: {
        javascript: (method, url) => {
          if (method === 'fetch') {
            return `fetch('${url}')\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`;
          }
          return `// HTTP ${method} request to ${url}`;
        },
        python: (method, url) => {
          return `import requests\n\nresponse = requests.${method}('${url}')\ndata = response.json()\nprint(data)`;
        }
      }
    };
  }

  // Parse natural language prompt
  parsePrompt(prompt) {
    prompt = prompt.toLowerCase();
    
    // Detect language
    let language = 'javascript'; // default
    for (const lang of this.languages) {
      if (prompt.includes(lang)) {
        language = lang;
        break;
      }
    }

    // Detect code type
    const codeType = this.detectCodeType(prompt);
    
    // Extract parameters
    const params = this.extractParameters(prompt);
    
    return { language, codeType, params, originalPrompt: prompt };
  }

  detectCodeType(prompt) {
    if (prompt.includes('function') || prompt.includes('method')) return 'function';
    if (prompt.includes('class') || prompt.includes('object')) return 'class';
    if (prompt.includes('loop') || prompt.includes('iterate')) return 'loop';
    if (prompt.includes('array') || prompt.includes('list')) return 'array';
    if (prompt.includes('http') || prompt.includes('api') || prompt.includes('request')) return 'http';
    if (prompt.includes('html') || prompt.includes('page')) return 'html';
    if (prompt.includes('sort') || prompt.includes('algorithm')) return 'algorithm';
    return 'general';
  }

  extractParameters(prompt) {
    const params = {
      name: this.extractName(prompt),
      count: this.extractNumber(prompt) || 10,
      items: this.extractItems(prompt) || [1, 2, 3, 4, 5],
      methods: this.extractMethods(prompt) || ['method1', 'method2'],
      url: this.extractUrl(prompt) || 'https://api.example.com/data',
      operation: this.extractOperation(prompt) || 'basic'
    };
    return params;
  }

  extractName(prompt) {
    const words = prompt.split(' ');
    const nameIndex = words.findIndex(w => w === 'called' || w === 'named');
    if (nameIndex !== -1 && words[nameIndex + 1]) {
      return words[nameIndex + 1].replace(/[^a-zA-Z]/g, '');
    }
    return 'myFunction';
  }

  extractNumber(prompt) {
    const match = prompt.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  extractItems(prompt) {
    // Simple item extraction - in real AI, this would be more sophisticated
    if (prompt.includes('numbers')) return [5, 2, 8, 1, 9];
    if (prompt.includes('strings')) return ['apple', 'banana', 'cherry'];
    return null;
  }

  extractMethods(prompt) {
    // Extract method names from phrases like "with methods x, y, z"
    const methodsMatch = prompt.match(/methods?\s+(\w+(?:,\s*\w+)*)/);
    if (methodsMatch) {
      return methodsMatch[1].split(',').map(m => m.trim());
    }
    return null;
  }

  extractUrl(prompt) {
    const urlMatch = prompt.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
  }

  extractOperation(prompt) {
    const operations = ['map', 'filter', 'reduce', 'sort', 'reverse'];
    for (const op of operations) {
      if (prompt.includes(op)) return op;
    }
    return null;
  }

  // Main code generation method
  generateCode(prompt) {
    const parsed = this.parsePrompt(prompt);
    let code = '';

    try {
      // Check if we have a learned pattern for this prompt
      if (this.learnedPatterns.has(parsed.originalPrompt)) {
        return this.learnedPatterns.get(parsed.originalPrompt);
      }

      // Generate based on detected type
      switch(parsed.codeType) {
        case 'function':
          code = this.generateFunction(parsed);
          break;
        case 'class':
          code = this.generateClass(parsed);
          break;
        case 'loop':
          code = this.generateLoop(parsed);
          break;
        case 'array':
          code = this.generateArray(parsed);
          break;
        case 'http':
          code = this.generateHTTP(parsed);
          break;
        case 'html':
          code = this.generateHTML(parsed);
          break;
        case 'algorithm':
          code = this.generateAlgorithm(parsed);
          break;
        default:
          code = this.generateGeneral(parsed);
      }

      // Add comments and formatting
      code = this.formatCode(code, parsed.language);
      
      return code;
    } catch (error) {
      return `// Error generating code: ${error.message}\n// Please try a different prompt`;
    }
  }

  generateFunction(parsed) {
    const { language, params } = parsed;
    const name = params.name;
    const funcParams = this.inferParameters(params) || ['param1', 'param2'];
    
    if (this.patterns.function[language]) {
      return this.patterns.function[language](name, funcParams);
    }
    
    // Fallback to JavaScript
    return this.patterns.function.javascript(name, funcParams);
  }

  generateClass(parsed) {
    const { language, params } = parsed;
    const className = params.name.charAt(0).toUpperCase() + params.name.slice(1);
    const methods = params.methods || ['method1', 'method2'];
    
    if (this.patterns.class[language]) {
      return this.patterns.class[language](className, methods);
    }
    
    return this.patterns.class.javascript(className, methods);
  }

  generateLoop(parsed) {
    const { language, params } = parsed;
    const loopType = params.operation === 'while' ? 'while' : 'for';
    const count = params.count || 5;
    
    if (this.patterns.loop[language]) {
      return this.patterns.loop[language](loopType, count);
    }
    
    return this.patterns.loop.javascript(loopType, count);
  }

  generateArray(parsed) {
    const { language, params } = parsed;
    const operation = params.operation || 'basic';
    const items = params.items || [1, 2, 3, 4, 5];
    
    if (this.patterns.array[language]) {
      return this.patterns.array[language](operation, items);
    }
    
    return this.patterns.array.javascript(operation, items);
  }

  generateHTTP(parsed) {
    const { language, params } = parsed;
    const method = params.operation || 'get';
    const url = params.url || 'https://api.example.com/data';
    
    if (this.patterns.http[language]) {
      return this.patterns.http[language](method, url);
    }
    
    return this.patterns.http.javascript(method, url);
  }

  generateHTML(parsed) {
    const { params } = parsed;
    const title = params.name || 'My Page';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <p>Generated by Custom AI Code Generator</p>
    </div>
</body>
</html>`;
  }

  generateAlgorithm(parsed) {
    const { language } = parsed;
    const algo = parsed.params.operation || 'sort';
    
    if (algo === 'sort') {
      if (language === 'python') {
        return `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers)
print("Sorted array:", sorted_numbers)`;
      } else {
        return `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

// Example usage
const numbers = [64, 34, 25, 12, 22, 11, 90];
const sorted = bubbleSort(numbers);
console.log("Sorted array:", sorted);`;
      }
    }
    
    return `// Algorithm implementation for ${algo}`;
  }

  generateGeneral(parsed) {
    const { language, originalPrompt } = parsed;
    
    if (language === 'javascript') {
      return `// Generated based on: "${originalPrompt}"
// This is a template - please provide more specific requirements

console.log("Hello, World!");

// Your implementation here
function solution() {
    // TODO: Implement based on: ${originalPrompt}
    return null;
}

// Test the solution
console.log(solution());`;
    } else if (language === 'python') {
      return `# Generated based on: "${originalPrompt}"
# This is a template - please provide more specific requirements

def solution():
    # TODO: Implement based on: ${originalPrompt}
    pass

if __name__ == "__main__":
    print("Hello, World!")
    result = solution()
    print(result)`;
    }
    
    return `// Code for ${language} based on: ${originalPrompt}`;
  }

  formatCode(code, language) {
    const header = `// Generated by Custom AI Code Generator\n// Language: ${language}\n// ${new Date().toLocaleString()}\n\n`;
    return header + code;
  }

  inferParameters(params) {
    // Simple parameter inference based on context
    if (params.operation === 'sort') return ['array'];
    if (params.operation === 'map') return ['array', 'callback'];
    if (params.operation === 'filter') return ['array', 'predicate'];
    return ['param1', 'param2'];
  }

  formatJavaParams(params) {
    return params.map(p => `String ${p}`).join(', ');
  }

  formatCppParams(params) {
    return params.map(p => `int ${p}`).join(', ');
  }

  // "Learn" new patterns (simulates AI learning)
  learnPattern(prompt, code) {
    this.learnedPatterns.set(prompt, code);
    console.log('AI learned a new pattern!');
  }

  // Get statistics
  getStats() {
    return {
      languages: this.languages,
      patternCount: Object.keys(this.patterns).length,
      learnedPatterns: this.learnedPatterns.size
    };
  }
}

// CLI Interface
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ai = new CustomCodeAI();

console.log('🤖 Custom AI Code Generator');
console.log('===========================');
console.log('Supported languages:', ai.languages.join(', '));
console.log('Type "exit" to quit\n');

function askForPrompt() {
  rl.question('Enter your coding request: ', (prompt) => {
    if (prompt.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      console.log('AI Statistics:', ai.getStats());
      rl.close();
      return;
    }

    if (prompt.toLowerCase() === 'stats') {
      console.log('\n📊 AI Statistics:', ai.getStats());
      askForPrompt();
      return;
    }

    console.log('\n🔍 Analyzing prompt...');
    console.log('🤔 Generating code...\n');

    const code = ai.generateCode(prompt);
    console.log(code);
    console.log('\n' + '-'.repeat(50) + '\n');

    // Ask if user wants to teach the AI
    rl.question('Was this helpful? (yes/no/teach): ', (feedback) => {
      if (feedback.toLowerCase() === 'teach') {
        rl.question('Enter improved code: ', (improvedCode) => {
          ai.learnPattern(prompt, improvedCode);
          console.log('✅ AI learned from your feedback!\n');
          askForPrompt();
        });
      } else {
        console.log(feedback.toLowerCase() === 'yes' ? '😊 Great!\n' : '😕 Sorry about that. Try being more specific.\n');
        askForPrompt();
      }
    });
  });
}

askForPrompt();

// Export for use in other files
module.exports = CustomCodeAI;
