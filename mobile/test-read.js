const fs = require('fs');
try {
  const data = fs.readFileSync('package.json', 'utf8');
  console.log('Success reading package.json');
} catch (err) {
  console.error('Error reading file:', err);
}
