/**
 * PostPilot — Multi-Channel Campaign Prompt Adapter & Copy Generator (Google AI Pro / Gemini Pro)
 * 
 * Complies with EARS Requirements:
 * - REQ-2.1.1 (State): While running PRODUCT_LAUNCH, format copy around "Stop Buying Blindly" narrative.
 * - REQ-2.1.2 (Event): When generating Instagram carousels, enforce 5-slide arc (Hook -> Problem -> Proof -> Fix -> CTA).
 * - REQ-2.1.3 (State): When generating YouTube/TikTok Shorts, output 30s timed script with [VISUAL CUE] markers.
 * - REQ-2.1.4 (State): When generating LinkedIn assets, output professional thought-leadership copy + PDF carousel outline.
 * - REQ-2.1.5 (State): When generating Twitter/X threads, format 4-to-6 tweets strictly <= 280 characters each.
 * - REQ-2.1.6: Output Facebook community discussion and Pinterest 2:3 SEO pin metadata.
 */

class GeminiCopyEngine {
  constructor(options = {}) {
    const opts = options || {};
    this.apiKey = opts.apiKey || process.env.GEMINI_API_KEY || null;
    this.model = opts.model || 'gemini-1.5-pro';
    this.customLlmClient = opts.customLlmClient || null;
  }

  /**
   * Normalize product properties supporting both camelCase and snake_case models
   */
  _normalizeProduct(product) {
    if (!product) return {};
    return {
      ...product,
      id: product.id || product.slug || 'prod-001',
      name: product.name || 'Hero Skincare Formula',
      brand: product.brand || 'SkinEthix',
      category: product.category || 'moisturizer',
      isFamous: product.isFamous !== undefined ? product.isFamous : (product.is_famous || false),
      forWho: Array.isArray(product.forWho) ? product.forWho : (Array.isArray(product.who_its_for) ? product.who_its_for : ['Normal skin', 'Dry barrier']),
      notForWho: Array.isArray(product.notForWho) ? product.notForWho : (Array.isArray(product.who_its_not_for) ? product.who_its_not_for : ['Severe cystic acne']),
      heroIngredients: Array.isArray(product.heroIngredients) ? product.heroIngredients : (Array.isArray(product.hero_ingredients) ? product.hero_ingredients : ['Ceramides', 'Niacinamide']),
      texture: product.texture || 'Velvet cream',
      scent: product.scent || '100% Fragrance-Free',
      priceUsd: product.priceUsd !== undefined ? product.priceUsd : (product.price_usd !== undefined ? product.price_usd : 18.00),
      rating: product.rating !== undefined ? product.rating : 4.8,
      canonicalUrl: product.canonicalUrl || product.canonical_url || `https://skinethix.com/products/${product.slug || product.id || 'product'}`
    };
  }

  /**
   * Build the master system prompt defining SkinEthix's brand voice
   */
  getBrandSystemPrompt(campaignType = 'PRODUCT_LAUNCH') {
    return `You are the Lead Scientific Copywriter for SkinEthix (skinethix.com).
Your tone is authoritative, science-backed, contrarian, yet deeply empathetic to consumers suffering from skin barrier damage and confusing marketing claims.
Campaign Focus: ${campaignType}.
Core Philosophy: "Stop Buying Blindly." Expose marketing hype with clinical chemistry, sensory data, and who products are ACTUALLY for vs NOT for.
Always include canonical links and relevant hashtags.`;
  }

