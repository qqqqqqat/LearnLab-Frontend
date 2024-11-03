const fs = require('fs');
const path = '.output/server/index.mjs';

fs.access(path, fs.constants.F_OK, (err) => {
  if (err) {
    console.error('Error: index.mjs not found');
    process.exit(1); // Exit with an error code
  } else {
    console.log('Build successful: index.mjs exists');
  }
});
