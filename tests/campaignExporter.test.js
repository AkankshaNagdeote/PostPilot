/**
 * PostPilot Test Suite: Campaign Exporter & Dispatcher (STORY-04.1)
 * ==================================================================
 * Verifies EARS compliance for:
 * - REQ-4.1.1: Automatic hierarchical directory creation per campaign and channel.
 * - REQ-4.1.2: Pre-written captions with hashtags, hook lines, and canonical UTM tracking URLs.
 * - CLI Argument Parsing and $0 budget tracking.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { CampaignExporter, buildTrackingUrl } = require('../src/dispatcher/campaignExporter');
const { parseArgs } = require('../src/index');

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
  target_concerns: ['Compromised Barrier', 'Redness'],
  who_its_for: ['Dry to very dry skin', 'Compromised skin barriers'],
  who_its_not_for: ['Extremely oily skin in humid climates'],
  clinical_research: 'Clinical testing shows a 48% reduction in TEWL (water loss) after 14 days.'
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

async function runAsyncTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✔ ${testName}: PASSED`);
  } catch (err) {
    console.error(`  ✖ ${testName}: FAILED`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function main() {
  console.log('\n🧪 PostPilot: Running Test Suite for STORY-04 Campaign Exporter & Dispatcher\n');

  const testOutputDir = path.join(__dirname, '../dist/test_exports');

  // TEST 1: REQ-4.1.2 - Canonical Tracking URL Generator
  runTest('TEST-4.1.2a (Canonical Tracking URL Construction with UTMs)', () => {
    const url = buildTrackingUrl(sampleProduct, 'instagram', 'product_launch', 'carousel');
    assert.ok(url.startsWith('https://skinethix.com/products/skinethix-barrier-rescue'), 'Must point to product slug');
    assert.ok(url.includes('utm_source=instagram'), 'Must contain utm_source');
    assert.ok(url.includes('utm_medium=social'), 'Must contain utm_medium');
    assert.ok(url.includes('utm_campaign=product_launch'), 'Must contain utm_campaign');
    assert.ok(url.includes('utm_content=carousel'), 'Must contain utm_content');

    const pinUrl = buildTrackingUrl(sampleProduct, 'pinterest', 'product_launch', 'search_pin');
    assert.ok(pinUrl.includes('utm_medium=search'), 'Pinterest medium must be search');
  });

  // TEST 2: REQ-4.1.1 - End-to-End Hierarchical Export for All 7 Channels
  await runAsyncTest('TEST-4.1.1 (Hierarchical Export Directory Tree for All 7 Platforms)', async () => {
    const exporter = new CampaignExporter({ outputDir: testOutputDir });
    const manifest = await exporter.exportProductPackage(sampleProduct, 'product_launch');

    assert.ok(manifest, 'Manifest must be generated');
    assert.strictEqual(manifest.product_id, 'prod-001');
    assert.strictEqual(manifest.budget_spent, '$0.00');

    const prodDir = path.join(testOutputDir, 'product_launch', 'skinethix-barrier-rescue');
    assert.ok(fs.existsSync(prodDir), 'Product directory must exist');

    // 1. Instagram Check
    const igDir = path.join(prodDir, 'instagram');
    assert.ok(fs.existsSync(igDir), 'Instagram directory must exist');
    for (let s = 1; s <= 5; s++) {
      assert.ok(fs.existsSync(path.join(igDir, `slide_${s}.svg`)), `Instagram slide_${s}.svg must exist`);
    }
    assert.ok(fs.existsSync(path.join(igDir, 'caption.txt')), 'Instagram caption.txt must exist');
    const igCaption = fs.readFileSync(path.join(igDir, 'caption.txt'), 'utf8');
    assert.ok(igCaption.includes('#skinethix'), 'Instagram caption must include #skinethix hashtag');
    assert.ok(igCaption.includes('utm_source=instagram'), 'Instagram caption must include UTM tracking link');

    // 2. Facebook Check
    const fbDir = path.join(prodDir, 'facebook');
    assert.ok(fs.existsSync(path.join(fbDir, 'discussion_card.svg')), 'Facebook discussion card must exist');
    assert.ok(fs.existsSync(path.join(fbDir, 'post.txt')), 'Facebook post.txt must exist');
    const fbPost = fs.readFileSync(path.join(fbDir, 'post.txt'), 'utf8');
    assert.ok(fbPost.includes('utm_source=facebook'), 'Facebook post must include UTM tracking link');

    // 3. YouTube Shorts Check
    const ytDir = path.join(prodDir, 'youtube');
    assert.ok(fs.existsSync(path.join(ytDir, 'shorts_cover.svg')), 'YouTube shorts cover must exist');
    assert.ok(fs.existsSync(path.join(ytDir, 'script.txt')), 'YouTube script.txt must exist');
    const ytScript = fs.readFileSync(path.join(ytDir, 'script.txt'), 'utf8');
    assert.ok(ytScript.includes('00:00') && ytScript.includes('00:05'), 'YouTube script must include timing timestamps');
    assert.ok(ytScript.includes('utm_source=youtube_shorts'), 'YouTube script must include pinned comment link');

    // 4. Twitter / X Check
    const twDir = path.join(prodDir, 'twitter_x');
    assert.ok(fs.existsSync(path.join(twDir, 'summary_card.svg')), 'Twitter summary card must exist');
    assert.ok(fs.existsSync(path.join(twDir, 'thread.txt')), 'Twitter thread.txt must exist');
    const twThread = fs.readFileSync(path.join(twDir, 'thread.txt'), 'utf8');
    assert.ok(twThread.includes('TWEET 1/'), 'Twitter thread must have numbered tweets');
    assert.ok(twThread.includes('utm_source=twitter'), 'Twitter thread must include tracking link');

    // 5. LinkedIn Check
    const liDir = path.join(prodDir, 'linkedin');
    for (let l = 1; l <= 4; l++) {
      assert.ok(fs.existsSync(path.join(liDir, `document_slide_${l}.svg`)), `LinkedIn document_slide_${l}.svg must exist`);
    }
    assert.ok(fs.existsSync(path.join(liDir, 'article.txt')), 'LinkedIn article.txt must exist');
    const liArticle = fs.readFileSync(path.join(liDir, 'article.txt'), 'utf8');
    assert.ok(liArticle.includes('utm_source=linkedin'), 'LinkedIn article must include tracking link');

    // 6. Pinterest Check
    const pinDir = path.join(prodDir, 'pinterest');
    assert.ok(fs.existsSync(path.join(pinDir, 'vertical_search_pin.svg')), 'Pinterest vertical pin must exist');
    assert.ok(fs.existsSync(path.join(pinDir, 'pin_metadata.json')), 'Pinterest metadata.json must exist');
    const pinMeta = JSON.parse(fs.readFileSync(path.join(pinDir, 'pin_metadata.json'), 'utf8'));
    assert.ok(pinMeta.destination_url.includes('utm_source=pinterest'), 'Pinterest destination URL must include tracking');

    // 7. Reddit Check
    const redditDir = path.join(prodDir, 'reddit_threads');
    assert.ok(fs.existsSync(path.join(redditDir, 'discussion_post.md')), 'Reddit discussion post must exist');
    const redditPost = fs.readFileSync(path.join(redditDir, 'discussion_post.md'), 'utf8');
    assert.ok(redditPost.includes('utm_source=reddit'), 'Reddit post must include source tracking link');

    // 8. Root Manifest Check
    const manifestPath = path.join(prodDir, 'manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'Root manifest.json must exist');
    const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.strictEqual(manifestJson.campaign_type, 'product_launch');
    assert.ok(manifestJson.canonical_urls.instagram);
  });

  // TEST 3: CLI Argument Parser Check
  runTest('TEST-4.1.4 (CLI Argument Parser Validation)', () => {
    const parsed = parseArgs(['--campaign=viral_teardown', '--limit=3', '--out=custom_exports']);
    assert.strictEqual(parsed.campaign, 'viral_teardown');
    assert.strictEqual(parsed.limit, 3);
    assert.strictEqual(parsed.outputDir, 'custom_exports');

    const parsedSpace = parseArgs(['--campaign', 'dupe_battles', '--limit', '4']);
    assert.strictEqual(parsedSpace.campaign, 'dupe_battles');
    assert.strictEqual(parsedSpace.limit, 4);

    const parsedUrl = parseArgs(['--url', 'https://skinethix.com/products/retinol-booster']);
    assert.strictEqual(parsedUrl.source, 'url');
    assert.strictEqual(parsedUrl.input, 'https://skinethix.com/products/retinol-booster');
  });

  // TEST 4: Batch Export Runner (Multiple Products)
  await runAsyncTest('TEST-4.1.5 (Full Multi-Product Batch Execution)', async () => {
    const exporter = new CampaignExporter({ outputDir: testOutputDir });
    const batchResult = await exporter.exportBatch({
      source: 'json',
      sourcePath: path.join(__dirname, '../src/data/sample_products.json'),
      campaign: 'product_launch',
      limit: 2
    });

    assert.strictEqual(batchResult.total_products_exported, 2, 'Should export exactly 2 products');
    assert.strictEqual(batchResult.manifests.length, 2);
  });

  // Clean up test export artifacts
  fs.rmSync(testOutputDir, { recursive: true, force: true });

  console.log('\n========================================');
  console.log(`PostPilot Test Summary: ${totalTests} Total | ${passedTests} Passed | ${totalTests - passedTests} Failed`);
  console.log('========================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
