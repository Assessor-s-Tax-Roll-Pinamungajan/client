const fs = require('fs');
const path = require('path');

// Configuration
const SERVER_IP = '192.168.8.8'; // Replace with your actual server IP
const OLD_URL = 'http://localhost:5556';
const NEW_URL = `http://${SERVER_IP}:5556`;

// Files to update (relative to client folder)
const filesToUpdate = [
  'src/app/components/navbar/navbar.component.ts',
  'src/app/pages/record/record.component.ts',
  'src/app/services/user.service.ts',
  'src/app/pages/view-land/view-land.component.ts',
  'src/app/pages/land-details/land-update/land-update.component.ts',
  'src/app/pages/land-details/add-land/add-land.component.ts',
  'src/app/pages/land-details/land-details.component.ts',
  'src/app/pages/land-details/land.service.ts'
];

console.log(`🔄 Updating API URLs from ${OLD_URL} to ${NEW_URL}...\n`);

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Replace localhost URLs
    content = content.replace(new RegExp(OLD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_URL);
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log(`\n🎉 API URL update complete!`);
console.log(`\n📋 Next steps:`);
console.log(`1. Build your Angular app: ng build --configuration production`);
console.log(`2. Copy the dist/client/browser folder to your server`);
