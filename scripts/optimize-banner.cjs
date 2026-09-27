const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = '/Users/macbookpro/.gemini/antigravity/brain/2ceaa455-0463-48e1-986c-0af2892d1e4c/.user_uploaded/media_1790432652356.jpg';
const outputDir = path.resolve(__dirname, '../public/images');

async function optimizeBanner() {
  console.log('Starting banner optimization...');

  // 1. High-DPI 2048x1152 WebP (Retina & 4K ready, ultra-optimized)
  await sharp(inputPath)
    .resize(2048, 1152, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(outputDir, 'banner.webp'));
  console.log('Generated public/images/banner.webp');

  // 2. High-DPI 2048x1152 Progressive JPEG (Universal fallback)
  await sharp(inputPath)
    .resize(2048, 1152, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
    .jpeg({ quality: 90, progressive: true, mozjpeg: true })
    .toFile(path.join(outputDir, 'banner.jpg'));
  console.log('Generated public/images/banner.jpg');

  // 3. Mobile-optimized 800x450 WebP (Fast LCP for mobile screens)
  await sharp(inputPath)
    .resize(800, 450, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(outputDir, 'banner-mobile.webp'));
  console.log('Generated public/images/banner-mobile.webp');

  // 4. OpenGraph 1200x630 Social Banner (WhatsApp, iMessage, Twitter, Facebook)
  // 1200x630 is 1.905:1, while 1024x576 is 1.778:1 (16:9).
  // We fit the banner inside 1200x630 with smart blurred/ambient background or subtle crop
  await sharp(inputPath)
    .resize(1200, 630, { kernel: sharp.kernel.lanczos3, fit: 'cover', position: 'center' })
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(path.join(outputDir, 'og-image.png'));
  console.log('Generated public/images/og-image.png');

  // Copy to app metadata images
  await sharp(inputPath)
    .resize(1200, 630, { kernel: sharp.kernel.lanczos3, fit: 'cover', position: 'center' })
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(path.resolve(__dirname, '../src/app/opengraph-image.png'));
  console.log('Generated src/app/opengraph-image.png');

  await sharp(inputPath)
    .resize(1200, 630, { kernel: sharp.kernel.lanczos3, fit: 'cover', position: 'center' })
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(path.resolve(__dirname, '../src/app/twitter-image.png'));
  console.log('Generated src/app/twitter-image.png');

  console.log('Banner optimization complete!');
}

optimizeBanner().catch((err) => {
  console.error('Error optimizing banner:', err);
  process.exit(1);
});
