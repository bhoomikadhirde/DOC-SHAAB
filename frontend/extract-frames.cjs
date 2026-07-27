const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const inputVideo = path.join(__dirname, 'public', 'intro.mp4');
const outputDir = path.join(__dirname, 'public', 'frames');

// Create frames directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
} else {
  // Clear existing frames
  const files = fs.readdirSync(outputDir);
  for (const file of files) {
    fs.unlinkSync(path.join(outputDir, file));
  }
}

console.log('Extracting frames using ffmpeg...');
console.log('Using ffmpeg binary at:', ffmpeg);

try {
  // -i : input file
  // -vf scale=-1:720 : Resize to 720p height (maintaining aspect ratio) to keep size down
  // -qscale:v 3 : Good quality JPG
  const cmd = `"${ffmpeg}" -i "${inputVideo}" -vf scale=-1:720 -qscale:v 3 "${path.join(outputDir, 'frame_%04d.jpg')}"`;
  
  execSync(cmd, { stdio: 'inherit' });
  console.log('Successfully extracted frames!');
  
  // Count frames
  const frames = fs.readdirSync(outputDir).filter(f => f.endsWith('.jpg'));
  console.log(`Total frames generated: ${frames.length}`);
  
} catch (error) {
  console.error('Failed to extract frames:', error.message);
}
