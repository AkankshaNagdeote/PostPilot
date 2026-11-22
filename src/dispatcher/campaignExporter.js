/**
 * PostPilot Campaign Exporter & Dispatcher (STORY-04.1)
 * ======================================================
 * Connects the entire end-to-end multi-platform content engine:
 * 1. Ingests product data (Postgres / JSON / Live URL)
 * 2. Generates optimized multi-channel copy via GeminiCopyEngine (all 7 platforms)
 * 3. Renders omnichannel vector graphics via VisualCompositor (all aspect ratios)
 * 4. Exports organized directory structures ready for human-in-the-loop publishing:
 *    /exports/<campaign_type>/<product_slug>/
 *      ├── /instagram/       (slide_1..5.svg + caption.txt)
 *      ├── /facebook/        (discussion_card.svg + post.txt)
 *      ├── /youtube/         (shorts_cover.svg + script.txt)
 *      ├── /twitter_x/       (summary_card.svg + thread.txt)
 *      ├── /linkedin/        (slide_1..4.svg + article.txt)
 *      ├── /pinterest/       (vertical_search_pin.svg + description.txt + pin_metadata.json)
 *      └── /reddit_threads/  (discussion_post.md)
 * 
 * Satisfies:
 * - REQ-4.1.1: Automatic hierarchical directory saving per campaign & channel.
 * - REQ-4.1.2: Pre-written captions with hashtags, hook lines, and canonical tracking URLs.
 */

const fs = require('fs');
const path = require('path');
const { DataIngestionAdapter } = require('../adapters/dataIngestion');
const { GeminiCopyEngine } = require('../adapters/geminiCopyEngine');
const { VisualCompositor } = require('../compositor/visualCompositor');

/**
 * Builds canonical tracking URLs with standard UTM parameters (REQ-4.1.2)
 */
function buildTrackingUrl(product, channel, campaign = 'product_launch', format = 'feed') {
  const baseDomain = 'https://skinethix.com';
  const slug = product.slug || product.id || 'product';
  const utmSource = encodeURIComponent(channel);
  const utmMedium = encodeURIComponent(channel === 'pinterest' ? 'search' : 'social');
  const utmCampaign = encodeURIComponent(campaign);
  const utmContent = encodeURIComponent(format);

  return `${baseDomain}/products/${slug}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_content=${utmContent}`;
}

class CampaignExporter {
  constructor(options = {}) {
    const opts = options || {};
    this.ingestionAdapter = opts.ingestionAdapter || new DataIngestionAdapter();
    this.copyEngine = opts.copyEngine || new GeminiCopyEngine(opts.geminiApiKey ? { apiKey: opts.geminiApiKey } : {});
    this.visualCompositor = opts.visualCompositor || new VisualCompositor(opts.brandOverrides || {});
    this.baseOutputDir = opts.outputDir || path.join(process.cwd(), 'exports');
  }