  /**
   * 1. Instagram Generator (REQ-2.1.2)
   * Enforces 5-slide narrative arc: Hook -> Problem -> Proof -> Fix -> CTA
   */
  generateInstagramCarousel(rawProduct, campaignType = 'PRODUCT_LAUNCH') {
    const product = this._normalizeProduct(rawProduct);
    const hook = campaignType === 'PRODUCT_LAUNCH'
      ? `🚨 STOP using ${product.name} if your skin does THIS...`
      : `Why ${product.brand}'s best-seller might be damaging your skin barrier...`;

    const slides = [
      {
        slideNumber: 1,
        type: 'HOOK',
        headline: hook,
        body: `Most dermatologists recommend it, but if you have ${product.notForWho[0] || 'reactive skin'}, this formula can cause severe barrier disruption.`,
        tag: '🚨 VIRAL TEARDOWN'
      },
      {
        slideNumber: 2,
        type: 'PROBLEM',
        headline: `Who This Product is NOT For:`,
        body: `Avoid if you struggle with: ${product.notForWho.join(', ')}. Marketing claims say "for all skin types," but the chemistry says otherwise.`,
        tag: '❌ EXCLUSION ALERT'
      },
      {
        slideNumber: 3,
        type: 'DATA_PROOF',
        headline: `Clinical Ingredient & Sensory Audit:`,
        body: `Hero Actives: ${product.heroIngredients.join(', ') || 'Niacinamide, Ceramides'}\nTexture: ${product.texture}\nScent: ${product.scent}`,
        tag: '🔬 FORMULA AUDIT'
      },
      {
        slideNumber: 4,
        type: 'THE_FIX',
        headline: `Who It ACTUALLY Works For:`,
        body: `Thrives on: ${product.forWho.join(', ')}. If this matches your barrier, it delivers maximum results.`,
        tag: '✅ CLINICAL MATCH'
      },
      {
        slideNumber: 5,
        type: 'CTA',
        headline: `Don't Guess With Your Skin Barrier.`,
        body: `Search your exact vanity routine for free on SkinEthix.com to uncover ingredient conflicts and fungal acne triggers.`,
        tag: '🚀 TEST YOUR ROUTINE'
      }
    ];

    const caption = `Is your skincare secretly clogging your pores or inflaming your barrier? 🧴 We audited ${product.name} through our clinical database at SkinEthix.\n\n` +
      `Swipe through the 5 slides for the full chemical breakdown! 👉\n\n` +
      `🔍 Want to see if your current routine contains hidden red flags? Run your products through our free scanner at SkinEthix.com (link in bio)!\n\n` +
      `#skincarecommunity #barrierrepair #skincareroutine #ingredientanalysis #${product.brand.toLowerCase().replace(/[^a-z0-9]/g, '')} #skinethix`;

    const hashtags = ['#skincarecommunity', '#barrierrepair', '#skincareroutine', '#ingredientanalysis', `#${product.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}`, '#skinethix'];

    return {
      platform: 'INSTAGRAM',
      format: 'CAROUSEL_4_5',
      dimensions: { width: 1080, height: 1350, ratio: '4:5' },
      slideCount: slides.length,
      slides,
      caption,
      hashtags,
      ctaUrl: product.canonicalUrl
    };
  }

  /**
   * 2. Twitter / X Thread Generator (REQ-2.1.5)
   * Enforces 4-to-6 tweets, each strictly <= 280 characters
   */
  generateTwitterThread(rawProduct, campaignType = 'PRODUCT_LAUNCH') {
    const product = this._normalizeProduct(rawProduct);
    const tweets = [];

    // Tweet 1: Contrarian Hook
    tweets.push(
      `1/5 🧵 83% of people use skincare that actively hurts their barrier.\n\n` +
      `Today we're tearing down ${product.name} by ${product.brand} using hard chemistry.\n\n` +
      `Here is what beauty brands don't put on the front label 👇`
    );

    // Tweet 2: The Red Flags / Exclusion
    tweets.push(
      `2/5 The big red flag: Who it's NOT for.\n\n` +
      `If you have ${product.notForWho.slice(0, 2).join(' or ')}, stop using this immediately.\n\n` +
      `The emulsifiers and formulation structure can trigger acute congestion.`
    );

    // Tweet 3: The Chemistry & Sensory
    const ingredientsPreview = product.heroIngredients.slice(0, 3).join(', ') || 'Active Ceramides';
    tweets.push(
      `3/5 The Actives Breakdown:\n\n` +
      `• Actives: ${ingredientsPreview}\n` +
      `• Texture: ${product.texture}\n` +
      `• Fragrance: ${product.scent}\n\n` +
      `Price: $${product.priceUsd}. Is it worth it? Let's look at the data.`
    );

    // Tweet 4: Ideal Match
    tweets.push(
      `4/5 Who it actually works for:\n\n` +
      `If your skin profile is ${product.forWho.slice(0, 2).join(' or ')}, this formula is gold standard.\n\n` +
      `The problem isn't the product—it's buying for the wrong skin type.`
    );

    // Tweet 5: CTA / Link to SkinEthix
    tweets.push(
      `5/5 Never buy blindly again.\n\n` +
      `We audited 5,000+ skincare products so you don't have to guess.\n\n` +
      `Search your routine on SkinEthix:\n${product.canonicalUrl}`
    );

    // Safety constraint: Validate <= 280 chars
    tweets.forEach((tweet, i) => {
      if (tweet.length > 280) {
        throw new Error(`Tweet ${i + 1} exceeds 280 character limit (length: ${tweet.length})`);
      }
    });

    return {
      platform: 'TWITTER_X',
      format: 'THREAD_AND_16_9_CARD',
      dimensions: { width: 1200, height: 675, ratio: '16:9' },
      tweetCount: tweets.length,
      tweets,
      ctaUrl: product.canonicalUrl
    };
  }

