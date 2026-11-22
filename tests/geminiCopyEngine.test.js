/**
 * PostPilot — Automated Unit Test Suite for STORY-02.1: Gemini Copy Engine
 * Verifies EARS Requirements: REQ-2.1.1, REQ-2.1.2, REQ-2.1.3, REQ-2.1.4, REQ-2.1.5, REQ-2.1.6
 */

const assert = require('assert');
const { GeminiCopyEngine } = require('../src/adapters/geminiCopyEngine');

async function runTests() {
  console.log('🧪 PostPilot: Running Test Suite for STORY-02.1 Gemini Copy Engine\n');
  let passed = 0;
  let failed = 0;

  const mockProduct = {
    id: 'prod-001',
    name: 'CeraVe PM Facial Moisturising Lotion',
    brand: 'CeraVe',
    category: 'moisturizer',
    isFamous: true,
    forWho: ['Normal skin', 'Dry compromised barrier'],
    notForWho: ['Fungal acne (Malassezia)', 'Severe cystic acne'],
    heroIngredients: ['Niacinamide (4%)', 'Ceramides 1, 3, 6-II', 'Hyaluronic Acid'],
    texture: 'Ultra-light lotion',
    scent: '100% Fragrance-Free',
    priceUsd: 16.99,
    rating: 4.6,
    canonicalUrl: 'https://skinethix.com/product/cerave-pm-facial-lotion'
  };

  const engine = new GeminiCopyEngine();

  // TEST 1: REQ-2.1.2 — Instagram 5-Slide Arc Verification
  try {
    const ig = engine.generateInstagramCarousel(mockProduct, 'PRODUCT_LAUNCH');
    assert.strictEqual(ig.platform, 'INSTAGRAM');
    assert.strictEqual(ig.slideCount, 5, 'Must contain exactly 5 slides');
    assert.strictEqual(ig.dimensions.width, 1080);
    assert.strictEqual(ig.dimensions.height, 1350);
    assert.strictEqual(ig.slides[0].type, 'HOOK');
    assert.strictEqual(ig.slides[1].type, 'PROBLEM');
    assert.strictEqual(ig.slides[2].type, 'DATA_PROOF');
    assert.strictEqual(ig.slides[3].type, 'THE_FIX');
    assert.strictEqual(ig.slides[4].type, 'CTA');
    assert.strictEqual(ig.caption.includes('SkinEthix.com'), true);
    console.log('  ✔ TEST-2.1.2 (Instagram 5-Slide Arc & 4:5 Aspect Ratio): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-2.1.2 FAILED:', err.message);
    failed++;
  }

  // TEST 2: REQ-2.1.5 — Twitter / X Thread Character Constraint (<= 280 chars)
  try {
    const twitter = engine.generateTwitterThread(mockProduct, 'PRODUCT_LAUNCH');
    assert.strictEqual(twitter.platform, 'TWITTER_X');
    assert.strictEqual(twitter.tweetCount >= 4, true, 'Must have at least 4 tweets in thread');
    twitter.tweets.forEach((tweet, i) => {
      assert.strictEqual(tweet.length <= 280, true, `Tweet ${i + 1} exceeds 280 characters: length ${tweet.length}`);
    });
    assert.strictEqual(twitter.tweets[twitter.tweets.length - 1].includes('skinethix.com'), true);
    console.log('  ✔ TEST-2.1.5 (Twitter/X Thread <= 280 Characters Constraint): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-2.1.5 FAILED:', err.message);
    failed++;
  }

  // TEST 3: REQ-2.1.3 — YouTube Shorts 30s Script with Visual Cues
  try {
    const yt = engine.generateYouTubeShortsScript(mockProduct, 'PRODUCT_LAUNCH');
    assert.strictEqual(yt.platform, 'YOUTUBE_SHORTS');
    assert.strictEqual(yt.estimatedDurationSeconds, 30);
    assert.strictEqual(yt.dimensions.height, 1920);
    assert.strictEqual(yt.dimensions.width, 1080);
    assert.strictEqual(Array.isArray(yt.script), true);
    yt.script.forEach((scene) => {
      assert.strictEqual(scene.visualCue.includes('[VISUAL CUE:'), true, 'Scene must contain visual cue');
      assert.strictEqual(typeof scene.spokenText === 'string' && scene.spokenText.length > 0, true);
    });
    console.log('  ✔ TEST-2.1.3 (YouTube Shorts 30s Timed Script with Visual Cues): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-2.1.3 FAILED:', err.message);
    failed++;
  }

  // TEST 4: REQ-2.1.4 — LinkedIn PDF Document Carousel & Post Body
  try {
    const li = engine.generateLinkedInPost(mockProduct, 'PRODUCT_LAUNCH');
    assert.strictEqual(li.platform, 'LINKEDIN');
    assert.strictEqual(li.dimensions.height, 1350);
    assert.strictEqual(li.pdfSlides.length >= 4, true);
    assert.strictEqual(li.postBody.includes('BeautyTech'), true);
    assert.strictEqual(li.postBody.includes('SkinEthix'), true);
    console.log('  ✔ TEST-2.1.4 (LinkedIn PDF Carousel Outline & Article): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-2.1.4 FAILED:', err.message);
    failed++;
  }

  // TEST 5: REQ-2.1.6 — Pinterest 2:3 Pin & Facebook 1:1 Discussion Post
  try {
    const pin = engine.generatePinterestPin(mockProduct, 'PRODUCT_LAUNCH');
    assert.strictEqual(pin.platform, 'PINTEREST');
    assert.strictEqual(pin.dimensions.width, 1000);
    assert.strictEqual(pin.dimensions.height, 1500);
    assert.strictEqual(pin.destinationUrl, mockProduct.canonicalUrl);

    const fb = engine.generateFacebookPost(mockProduct, 'PRODUCT_LAUNCH');
    assert.strictEqual(fb.platform, 'FACEBOOK');
    assert.strictEqual(fb.dimensions.width, 1080);
    assert.strictEqual(fb.postText.includes('SkinEthix here:'), true);
    console.log('  ✔ TEST-2.1.6 (Pinterest 2:3 Pin & Facebook 1:1 Discussion Post): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-2.1.6 FAILED:', err.message);
    failed++;
  }

  // TEST 6: REQ-2.1.1 — Master Omnichannel Batch Generator (All 7 Channels)
  try {
    const batch = engine.generateAllPlatformAssets(mockProduct, 'PRODUCT_LAUNCH');
    assert.strictEqual(batch.productId, mockProduct.id);
    assert.strictEqual(batch.campaignType, 'PRODUCT_LAUNCH');
    assert.strictEqual(Object.keys(batch.channels).length, 7, 'Must generate assets for all 7 channels');
    assert.strictEqual(Boolean(batch.channels.instagram), true);
    assert.strictEqual(Boolean(batch.channels.twitter_x), true);
    assert.strictEqual(Boolean(batch.channels.youtube_shorts), true);
    assert.strictEqual(Boolean(batch.channels.linkedin), true);
    assert.strictEqual(Boolean(batch.channels.pinterest), true);
    assert.strictEqual(Boolean(batch.channels.facebook), true);
    assert.strictEqual(Boolean(batch.channels.reddit_threads), true);
    console.log('  ✔ TEST-2.1.1 (Master Omnichannel Batch Generation across All 7 Platforms): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-2.1.1 FAILED:', err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`PostPilot Test Summary: ${passed + failed} Total | ${passed} Passed | ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