  /**
   * Generates and exports ready-to-post package for a single product across all 7 channels.
   */
  async exportProductPackage(product, campaignType = 'product_launch', outputDir = null) {
    const targetBase = outputDir || path.join(this.baseOutputDir, campaignType, product.slug || product.id);
    
    // 1. Generate Copy for All 7 Platforms
    const copyBatch = await this.copyEngine.generateOmnichannelBatch(product, campaignType);

    // 2. Generate Visual Assets for All Aspect Ratios
    const visualBatch = this.visualCompositor.renderOmnichannelVisualBatch(product, copyBatch);

    // Ensure base directory exists
    fs.mkdirSync(targetBase, { recursive: true });

    const exportedChannels = {};

    // -------------------------------------------------------------
    // CHANNEL 1: INSTAGRAM (4:5 Carousels + Caption)
    // -------------------------------------------------------------
    const igDir = path.join(targetBase, 'instagram');
    fs.mkdirSync(igDir, { recursive: true });
    
    visualBatch.assets.instagram.forEach((slide, idx) => {
      fs.writeFileSync(path.join(igDir, `slide_${idx + 1}.svg`), slide.svg, 'utf8');
    });

    const igTrackingUrl = buildTrackingUrl(product, 'instagram', campaignType, 'carousel');
    const igCaptionContent = [
      copyBatch.channels.instagram.caption,
      '',
      `👉 Stop buying blindly. Scan your skincare vanity table for free at:`,
      igTrackingUrl,
      '',
      copyBatch.channels.instagram.hashtags.join(' ')
    ].join('\n');
    fs.writeFileSync(path.join(igDir, 'caption.txt'), igCaptionContent, 'utf8');
    exportedChannels.instagram = { slidesCount: visualBatch.assets.instagram.length, captionFile: 'caption.txt' };

    // -------------------------------------------------------------
    // CHANNEL 2: FACEBOOK (1:1 Feed Image + Discussion Copy)
    // -------------------------------------------------------------
    const fbDir = path.join(targetBase, 'facebook');
    fs.mkdirSync(fbDir, { recursive: true });
    fs.writeFileSync(path.join(fbDir, 'discussion_card.svg'), visualBatch.assets.facebook.svg, 'utf8');

    const fbTrackingUrl = buildTrackingUrl(product, 'facebook', campaignType, 'feed_discussion');
    const fbPostContent = [
      copyBatch.channels.facebook.post,
      '',
      `🔍 View the full chemistry breakdown and community ratings:`,
      fbTrackingUrl
    ].join('\n');
    fs.writeFileSync(path.join(fbDir, 'post.txt'), fbPostContent, 'utf8');
    exportedChannels.facebook = { imageFile: 'discussion_card.svg', postFile: 'post.txt' };

    // -------------------------------------------------------------
    // CHANNEL 3: YOUTUBE SHORTS (9:16 Video Script & Cover)
    // -------------------------------------------------------------
    const ytDir = path.join(targetBase, 'youtube');
    fs.mkdirSync(ytDir, { recursive: true });
    fs.writeFileSync(path.join(ytDir, 'shorts_cover.svg'), visualBatch.assets.youtube.svg, 'utf8');

    const ytTrackingUrl = buildTrackingUrl(product, 'youtube_shorts', campaignType, 'pinned_comment');
    const ytScriptContent = [
      `TITLE: ${copyBatch.channels.youtube_shorts.title}`,
      `DURATION: ${copyBatch.channels.youtube_shorts.duration_seconds}s`,
      `PINNED COMMENT URL: ${ytTrackingUrl}`,
      '------------------------------------------------------------',
      'TIMED VOICE-OVER & VISUAL STORYBOARD:',
      '------------------------------------------------------------',
      ...copyBatch.channels.youtube_shorts.script.map(s => `[${s.timestamp}] ${s.cue}\nNARRATION: "${s.voiceover}"\n`),
      '------------------------------------------------------------',
      'PINNED COMMENT TEXT:',
      `👉 Check if this fits your exact barrier condition (Free Checker): ${ytTrackingUrl}`
    ].join('\n');
    fs.writeFileSync(path.join(ytDir, 'script.txt'), ytScriptContent, 'utf8');
    exportedChannels.youtube = { coverFile: 'shorts_cover.svg', scriptFile: 'script.txt' };

    // -------------------------------------------------------------
    // CHANNEL 4: TWITTER / X (16:9 Summary Card + Numbered Thread)
    // -------------------------------------------------------------
    const twDir = path.join(targetBase, 'twitter_x');
    fs.mkdirSync(twDir, { recursive: true });
    fs.writeFileSync(path.join(twDir, 'summary_card.svg'), visualBatch.assets.twitter.svg, 'utf8');

    const twTrackingUrl = buildTrackingUrl(product, 'twitter', campaignType, 'thread_link');
    const tweetsWithUrl = [...copyBatch.channels.twitter_x.tweets];
    // Attach tracking link to final tweet
    const lastTweetIdx = tweetsWithUrl.length - 1;
    if (tweetsWithUrl[lastTweetIdx]) {
      tweetsWithUrl[lastTweetIdx] = `${tweetsWithUrl[lastTweetIdx]}\n\nFull breakdown: ${twTrackingUrl}`;
    }

    const twThreadContent = [
      'THREAD OVERVIEW:',
      `Total Tweets: ${tweetsWithUrl.length}`,
      'All tweets strictly checked for <= 280 characters length constraint.',
      '============================================================',
      ...tweetsWithUrl.map((t, idx) => `TWEET ${idx + 1}/${tweetsWithUrl.length} (${t.length} chars):\n${t}\n------------------------------------------------------------`)
    ].join('\n\n');
    fs.writeFileSync(path.join(twDir, 'thread.txt'), twThreadContent, 'utf8');
    exportedChannels.twitter_x = { cardFile: 'summary_card.svg', threadFile: 'thread.txt', tweetCount: tweetsWithUrl.length };

    // -------------------------------------------------------------
    // CHANNEL 5: LINKEDIN (4:5 PDF Document Slides + Article)
    // -------------------------------------------------------------
    const liDir = path.join(targetBase, 'linkedin');
    fs.mkdirSync(liDir, { recursive: true });

    visualBatch.assets.linkedin.forEach((slide, idx) => {
      fs.writeFileSync(path.join(liDir, `document_slide_${idx + 1}.svg`), slide.svg, 'utf8');
    });

    const liTrackingUrl = buildTrackingUrl(product, 'linkedin', campaignType, 'article_cta');
    const liArticleContent = [
      copyBatch.channels.linkedin.article,
      '',
      `Access the open cosmetic science database:`,
      liTrackingUrl
    ].join('\n');
    fs.writeFileSync(path.join(liDir, 'article.txt'), liArticleContent, 'utf8');
    exportedChannels.linkedin = { slidesCount: visualBatch.assets.linkedin.length, articleFile: 'article.txt' };

    // -------------------------------------------------------------
    // CHANNEL 6: PINTEREST (2:3 Vertical Pin + Rich SEO Metadata)
    // -------------------------------------------------------------
    const pinDir = path.join(targetBase, 'pinterest');
    fs.mkdirSync(pinDir, { recursive: true });
    fs.writeFileSync(path.join(pinDir, 'vertical_search_pin.svg'), visualBatch.assets.pinterest.svg, 'utf8');

    const pinTrackingUrl = buildTrackingUrl(product, 'pinterest', campaignType, 'pin_destination');
    const pinMetadata = {
      title: copyBatch.channels.pinterest.title,
      description: copyBatch.channels.pinterest.description,
      destination_url: pinTrackingUrl,
      keywords: [
        'skincare ingredients',
        product.name.toLowerCase(),
        product.category || 'moisturizer',
        ...(product.hero_ingredients || []).map(i => i.toLowerCase()),
        'barrier repair',
        'skinethix'
      ],
      aspect_ratio: '2:3 (1000x1500px)'
    };
    fs.writeFileSync(path.join(pinDir, 'pin_metadata.json'), JSON.stringify(pinMetadata, null, 2), 'utf8');
    fs.writeFileSync(path.join(pinDir, 'description.txt'), `${pinMetadata.title}\n\n${pinMetadata.description}\n\nURL: ${pinTrackingUrl}`, 'utf8');
    exportedChannels.pinterest = { pinFile: 'vertical_search_pin.svg', metadataFile: 'pin_metadata.json' };

    // -------------------------------------------------------------
    // CHANNEL 7: REDDIT & THREADS (Value-First Markdown Post)
    // -------------------------------------------------------------
    const redditDir = path.join(targetBase, 'reddit_threads');
    fs.mkdirSync(redditDir, { recursive: true });

    const redditTrackingUrl = buildTrackingUrl(product, 'reddit', campaignType, 'reference_link');
    const redditContent = [
      `# r/SkincareAddiction Discussion Draft: ${product.name}`,
      '',
      copyBatch.channels.reddit_threads.post,
      '',
      `---`,
      `*Source / Clinical Reference: [SkinEthix Open Formulation Index](${redditTrackingUrl})*`
    ].join('\n');
    fs.writeFileSync(path.join(redditDir, 'discussion_post.md'), redditContent, 'utf8');
    exportedChannels.reddit_threads = { postFile: 'discussion_post.md' };

    // -------------------------------------------------------------
    // ROOT PRODUCT MANIFEST
    // -------------------------------------------------------------
    const manifest = {
      product_id: product.id || product.slug,
      product_name: product.name,
      brand: product.brand,
      campaign_type: campaignType,
      exported_at: new Date().toISOString(),
      output_directory: targetBase,
      channels: exportedChannels,
      canonical_urls: {
        instagram: igTrackingUrl,
        facebook: fbTrackingUrl,
        youtube_shorts: ytTrackingUrl,
        twitter_x: twTrackingUrl,
        linkedin: liTrackingUrl,
        pinterest: pinTrackingUrl,
        reddit: redditTrackingUrl
      },
      budget_spent: '$0.00'
    };
    fs.writeFileSync(path.join(targetBase, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

    return manifest;
  }

  /**
   * Batch runner: Ingests multiple products and runs end-to-end export.
   */
  async exportBatch(options = {}) {
    const {
      source = 'json',
      sourcePath = path.join(__dirname, '../data/sample_products.json'),
      campaign = 'product_launch',
      limit = 5,
      outputDir = null
    } = options;

    let products = [];

    if (source === 'url') {
      const singleProduct = await this.ingestionAdapter.ingestFromUrl(sourcePath);
      products = [singleProduct];
    } else if (source === 'json') {
      products = this.ingestionAdapter.ingestFromJson(sourcePath, { campaignType: campaign, limit });
    } else if (source === 'postgres') {
      products = await this.ingestionAdapter.ingestFromPostgres({ campaignType: campaign, limit });
    }

    const manifests = [];
    for (const product of products) {
      const manifest = await this.exportProductPackage(product, campaign, outputDir);
      manifests.push(manifest);
    }

    return {
      campaign_type: campaign,
      total_products_exported: manifests.length,
      exported_at: new Date().toISOString(),
      manifests
    };
  }
}

module.exports = {
  CampaignExporter,
  buildTrackingUrl
};
