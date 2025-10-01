const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 }
];

const inputIcon = path.join(__dirname, '..', 'assets', 'images', 'icon.png');
const androidRes = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

async function generateIcons() {
  for (const { folder, size } of iconSizes) {
    const outputPath = path.join(androidRes, folder, 'ic_launcher.png');
    const roundOutputPath = path.join(androidRes, folder, 'ic_launcher_round.png');

    console.log(`Generating ${folder} (${size}x${size})...`);

    await sharp(inputIcon)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    await sharp(inputIcon)
      .resize(size, size)
      .png()
      .toFile(roundOutputPath);
  }

  console.log('✓ All Android launcher icons generated successfully!');
}

generateIcons().catch(console.error);
