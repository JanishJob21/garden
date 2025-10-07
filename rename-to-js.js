const fs = require('fs');
const path = require('path');

function renameFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      renameFiles(fullPath);
    } else if (file.name.endsWith('.jsx')) {
      const newPath = path.join(dir, file.name.replace(/\.jsx$/, '.js'));
      
      // Only rename if the target doesn't exist to avoid overwriting
      if (!fs.existsSync(newPath)) {
        fs.renameSync(fullPath, newPath);
        console.log(`Renamed: ${fullPath} -> ${newPath}`);
        
        // Update import references in all JS/JSX files
        updateImports(dir, file.name, file.name.replace(/\.jsx$/, '.js'));
      }
    }
  });
}

function updateImports(rootDir, oldName, newName) {
  const files = fs.readdirSync(rootDir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(rootDir, file.name);
    
    if (file.isDirectory()) {
      updateImports(fullPath, oldName, newName);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const updated = content.replace(
        new RegExp(`(['"].*)${oldName.replace('.', '\.')}(['"])`, 'g'),
        `$1${newName}$2`
      );
      
      if (content !== updated) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Updated imports in: ${fullPath}`);
      }
    }
  });
}

// Start renaming from the src directory
const srcDir = path.join(__dirname, 'src');
console.log('Starting to rename .jsx files to .js...');
renameFiles(srcDir);
console.log('File renaming and import updates completed!');
