/**
 * PostPilot Test Suite: Visual Template Compositor & Blender Pipeline (STORY-03.1 & STORY-03.2)
 * ==============================================================================================
 * Verifies EARS compliance for:
 * - REQ-3.1.1: Blender headless 3D render pipeline CLI & simulation fallback
 * - REQ-3.2.1: Instagram / LinkedIn 4:5 dimensions (1080x1350)
 * - REQ-3.2.2: Pinterest 2:3 dimensions (1000x1500)
 * - REQ-3.2.3: YouTube Shorts 9:16 dimensions (1080x1920)
 * - REQ-3.2.4: Twitter/X 16:9 dimensions (1200x675)
 * - REQ-3.2.5: Facebook 1:1 dimensions (1080x1080)
 * - REQ-3.2.6: SkinEthix brand watermark, typography, and color palette enforcement
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { VisualCompositor, CHANNEL_SPECS, BRAND_SYSTEM } = require('../src/compositor/visualCompositor');

// Sample test product
const sampleProduct = {
  id: 'prod-001',
  slug: 'skinethix-barrier-rescue',
  name: 'SkinEthix Barrier Rescue Crème',
  brand: 'SkinEthix',
  category: 'moisturizer',
  texture: 'Rich Velvet',
  finish: 'Dewy Non-Greasy',
  absorption_speed: 'Fast (under 60s)',
  weight: 'Medium-Rich',
  hero_ingredients: ['5% Niacinamide', 'Ceramide NP', 'Centella Asiatica'],
  target_concerns: ['Compromised Barrier', 'Redness', 'TEWL'],
  who_its_for: ['Dry to very dry skin', 'Compromised skin barriers', 'Post-retinol peeling'],
  who_its_not_for: ['Extremely oily skin in humid climates', 'Those with known niacinamide sensitivity'],
  clinical_research: 'Clinical testing shows a 48% reduction in TEWL (water loss) after 14 days of twice-daily use.'
};

let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ ${testName}: PASSED`);
  } catch (err) {
    console.error(`  ✖ ${testName}: FAILED`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n🧪 PostPilot: Running Test Suite for STORY-03 Visual Compositor & Blender Pipeline\n');

const compositor = new VisualCompositor();

// TEST 1: REQ-3.2.1 - Instagram 4:5 Carousel Slides (1080x1350)
runTest('TEST-3.2.1 (Instagram 4:5 Aspect Ratio & 5-Slide Arc)', () => {
  for (let s = 1; s <= 5; s++) {
    const slide = compositor.renderInstagramCarouselSlide(sampleProduct, { slideNumber: s }, { slideNumber: s, totalSlides: 5 });
    assert.strictEqual(slide.metadata.width, 1080, `Slide ${s} width must be 1080`);
    assert.strictEqual(slide.metadata.height, 1350, `Slide ${s} height must be 1350`);
    assert.strictEqual(slide.metadata.ratio, '4:5', `Slide ${s} ratio must be 4:5`);
    assert.ok(slide.svg.includes('viewBox="0 0 1080 1350"'), `SVG viewBox must be 0 0 1080 1350`);
    assert.ok(slide.svg.includes('SLIDE ' + s + ' OF 5'), `SVG must have slide indicator ${s}`);
  }
});

// TEST 2: REQ-3.2.1b - LinkedIn 4:5 Document Slides (1080x1350)
runTest('TEST-3.2.1b (LinkedIn 4:5 PDF Document Slides 1080x1350)', () => {
  const slide = compositor.renderLinkedInSlide(sampleProduct, { slideNumber: 1 }, { slideNumber: 1, totalSlides: 4 });
  assert.strictEqual(slide.metadata.width, 1080, 'LinkedIn width must be 1080');
  assert.strictEqual(slide.metadata.height, 1350, 'LinkedIn height must be 1350');
  assert.strictEqual(slide.metadata.ratio, '4:5', 'LinkedIn ratio must be 4:5');
  assert.ok(slide.svg.includes('COSMETIC CHEMISTRY INTELLIGENCE'), 'Must contain editorial header');
});

// TEST 3: REQ-3.2.2 - Pinterest 2:3 Vertical Search Pin (1000x1500)
runTest('TEST-3.2.2 (Pinterest 2:3 Search Pin 1000x1500)', () => {
  const pin = compositor.renderPinterestPin(sampleProduct);
  assert.strictEqual(pin.metadata.width, 1000, 'Pinterest width must be 1000');
  assert.strictEqual(pin.metadata.height, 1500, 'Pinterest height must be 1500');
  assert.strictEqual(pin.metadata.ratio, '2:3', 'Pinterest ratio must be 2:3');
  assert.ok(pin.svg.includes('viewBox="0 0 1000 1500"'), 'SVG viewBox must be 0 0 1000 1500');
  assert.ok(pin.svg.includes('Read Full Review on SkinEthix.com'), 'Must contain destination CTA');
});

// TEST 4: REQ-3.2.3 - YouTube Shorts 9:16 Video Cover (1080x1920)
runTest('TEST-3.2.3 (YouTube Shorts 9:16 Cover 1080x1920)', () => {
  const shorts = compositor.renderYouTubeShortsCover(sampleProduct);
  assert.strictEqual(shorts.metadata.width, 1080, 'YouTube Shorts width must be 1080');
  assert.strictEqual(shorts.metadata.height, 1920, 'YouTube Shorts height must be 1920');
  assert.strictEqual(shorts.metadata.ratio, '9:16', 'YouTube Shorts ratio must be 9:16');
  assert.ok(shorts.svg.includes('viewBox="0 0 1080 1920"'), 'SVG viewBox must be 0 0 1080 1920');
  assert.ok(shorts.svg.includes('DON&apos;T BUY THIS'), 'Must contain high-contrast hook');
});

// TEST 5: REQ-3.2.4 - Twitter/X 16:9 Header Card (1200x675)
runTest('TEST-3.2.4 (Twitter/X 16:9 Summary Card 1200x675)', () => {
  const twitter = compositor.renderTwitterCard(sampleProduct);
  assert.strictEqual(twitter.metadata.width, 1200, 'Twitter width must be 1200');
  assert.strictEqual(twitter.metadata.height, 675, 'Twitter height must be 675');
  assert.strictEqual(twitter.metadata.ratio, '16:9', 'Twitter ratio must be 16:9');
  assert.ok(twitter.svg.includes('viewBox="0 0 1200 675"'), 'SVG viewBox must be 0 0 1200 675');
  assert.ok(twitter.svg.includes('LAB SCORECARD'), 'Must contain lab scorecard banner');
});

// TEST 6: REQ-3.2.5 - Facebook 1:1 Feed Discussion Card (1080x1080)
runTest('TEST-3.2.5 (Facebook 1:1 Discussion Card 1080x1080)', () => {
  const fb = compositor.renderFacebookCard(sampleProduct);
  assert.strictEqual(fb.metadata.width, 1080, 'Facebook width must be 1080');
  assert.strictEqual(fb.metadata.height, 1080, 'Facebook height must be 1080');
  assert.strictEqual(fb.metadata.ratio, '1:1', 'Facebook ratio must be 1:1');
  assert.ok(fb.svg.includes('viewBox="0 0 1080 1080"'), 'SVG viewBox must be 0 0 1080 1080');
  assert.ok(fb.svg.includes('COMMUNITY AUDIT'), 'Must contain community audit badge');
});

// TEST 7: REQ-3.2.6 - Brand Watermark & Hex Colors Across All Outputs
runTest('TEST-3.2.6 (Brand Watermark & Hex Palette Verification)', () => {
  const batch = compositor.renderOmnichannelVisualBatch(sampleProduct);
  
  // Verify Instagram slides
  batch.assets.instagram.forEach((item, idx) => {
    assert.ok(item.svg.includes(BRAND_SYSTEM.watermark), `Instagram slide ${idx+1} missing watermark`);
    assert.ok(item.svg.includes('#059669') || item.svg.includes('#10B981'), `Instagram slide ${idx+1} missing brand emerald`);
  });

  // Verify Facebook
  assert.ok(batch.assets.facebook.svg.includes(BRAND_SYSTEM.watermark), 'Facebook card missing watermark');
  assert.ok(batch.assets.facebook.svg.includes('#059669'), 'Facebook card missing brand emerald');

  // Verify Pinterest
  assert.ok(batch.assets.pinterest.svg.includes(BRAND_SYSTEM.watermark), 'Pinterest pin missing watermark');

  // Verify YouTube Shorts
  assert.ok(batch.assets.youtube.svg.includes(BRAND_SYSTEM.watermark), 'YouTube cover missing watermark');

  // Verify Twitter
  assert.ok(batch.assets.twitter.svg.includes(BRAND_SYSTEM.watermark), 'Twitter card missing watermark');

  // Verify LinkedIn
  batch.assets.linkedin.forEach((item, idx) => {
    assert.ok(item.svg.includes(BRAND_SYSTEM.watermark), `LinkedIn slide ${idx+1} missing watermark`);
  });
});

// TEST 8: Asset Disk Writer
runTest('TEST-3.2.7 (Omnichannel Visual Asset Disk Serialization)', () => {
  const tempOutputDir = path.join(__dirname, '../dist/test_renders');
  const batch = compositor.renderOmnichannelVisualBatch(sampleProduct);
  const savedFiles = compositor.saveVisualAssets(batch, tempOutputDir);

  assert.ok(savedFiles.length >= 13, `Expected at least 13 generated visual files, got ${savedFiles.length}`);
  savedFiles.forEach(file => {
    assert.ok(fs.existsSync(file), `File ${file} should exist on disk`);
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(content.startsWith('<?xml') || content.startsWith('<svg'), `File ${file} must be valid SVG`);
  });

  // Clean up test renders
  fs.rmSync(tempOutputDir, { recursive: true, force: true });
});

// TEST 9: REQ-3.1.1 - Blender Headless 3D Render Script CLI & Simulation
runTest('TEST-3.1.1 (Blender Headless 3D Render Script & CLI Simulation)', () => {
  const scriptPath = path.join(__dirname, '../src/blender/render_product.py');
  assert.ok(fs.existsSync(scriptPath), 'render_product.py must exist');

  const testRenderDir = path.join(__dirname, '../dist/test_blender');
  const testRenderOutput = path.join(testRenderDir, 'test_bottle.svg');

  // Execute render script via python CLI
  const cmd = `python3 "${scriptPath}" --name "Test Serum" --type "dropper" --output "${testRenderOutput}" --simulate`;
  const output = execSync(cmd, { encoding: 'utf8' });

  assert.ok(output.includes('[PostPilot Blender Pipeline]'), 'Script must emit pipeline diagnostic header');
  assert.ok(fs.existsSync(testRenderOutput), 'Output render file must be generated');

  const svgContent = fs.readFileSync(testRenderOutput, 'utf8');
  assert.ok(svgContent.includes('<svg'), 'Generated simulated render must be valid vector');
  assert.ok(svgContent.includes('Test Serum'), 'Generated render must contain product label');

  // Clean up
  fs.rmSync(testRenderDir, { recursive: true, force: true });
});

console.log('\n========================================');
console.log(`PostPilot Test Summary: ${totalTests} Total | ${passedTests} Passed | ${totalTests - passedTests} Failed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
