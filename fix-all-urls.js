const fs = require('fs');
const path = require('path');

// Configuration - CHANGE THIS TO YOUR SERVER IP
const SERVER_IP = '192.168.8.8'; // Replace with your actual server IP
const OLD_URL = 'http://localhost:5556';
const NEW_URL = `http://${SERVER_IP}:5556`;

console.log(`🔄 Fixing ALL localhost URLs...`);
console.log(`From: ${OLD_URL}`);
console.log(`To: ${NEW_URL}\n`);

// Function to recursively find and update files
function updateFilesInDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and dist folders
      if (!file.includes('node_modules') && !file.includes('dist')) {
        updateFilesInDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      // Update TypeScript and JavaScript files
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Replace localhost URLs
        content = content.replace(new RegExp(OLD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_URL);
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Updated: ${path.relative(__dirname, filePath)}`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${filePath}: ${error.message}`);
      }
    }
  });
}

// Start from src directory
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  updateFilesInDirectory(srcDir);
} else {
  console.log('❌ src directory not found');
}

console.log(`\n🎉 URL update complete!`);
console.log(`\n📋 Next steps:`);
console.log(`1. Build your Angular app: ng build --configuration production`);
console.log(`2. Copy the dist/client/browser folder to your server`);
console.log(`3. Test from other PCs using: http://${SERVER_IP}:4200`);