  /**
   * 3. YouTube Shorts / TikTok Generator (REQ-2.1.3)
   * Enforces 30s timed video script with [VISUAL CUE] markers
   */
  generateYouTubeShortsScript(rawProduct, campaignType = 'PRODUCT_LAUNCH') {
    const product = this._normalizeProduct(rawProduct);
    const script = [
      {
        timestamp: '00:00 - 00:05',
        spokenText: `If you have persistent bumps or random redness, put down your ${product.name} right now.`,
        voiceover: `If you have persistent bumps or random redness, put down your ${product.name} right now.`,
        visualCue: `[VISUAL CUE: Creator holds product to camera with red ❌ stamp on screen]`,
        cue: `[VISUAL CUE: Creator holds product to camera with red ❌ stamp on screen]`
      },
      {
        timestamp: '00:05 - 00:12',
        spokenText: `Dermatologists love this, but if your skin is prone to ${product.notForWho[0] || 'fungal acne'}, this formula can feed the irritation.`,
        voiceover: `Dermatologists love this, but if your skin is prone to ${product.notForWho[0] || 'fungal acne'}, this formula can feed the irritation.`,
        visualCue: `[VISUAL CUE: Close-up on ingredient list highlighting active emulsifiers]`,
        cue: `[VISUAL CUE: Close-up on ingredient list highlighting active emulsifiers]`
      },
      {
        timestamp: '00:12 - 00:20',
        spokenText: `However! If you actually have ${product.forWho[0] || 'dry skin'}, the ${product.heroIngredients[0] || 'barrier actives'} will heal you in 48 hours.`,
        voiceover: `However! If you actually have ${product.forWho[0] || 'dry skin'}, the ${product.heroIngredients[0] || 'barrier actives'} will heal you in 48 hours.`,
        visualCue: `[VISUAL CUE: Macro texture swatch showing ${product.texture}]`,
        cue: `[VISUAL CUE: Macro texture swatch showing ${product.texture}]`
      },
      {
        timestamp: '00:20 - 00:30',
        spokenText: `Stop guessing with your skin. We audited 5,000 products on SkinEthix. Click the link in my bio to check your entire routine for free.`,
        voiceover: `Stop guessing with your skin. We audited 5,000 products on SkinEthix. Click the link in my bio to check your entire routine for free.`,
        visualCue: `[VISUAL CUE: Screen recording of skinethix.com routine analyzer in action]`,
        cue: `[VISUAL CUE: Screen recording of skinethix.com routine analyzer in action]`
      }
    ];

    return {
      platform: 'YOUTUBE_SHORTS',
      format: 'VIDEO_SCRIPT_9_16',
      dimensions: { width: 1080, height: 1920, ratio: '9:16' },
      title: `Don't Buy ${product.name} Before Watching This!`,
      estimatedDurationSeconds: 30,
      duration_seconds: 30,
      script,
      ctaUrl: product.canonicalUrl
    };
  }

  /**
   * 4. LinkedIn Thought Leadership & Document Carousel Generator (REQ-2.1.4)
   */
  generateLinkedInPost(rawProduct, campaignType = 'PRODUCT_LAUNCH') {
    const product = this._normalizeProduct(rawProduct);
    const postBody = `The $100 Billion cosmetics industry has a dirty secret: "For All Skin Types" is a marketing myth.\n\n` +
      `When we audited ${product.name} by ${product.brand} across clinical databases, the chemistry revealed a stark contrast:\n\n` +
      `🔬 Key Findings:\n` +
      `• Formulated with: ${product.heroIngredients.join(', ')}\n` +
      `• Effective for: ${product.forWho.join(', ')}\n` +
      `• High Risk for: ${product.notForWho.join(', ')}\n\n` +
      `At SkinEthix (skinethix.com), we believe consumers deserve full ingredient transparency before purchasing. That's why we open-sourced algorithmic analysis for over 5,000 products.\n\n` +
      `Check your routine here: ${product.canonicalUrl}\n\n` +
      `#BeautyTech #CosmeticChemistry #ConsumerAdvocacy #SkinEthix #Startup`;

    const pdfSlides = [
      { slide: 1, title: 'The Fallacy of "All Skin Types"', subtitle: `A chemical audit of ${product.name}` },
      { slide: 2, title: 'The Problem: Chemical Incompatibility', subtitle: `Why it triggers ${product.notForWho[0] || 'inflammation'}` },
      { slide: 3, title: 'The Solution: Algorithmic Matching', subtitle: 'How SkinEthix categorizes 5,000+ formulas' },
      { slide: 4, title: 'Full Transparency', subtitle: `Explore the data at ${product.canonicalUrl}` }
    ];

    return {
      platform: 'LINKEDIN',
      format: 'PDF_CAROUSEL_AND_ARTICLE',
      dimensions: { width: 1080, height: 1350, ratio: '4:5' },
      postBody,
      article: postBody,
      pdfSlides,
      ctaUrl: product.canonicalUrl
    };
  }

