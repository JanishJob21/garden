const fs = require('fs');
const path = require('path');

// Files that need to be renamed (from -> to)
const filesToRename = [
  { from: 'src/pages/home.jsx', to: 'src/pages/Home.jsx' },
  { from: 'src/App.jsx', to: 'src/App.js' },
  { from: 'src/main.jsx', to: 'src/index.js' },
];

// Update imports in all JS/JSX files
function updateImports() {
  const jsFiles = [];
  
  // Find all JS/JSX files
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        jsFiles.push(fullPath);
      }
    }
  }
  
  walkDir('src');
  
  // Update imports in each file
  for (const file of jsFiles) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Update import paths to match correct case
    content = content.replace(
      /from ['"](.\/pages\/home)(['"])/g, 
      'from "$1"'.replace('home', 'Home')
    );
    
    // Update .jsx imports to .js where needed
    if (!file.endsWith('.jsx')) {
      content = content.replace(/\.jsx(['"])/g, '.js$1');
    }
    
    fs.writeFileSync(file, content, 'utf8');
  }
}

// Rename files
function renameFiles() {
  for (const {from, to} of filesToRename) {
    if (fs.existsSync(from) && !fs.existsSync(to)) {
      fs.renameSync(from, to);
      console.log(`Renamed ${from} to ${to}`);
    }
  }
}

// Run the fixes
renameFiles();
updateImports();
console.log('Import fixes completed!');