  /**
   * 5. Pinterest 2:3 Vertical Search Pin Generator (REQ-2.1.6)
   */
  generatePinterestPin(rawProduct, campaignType = 'PRODUCT_LAUNCH') {
    const product = this._normalizeProduct(rawProduct);
    const title = `${product.name} Ingredient Breakdown: Is It Safe For You?`;
    const description = `Full scientific audit of ${product.name} by ${product.brand}. Key actives: ${product.heroIngredients.join(', ')}. Find out if it triggers breakouts, texture feel (${product.texture}), and best skin type matches on SkinEthix.`;

    return {
      platform: 'PINTEREST',
      format: 'VERTICAL_SEARCH_PIN_2_3',
      dimensions: { width: 1000, height: 1500, ratio: '2:3' },
      pinTitle: title,
      title,
      pinDescription: description,
      description,
      keywords: ['skincare routine', 'ingredient checker', product.brand.toLowerCase(), 'barrier repair', 'fungal acne safe'],
      destinationUrl: product.canonicalUrl
    };
  }

  /**
   * 6. Facebook Community Discussion Generator (REQ-2.1.6)
   */
  generateFacebookPost(rawProduct, campaignType = 'PRODUCT_LAUNCH') {
    const product = this._normalizeProduct(rawProduct);
    const postText = `Has anyone else tried ${product.name} by ${product.brand}? 🤔\n\n` +
      `We see so many mixed reviews on this! Here's what our clinical database at SkinEthix found:\n\n` +
      `✅ AMAZING FOR: ${product.forWho.join(', ')}\n` +
      `❌ BE CAREFUL IF: You have ${product.notForWho.join(', ')}\n\n` +
      `Texture feel: ${product.texture} (${product.scent})\n\n` +
      `What has your experience been with this product? Drop your skin type below! 👇\n\n` +
      `You can check full ingredient safety ratings on SkinEthix here: ${product.canonicalUrl}`;

    return {
      platform: 'FACEBOOK',
      format: 'COMMUNITY_DISCUSSION_1_1',
      dimensions: { width: 1080, height: 1080, ratio: '1:1' },
      postText,
      post: postText,
      ctaUrl: product.canonicalUrl
    };
  }

  /**
   * 7. Reddit & Threads Conversational Generator (REQ-2.1.6)
   */
  generateRedditThreadsPost(rawProduct, campaignType = 'PRODUCT_LAUNCH') {
    const product = this._normalizeProduct(rawProduct);
    const markdown = `**Honest Ingredient Breakdown: ${product.name}**\n\n` +
      `Seeing a lot of debate on whether this is worth the $${product.priceUsd}. Here's the objective formulation data:\n\n` +
      `* **Hero Ingredients:** ${product.heroIngredients.join(', ')}\n` +
      `* **Texture:** ${product.texture}\n` +
      `* **Who should use it:** ${product.forWho.join(', ')}\n` +
      `* **Who should avoid:** ${product.notForWho.join(', ')}\n\n` +
      `Verified via SkinEthix open database: ${product.canonicalUrl}`;

    return {
      platform: 'REDDIT_THREADS',
      format: 'TEXT_FIRST_BREAKDOWN',
      markdown,
      post: markdown,
      ctaUrl: product.canonicalUrl
    };
  }

  /**
   * Master Batch Generator: Generates all 7 channel assets for a product
   */
  generateAllPlatformAssets(rawProduct, campaignType = 'PRODUCT_LAUNCH') {
    const product = this._normalizeProduct(rawProduct);
    return {
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      campaignType,
      generatedAt: new Date().toISOString(),
      channels: {
        instagram: this.generateInstagramCarousel(product, campaignType),
        twitter_x: this.generateTwitterThread(product, campaignType),
        youtube_shorts: this.generateYouTubeShortsScript(product, campaignType),
        linkedin: this.generateLinkedInPost(product, campaignType),
        pinterest: this.generatePinterestPin(product, campaignType),
        facebook: this.generateFacebookPost(product, campaignType),
        reddit_threads: this.generateRedditThreadsPost(product, campaignType)
      }
    };
  }

  /**
   * Alias for generateAllPlatformAssets
   */
  generateOmnichannelBatch(rawProduct, campaignType = 'PRODUCT_LAUNCH') {
    return this.generateAllPlatformAssets(rawProduct, campaignType);
  }
}

module.exports = { GeminiCopyEngine };
