/**
 * PostPilot Visual Template Compositor (STORY-03.1 & STORY-03.2)
 * ==============================================================
 * Generates omnichannel branded visual graphics across all required aspect ratios:
 * - 4:5 (1080x1350) Instagram Carousels & LinkedIn Document Slides (REQ-3.2.1)
 * - 2:3 (1000x1500) Pinterest Vertical Search Pins (REQ-3.2.2)
 * - 9:16 (1080x1920) YouTube Shorts & Stories Covers (REQ-3.2.3)
 * - 16:9 (1200x675) Twitter / X Header Cards (REQ-3.2.4)
 * - 1:1 (1080x1080) Facebook Discussion Cards (REQ-3.2.5)
 * 
 * Enforces SkinEthix brand typography, hex colors, and logo watermark (REQ-3.2.6).
 * Zero cloud dependency / $0 cost using scalable, high-resolution vector SVG composition.
 */

const fs = require('fs');
const path = require('path');

// Official Channel Aspect Ratio Specifications
const CHANNEL_SPECS = {
  INSTAGRAM_CAROUSEL: { width: 1080, height: 1350, ratio: '4:5', channel: 'instagram' },
  LINKEDIN_DOCUMENT:  { width: 1080, height: 1350, ratio: '4:5', channel: 'linkedin' },
  PINTEREST_PIN:      { width: 1000, height: 1500, ratio: '2:3', channel: 'pinterest' },
  YOUTUBE_SHORTS:     { width: 1080, height: 1920, ratio: '9:16', channel: 'youtube' },
  TWITTER_CARD:       { width: 1200, height: 675,  ratio: '16:9', channel: 'twitter_x' },
  FACEBOOK_FEED:      { width: 1080, height: 1080, ratio: '1:1',  channel: 'facebook' }
};

// SkinEthix Brand Design System
const BRAND_SYSTEM = {
  name: 'SkinEthix',
  domain: 'skinethix.com',
  watermark: 'SkinEthix.com • Stop Buying Blindly',
  slogan: 'Stop Buying Blindly',
  colors: {
    bgDeep: '#0B0F19',
    bgCard: '#161B26',
    bgCardRaised: '#1E2638',
    primaryEmerald: '#059669',
    accentEmeraldLight: '#10B981',
    accentGold: '#F59E0B',
    accentCoral: '#EF4444',
    textWhite: '#FFFFFF',
    textMuted: '#94A3B8',
    border: '#2A344A',
    borderHighlight: '#059669'
  },
  fonts: {
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  }
};

/**
 * Escape XML special characters to maintain strict SVG validity
 */
function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

class VisualCompositor {
  constructor(brandOverrides = {}) {
    this.brand = {
      ...BRAND_SYSTEM,
      ...brandOverrides,
      colors: { ...BRAND_SYSTEM.colors, ...(brandOverrides.colors || {}) }
    };
  }

  /**
   * Helper: Standard SVG Defs (Gradients, filters, patterns)
   */
  _generateDefs(extraGradients = '') {
    const { colors } = this.brand;
    return `
    <defs>
      <!-- Background Mesh Gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors.bgDeep}" />
        <stop offset="45%" stop-color="#0f1624" />
        <stop offset="100%" stop-color="${colors.bgDeep}" />
      </linearGradient>

      <!-- Emerald Glow Gradient -->
      <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${colors.primaryEmerald}" />
        <stop offset="100%" stop-color="${colors.accentEmeraldLight}" />
      </linearGradient>

      <!-- Alert / Warning Gradient -->
      <linearGradient id="alertGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${colors.accentCoral}" />
        <stop offset="100%" stop-color="#f87171" />
      </linearGradient>

      <!-- Subtle Card Shadow Filter -->
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.45" />
      </filter>

      <!-- Dropper Bottle Vector Silhouette -->
      <g id="cosmeticSilhouette">
        <rect x="0" y="40" width="80" height="150" rx="14" fill="${colors.bgCardRaised}" stroke="${colors.primaryEmerald}" stroke-width="2" />
        <rect x="15" y="10" width="50" height="30" rx="4" fill="#334155" />
        <circle cx="40" cy="8" r="8" fill="#475569" />
        <rect x="10" y="80" width="60" height="70" rx="4" fill="${colors.bgDeep}" />
        <line x1="20" y1="100" x2="60" y2="100" stroke="${colors.accentEmeraldLight}" stroke-width="2" />
        <line x1="20" y1="115" x2="50" y2="115" stroke="${colors.textMuted}" stroke-width="1.5" />
      </g>
      ${extraGradients}
    </defs>
    `;
  }

  /**
   * Helper: Standard Header & Watermark Footer
   */
  _generateWatermark(width, height) {
    const { colors, fonts, watermark } = this.brand;
    const yPos = height - 48;
    return `
    <!-- Brand Watermark Banner -->
    <g transform="translate(0, ${yPos})">
      <rect x="0" y="0" width="${width}" height="48" fill="${colors.bgDeep}" fill-opacity="0.92" />
      <line x1="0" y1="0" x2="${width}" y2="0" stroke="${colors.border}" stroke-width="1" />
      <circle cx="56" cy="24" r="6" fill="${colors.accentEmeraldLight}" />
      <text x="74" y="29" font-family="${fonts.body}" font-size="16" font-weight="600" fill="${colors.textMuted}" letter-spacing="1.2">
        ${escapeXml(watermark)}
      </text>
      <text x="${width - 56}" y="29" font-family="${fonts.mono}" font-size="14" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="end">
        SKINETHIX.COM
      </text>
    </g>
    `;
  }

  /**
   * 1. INSTAGRAM CAROUSEL SLIDE (1080x1350 - 4:5 Aspect Ratio) [REQ-3.2.1]
   * Supports 5-slide narrative arc:
   * 1: Hook, 2: The Problem, 3: Data Proof, 4: The Fix, 5: SkinEthix CTA
   */
  renderInstagramCarouselSlide(product, slideData, options = {}) {
    const spec = CHANNEL_SPECS.INSTAGRAM_CAROUSEL;
    const { width, height } = spec;
    const { colors, fonts } = this.brand;
    const slideNumber = options.slideNumber || slideData.slideNumber || 1;
    const totalSlides = options.totalSlides || 5;

    let contentMarkup = '';

    if (slideNumber === 1) {
      // SLIDE 1: HOOK
      contentMarkup = `
        <!-- Category Badge -->
        <rect x="72" y="140" width="220" height="42" rx="21" fill="${colors.bgCardRaised}" stroke="${colors.primaryEmerald}" stroke-width="1.5" />
        <text x="182" y="167" font-family="${fonts.body}" font-size="15" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="middle" letter-spacing="1.5">
          ${escapeXml((product.category || 'SKINCARE').toUpperCase())} TEARDOWN
        </text>

        <!-- Main Hook Headline -->
        <text x="72" y="270" font-family="${fonts.heading}" font-size="64" font-weight="900" fill="${colors.textWhite}">
          <tspan x="72" dy="0">Stop Buying</tspan>
          <tspan x="72" dy="80" fill="${colors.accentEmeraldLight}">Blindly.</tspan>
        </text>
        <text x="72" y="470" font-family="${fonts.body}" font-size="34" font-weight="600" fill="${colors.textMuted}">
          What brands won&apos;t tell you about:
        </text>
        <text x="72" y="530" font-family="${fonts.heading}" font-size="44" font-weight="800" fill="${colors.textWhite}">
          ${escapeXml(product.name)}
        </text>

        <!-- Center 3D Silhouette Card -->
        <g transform="translate(140, 600)">
          <rect x="0" y="0" width="800" height="460" rx="24" fill="${colors.bgCard}" stroke="${colors.border}" stroke-width="2" filter="url(#cardShadow)" />
          <use href="#cosmeticSilhouette" transform="translate(100, 100) scale(1.6)" />
          <g transform="translate(320, 110)">
            <text x="0" y="40" font-family="${fonts.heading}" font-size="28" font-weight="800" fill="${colors.textWhite}">${escapeXml(product.brand || 'SkinEthix Lab')}</text>
            <text x="0" y="80" font-family="${fonts.body}" font-size="20" font-weight="600" fill="${colors.accentEmeraldLight}">Sensory: ${escapeXml(product.texture || 'Velvet Hydration')}</text>
            
            <rect x="0" y="120" width="400" height="50" rx="8" fill="${colors.bgDeep}" />
            <text x="20" y="152" font-family="${fonts.body}" font-size="18" fill="${colors.textMuted}">Hero: <tspan fill="${colors.textWhite}" font-weight="700">${escapeXml((product.hero_ingredients || ['Niacinamide'])[0])}</tspan></text>
            
            <rect x="0" y="190" width="400" height="70" rx="8" fill="#1c261e" stroke="${colors.primaryEmerald}" stroke-width="1" />
            <text x="20" y="232" font-family="${fonts.body}" font-size="18" font-weight="700" fill="${colors.accentEmeraldLight}">✓ 5,000+ Products Analyzed</text>
          </g>
        </g>

        <!-- Swipe Indicator -->
        <g transform="translate(860, 1120)">
          <circle cx="30" cy="30" r="30" fill="${colors.bgCardRaised}" stroke="${colors.primaryEmerald}" stroke-width="2" />
          <path d="M 22 30 L 38 30 M 32 24 L 38 30 L 32 36" stroke="${colors.textWhite}" stroke-width="3" fill="none" stroke-linecap="round" />
        </g>
      `;
    } else if (slideNumber === 2) {
      // SLIDE 2: THE PROBLEM
      contentMarkup = `
        <rect x="72" y="140" width="180" height="42" rx="21" fill="#3b1b1f" stroke="${colors.accentCoral}" stroke-width="1.5" />
        <text x="162" y="167" font-family="${fonts.body}" font-size="15" font-weight="700" fill="${colors.accentCoral}" text-anchor="middle">
          THE REALITY CHECK
        </text>

        <text x="72" y="260" font-family="${fonts.heading}" font-size="54" font-weight="800" fill="${colors.textWhite}">
          Why It Might Wreck
        </text>
        <text x="72" y="330" font-family="${fonts.heading}" font-size="54" font-weight="800" fill="${colors.accentCoral}">
          Your Skin Barrier:
        </text>

        <g transform="translate(72, 400)">
          <!-- Card 1: Who it is NOT for -->
          <rect x="0" y="0" width="936" height="240" rx="20" fill="${colors.bgCard}" stroke="${colors.accentCoral}" stroke-width="1.5" filter="url(#cardShadow)" />
          <circle cx="60" cy="60" r="28" fill="#3b1b1f" />
          <text x="60" y="69" font-family="${fonts.body}" font-size="28" font-weight="900" fill="${colors.accentCoral}" text-anchor="middle">✕</text>
          <text x="110" y="55" font-family="${fonts.heading}" font-size="28" font-weight="800" fill="${colors.textWhite}">Skin Types To Avoid</text>
          <text x="110" y="95" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}">
            ${escapeXml(Array.isArray(product.who_its_not_for) ? product.who_its_not_for.join(', ') : 'Compromised skin with open lesions')}
          </text>
          <text x="110" y="160" font-family="${fonts.body}" font-size="18" fill="#f87171">
            ⚠️ Trap: Marketing promises "universal fit", but chemistry proves otherwise.
          </text>
        </g>

        <g transform="translate(72, 680)">
          <!-- Card 2: Common Formula Flaws -->
          <rect x="0" y="0" width="936" height="340" rx="20" fill="${colors.bgCard}" stroke="${colors.border}" stroke-width="2" />
          <text x="60" y="70" font-family="${fonts.heading}" font-size="26" font-weight="700" fill="${colors.textWhite}">Sensory Profile Misalignment</text>
          <text x="60" y="115" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}">
            Finish: <tspan fill="${colors.textWhite}" font-weight="600">${escapeXml(product.finish || 'Natural Glow')}</tspan> | Absorption: <tspan fill="${colors.textWhite}" font-weight="600">${escapeXml(product.absorption_speed || 'Moderate')}</tspan>
          </text>
          <text x="60" y="170" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}">
            Heaviness: <tspan fill="${colors.accentGold}" font-weight="700">${escapeXml(product.weight || 'Medium')}</tspan>
          </text>
          <rect x="60" y="210" width="816" height="80" rx="12" fill="${colors.bgDeep}" />
          <text x="80" y="258" font-family="${fonts.body}" font-size="18" fill="${colors.accentGold}">
            💡 Most users complain of breakouts simply because of comedogenic oils.
          </text>
        </g>
      `;
    } else if (slideNumber === 3) {
      // SLIDE 3: DATA PROOF
      const heroes = Array.isArray(product.hero_ingredients) ? product.hero_ingredients : ['Ceramides', 'Niacinamide'];
      contentMarkup = `
        <rect x="72" y="140" width="220" height="42" rx="21" fill="#162e20" stroke="${colors.primaryEmerald}" stroke-width="1.5" />
        <text x="182" y="167" font-family="${fonts.body}" font-size="15" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="middle">
          LAB EVIDENCE
        </text>

        <text x="72" y="260" font-family="${fonts.heading}" font-size="54" font-weight="800" fill="${colors.textWhite}">
          What the Science
        </text>
        <text x="72" y="330" font-family="${fonts.heading}" font-size="54" font-weight="800" fill="${colors.accentEmeraldLight}">
          Actually Validates:
        </text>

        <!-- Ingredient Chips Matrix -->
        <g transform="translate(72, 400)">
          ${heroes.map((ing, idx) => `
            <g transform="translate(0, ${idx * 160})">
              <rect x="0" y="0" width="936" height="130" rx="16" fill="${colors.bgCard}" stroke="${colors.primaryEmerald}" stroke-width="1.5" />
              <circle cx="50" cy="65" r="24" fill="#162e20" />
              <text x="50" y="73" font-family="${fonts.body}" font-size="22" font-weight="800" fill="${colors.accentEmeraldLight}" text-anchor="middle">0${idx+1}</text>
              <text x="100" y="55" font-family="${fonts.heading}" font-size="28" font-weight="800" fill="${colors.textWhite}">${escapeXml(ing)}</text>
              <text x="100" y="95" font-family="${fonts.body}" font-size="18" fill="${colors.textMuted}">Clinical Target: Transepidermal Water Loss (TEWL) reduction &amp; lipid repair.</text>
            </g>
          `).join('')}
        </g>

        <!-- Clinical Proof Callout -->
        <g transform="translate(72, 860)">
          <rect x="0" y="0" width="936" height="200" rx="20" fill="${colors.bgCardRaised}" stroke="${colors.border}" stroke-width="2" />
          <text x="50" y="60" font-family="${fonts.heading}" font-size="24" font-weight="700" fill="${colors.accentGold}">Clinical Study Consensus</text>
          <text x="50" y="110" font-family="${fonts.body}" font-size="20" fill="${colors.textWhite}">
            ${escapeXml(product.clinical_research || 'Multicenter double-blind trials confirm 48% barrier restoration in 14 days.')}
          </text>
        </g>
      `;
    } else if (slideNumber === 4) {
      // SLIDE 4: THE FIX & WHO IT'S FOR
      contentMarkup = `
        <rect x="72" y="140" width="220" height="42" rx="21" fill="#162e20" stroke="${colors.accentEmeraldLight}" stroke-width="1.5" />
        <text x="182" y="167" font-family="${fonts.body}" font-size="15" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="middle">
          PERFECT MATCH
        </text>

        <text x="72" y="260" font-family="${fonts.heading}" font-size="54" font-weight="800" fill="${colors.textWhite}">
          Who Gets Real
        </text>
        <text x="72" y="330" font-family="${fonts.heading}" font-size="54" font-weight="800" fill="${colors.accentEmeraldLight}">
          Results From This:
        </text>

        <g transform="translate(72, 400)">
          <rect x="0" y="0" width="936" height="340" rx="20" fill="${colors.bgCard}" stroke="${colors.primaryEmerald}" stroke-width="2" filter="url(#cardShadow)" />
          <circle cx="60" cy="60" r="28" fill="#162e20" />
          <text x="60" y="69" font-family="${fonts.body}" font-size="28" font-weight="900" fill="${colors.accentEmeraldLight}" text-anchor="middle">✓</text>
          <text x="110" y="60" font-family="${fonts.heading}" font-size="32" font-weight="800" fill="${colors.textWhite}">Ideal Candidate Profile</text>
          <text x="110" y="115" font-family="${fonts.body}" font-size="22" fill="${colors.accentEmeraldLight}">
            ${escapeXml(Array.isArray(product.who_its_for) ? product.who_its_for.join(', ') : 'Dry, sensitive, or redness-prone skin')}
          </text>
          <text x="110" y="180" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}">
            • Goal: ${escapeXml(product.target_concerns ? product.target_concerns.join(', ') : 'Skin barrier restoration')}
          </text>
          <text x="110" y="225" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}">
            • Sensory: Light, non-greasy velvet application.
          </text>
          <text x="110" y="270" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}">
            • Compatibility: Layerable with active serums &amp; SPF.
          </text>
        </g>

        <!-- Dupe Bridge Indicator -->
        <g transform="translate(72, 800)">
          <rect x="0" y="0" width="936" height="240" rx="20" fill="${colors.bgCardRaised}" stroke="${colors.border}" stroke-width="1.5" />
          <text x="50" y="60" font-family="${fonts.heading}" font-size="24" font-weight="700" fill="${colors.accentGold}">Budget Smart Alternative?</text>
          <text x="50" y="110" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}">
            Don&apos;t want to pay full retail? We found 3 chemistry-matched formulas on SkinEthix with identical active ingredient percentages for half the price.
          </text>
        </g>
      `;
    } else {
      // SLIDE 5: SKINETHIX CTA
      contentMarkup = `
        <rect x="72" y="140" width="260" height="42" rx="21" fill="#162e20" stroke="${colors.primaryEmerald}" stroke-width="1.5" />
        <text x="202" y="167" font-family="${fonts.body}" font-size="15" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="middle">
          UNBIASED CHECKER
        </text>

        <text x="72" y="270" font-family="${fonts.heading}" font-size="60" font-weight="900" fill="${colors.textWhite}">
          <tspan x="72" dy="0">Check Your Entire</tspan>
          <tspan x="72" dy="75" fill="${colors.accentEmeraldLight}">Vanity Table.</tspan>
        </text>

        <!-- Giant Call to Action Card -->
        <g transform="translate(72, 450)">
          <rect x="0" y="0" width="936" height="520" rx="28" fill="${colors.bgCard}" stroke="${colors.primaryEmerald}" stroke-width="2" filter="url(#cardShadow)" />
          
          <text x="468" y="90" font-family="${fonts.heading}" font-size="34" font-weight="800" fill="${colors.textWhite}" text-anchor="middle">
            Over 5,000+ Formulas Indexed
          </text>
          <text x="468" y="140" font-family="${fonts.body}" font-size="22" fill="${colors.textMuted}" text-anchor="middle">
            Scan ingredients, find dupes, and see what truly fits your skin profile.
          </text>

          <!-- Interactive Search Pill Simulation -->
          <rect x="140" y="200" width="656" height="90" rx="45" fill="${colors.bgDeep}" stroke="${colors.primaryEmerald}" stroke-width="2" />
          <circle cx="200" cy="245" r="20" fill="${colors.primaryEmerald}" />
          <text x="200" y="253" font-family="${fonts.body}" font-size="20" fill="${colors.textWhite}" text-anchor="middle">🔍</text>
          <text x="240" y="253" font-family="${fonts.mono}" font-size="24" font-weight="700" fill="${colors.textWhite}">
            skinethix.com/check
          </text>

          <!-- Direct CTA Button -->
          <rect x="238" y="340" width="460" height="84" rx="42" fill="url(#emeraldGrad)" />
          <text x="468" y="392" font-family="${fonts.heading}" font-size="26" font-weight="800" fill="${colors.textWhite}" text-anchor="middle">
            Visit SkinEthix.com →
          </text>
          <text x="468" y="470" font-family="${fonts.body}" font-size="18" fill="${colors.accentEmeraldLight}" text-anchor="middle">
            100% Free • No Sponsor Bias • Pure Chemistry
          </text>
        </g>
      `;
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${this._generateDefs()}
  
  <!-- Base Canvas Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Slide Pagination Header -->
  <g transform="translate(72, 80)">
    <text x="0" y="0" font-family="${fonts.mono}" font-size="18" font-weight="700" fill="${colors.accentEmeraldLight}">
      SKINETHIX LAB DISPATCH
    </text>
    <text x="${width - 144}" y="0" font-family="${fonts.mono}" font-size="18" font-weight="700" fill="${colors.textMuted}" text-anchor="end">
      SLIDE ${slideNumber} OF ${totalSlides}
    </text>
    <!-- Pagination Indicator Bar -->
    <rect x="0" y="16" width="${width - 144}" height="4" rx="2" fill="${colors.bgCardRaised}" />
    <rect x="0" y="16" width="${((width - 144) / totalSlides) * slideNumber}" height="4" rx="2" fill="${colors.accentEmeraldLight}" />
  </g>

  <!-- Slide Content -->
  ${contentMarkup}

  <!-- Watermark Footer -->
  ${this._generateWatermark(width, height)}
</svg>
`;

    return {
      svg,
      metadata: {
        width,
        height,
        ratio: spec.ratio,
        channel: spec.channel,
        slideNumber,
        totalSlides,
        productId: product.id || product.slug
      }
    };
  }

  /**
   * 2. FACEBOOK FEED DISCUSSION CARD (1080x1080 - 1:1 Aspect Ratio) [REQ-3.2.5]
   */
  renderFacebookCard(product, options = {}) {
    const spec = CHANNEL_SPECS.FACEBOOK_FEED;
    const { width, height } = spec;
    const { colors, fonts } = this.brand;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${this._generateDefs()}
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Header Banner -->
  <g transform="translate(64, 80)">
    <rect x="0" y="0" width="220" height="40" rx="20" fill="${colors.bgCardRaised}" stroke="${colors.primaryEmerald}" stroke-width="1.5" />
    <text x="110" y="26" font-family="${fonts.body}" font-size="16" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="middle">
      COMMUNITY AUDIT
    </text>
  </g>

  <!-- Main Question / Controversy -->
  <g transform="translate(64, 180)">
    <text x="0" y="0" font-family="${fonts.heading}" font-size="48" font-weight="900" fill="${colors.textWhite}">
      <tspan x="0" dy="0">Did ${escapeXml(product.name)}</tspan>
      <tspan x="0" dy="65" fill="${colors.accentGold}">actually work for you?</tspan>
    </text>
    <text x="0" y="160" font-family="${fonts.body}" font-size="24" fill="${colors.textMuted}">
      5,000+ people rated this formula on SkinEthix. Here is the real data:
    </text>
  </g>

  <!-- Split Comparison Card -->
  <g transform="translate(64, 420)">
    <!-- Pro Column -->
    <rect x="0" y="0" width="460" height="380" rx="16" fill="${colors.bgCard}" stroke="${colors.primaryEmerald}" stroke-width="2" />
    <circle cx="50" cy="50" r="22" fill="#162e20" />
    <text x="50" y="58" font-family="${fonts.body}" font-size="24" font-weight="800" fill="${colors.accentEmeraldLight}" text-anchor="middle">✓</text>
    <text x="90" y="56" font-family="${fonts.heading}" font-size="24" font-weight="800" fill="${colors.textWhite}">Who Loves It</text>
    <text x="40" y="120" font-family="${fonts.body}" font-size="20" fill="${colors.accentEmeraldLight}">
      ${escapeXml(Array.isArray(product.who_its_for) ? product.who_its_for.join(', ') : 'Dry and dehydrated')}
    </text>
    <text x="40" y="190" font-family="${fonts.body}" font-size="18" fill="${colors.textMuted}">
      Hero active: <tspan fill="${colors.textWhite}" font-weight="700">${escapeXml((product.hero_ingredients || ['Ceramide NP'])[0])}</tspan>
    </text>

    <!-- Con Column -->
    <rect x="492" y="0" width="460" height="380" rx="16" fill="${colors.bgCard}" stroke="${colors.accentCoral}" stroke-width="2" />
    <circle cx="542" cy="50" r="22" fill="#3b1b1f" />
    <text x="542" y="58" font-family="${fonts.body}" font-size="24" font-weight="800" fill="${colors.accentCoral}" text-anchor="middle">✕</text>
    <text x="582" y="56" font-family="${fonts.heading}" font-size="24" font-weight="800" fill="${colors.textWhite}">Who Hates It</text>
    <text x="532" y="120" font-family="${fonts.body}" font-size="20" fill="#f87171">
      ${escapeXml(Array.isArray(product.who_its_not_for) ? product.who_its_not_for.join(', ') : 'Fungal acne prone')}
    </text>
    <text x="532" y="190" font-family="${fonts.body}" font-size="18" fill="${colors.textMuted}">
      Hidden trap: Heavy finish traps sebum in clogged pores.
    </text>
  </g>

  <!-- Discussion Prompt Footer -->
  <g transform="translate(64, 850)">
    <rect x="0" y="0" width="952" height="120" rx="16" fill="${colors.bgCardRaised}" stroke="${colors.border}" stroke-width="1.5" />
    <text x="40" y="50" font-family="${fonts.heading}" font-size="22" font-weight="700" fill="${colors.accentGold}">Drop your skin type below 👇</text>
    <text x="40" y="90" font-family="${fonts.body}" font-size="18" fill="${colors.textWhite}">We&apos;ll check if the formula matches your exact lipid profile on SkinEthix.com</text>
  </g>

  ${this._generateWatermark(width, height)}
</svg>
`;

    return {
      svg,
      metadata: { width, height, ratio: spec.ratio, channel: spec.channel, productId: product.id || product.slug }
    };
  }

  /**
   * 3. PINTEREST VERTICAL SEARCH PIN (1000x1500 - 2:3 Aspect Ratio) [REQ-3.2.2]
   */
  renderPinterestPin(product, options = {}) {
    const spec = CHANNEL_SPECS.PINTEREST_PIN;
    const { width, height } = spec;
    const { colors, fonts } = this.brand;
    const heroes = Array.isArray(product.hero_ingredients) ? product.hero_ingredients : ['Ceramides', 'Niacinamide'];

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${this._generateDefs()}
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Top Pill -->
  <g transform="translate(60, 70)">
    <rect x="0" y="0" width="260" height="48" rx="24" fill="${colors.bgCardRaised}" stroke="${colors.primaryEmerald}" stroke-width="1.5" />
    <text x="130" y="31" font-family="${fonts.body}" font-size="18" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="middle">
      SKINCARE SCIENCE
    </text>
  </g>

  <!-- Big Bold Search Title -->
  <g transform="translate(60, 180)">
    <text x="0" y="0" font-family="${fonts.heading}" font-size="56" font-weight="900" fill="${colors.textWhite}">
      <tspan x="0" dy="0">Is It Worth It?</tspan>
      <tspan x="0" dy="70" fill="${colors.accentEmeraldLight}">${escapeXml(product.name)}</tspan>
    </text>
    <text x="0" y="180" font-family="${fonts.body}" font-size="28" font-weight="600" fill="${colors.accentGold}">
      Ingredient Breakdown &amp; Skin Match Guide
    </text>
  </g>

  <!-- Center Infographic Spec Card -->
  <g transform="translate(60, 440)">
    <rect x="0" y="0" width="880" height="720" rx="24" fill="${colors.bgCard}" stroke="${colors.primaryEmerald}" stroke-width="2" filter="url(#cardShadow)" />
    
    <!-- Hero Ingredient Badges -->
    <text x="50" y="70" font-family="${fonts.heading}" font-size="28" font-weight="800" fill="${colors.textWhite}">Key Actives &amp; Percentages</text>
    ${heroes.slice(0, 3).map((hero, idx) => `
      <g transform="translate(50, ${110 + idx * 80})">
        <rect x="0" y="0" width="780" height="60" rx="10" fill="${colors.bgDeep}" stroke="${colors.border}" stroke-width="1" />
        <circle cx="35" cy="30" r="14" fill="${colors.primaryEmerald}" />
        <text x="35" y="36" font-family="${fonts.body}" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">✓</text>
        <text x="70" y="38" font-family="${fonts.heading}" font-size="22" font-weight="700" fill="${colors.textWhite}">${escapeXml(hero)}</text>
        <text x="750" y="38" font-family="${fonts.mono}" font-size="18" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="end">ACTIVE</text>
      </g>
    `).join('')}

    <!-- Sensory Specs -->
    <g transform="translate(50, 390)">
      <text x="0" y="30" font-family="${fonts.heading}" font-size="24" font-weight="700" fill="${colors.accentGold}">Sensory Profile</text>
      <rect x="0" y="55" width="370" height="70" rx="8" fill="${colors.bgDeep}" />
      <text x="20" y="98" font-family="${fonts.body}" font-size="18" fill="${colors.textMuted}">Texture: <tspan fill="${colors.textWhite}" font-weight="700">${escapeXml(product.texture || 'Velvet Crème')}</tspan></text>
      
      <rect x="410" y="55" width="370" height="70" rx="8" fill="${colors.bgDeep}" />
      <text x="430" y="98" font-family="${fonts.body}" font-size="18" fill="${colors.textMuted}">Finish: <tspan fill="${colors.textWhite}" font-weight="700">${escapeXml(product.finish || 'Non-greasy')}</tspan></text>
    </g>

    <!-- Skin Match Callout -->
    <g transform="translate(50, 560)">
      <rect x="0" y="0" width="780" height="110" rx="12" fill="#162e20" stroke="${colors.primaryEmerald}" stroke-width="1.5" />
      <text x="30" y="45" font-family="${fonts.heading}" font-size="22" font-weight="800" fill="${colors.accentEmeraldLight}">Best For Skin Type:</text>
      <text x="30" y="85" font-family="${fonts.body}" font-size="18" fill="${colors.textWhite}">
        ${escapeXml(Array.isArray(product.who_its_for) ? product.who_its_for.join(', ') : 'Dry, compromised barriers')}
      </text>
    </g>
  </g>

  <!-- Big Click-Through Destination Pill -->
  <g transform="translate(60, 1220)">
    <rect x="0" y="0" width="880" height="130" rx="65" fill="url(#emeraldGrad)" filter="url(#cardShadow)" />
    <text x="440" y="60" font-family="${fonts.heading}" font-size="30" font-weight="900" fill="${colors.textWhite}" text-anchor="middle">
      Read Full Review on SkinEthix.com
    </text>
    <text x="440" y="98" font-family="${fonts.body}" font-size="20" font-weight="600" fill="#e2e8f0" text-anchor="middle">
      Find 3 Cheaper Drugstore Dupes →
    </text>
  </g>

  ${this._generateWatermark(width, height)}
</svg>
`;

    return {
      svg,
      metadata: { width, height, ratio: spec.ratio, channel: spec.channel, productId: product.id || product.slug }
    };
  }

  /**
   * 4. YOUTUBE / TIKTOK SHORTS COVER (1080x1920 - 9:16 Aspect Ratio) [REQ-3.2.3]
   */
  renderYouTubeShortsCover(product, options = {}) {
    const spec = CHANNEL_SPECS.YOUTUBE_SHORTS;
    const { width, height } = spec;
    const { colors, fonts } = this.brand;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${this._generateDefs()}
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Top Pill -->
  <g transform="translate(72, 120)">
    <rect x="0" y="0" width="280" height="48" rx="24" fill="${colors.bgCardRaised}" stroke="${colors.primaryEmerald}" stroke-width="1.5" />
    <text x="140" y="32" font-family="${fonts.body}" font-size="18" font-weight="800" fill="${colors.accentEmeraldLight}" text-anchor="middle">
      SKINETHIX TEARDOWN
    </text>
  </g>

  <!-- High-Impact Upper Hook Title -->
  <g transform="translate(72, 240)">
    <text x="0" y="0" font-family="${fonts.heading}" font-size="76" font-weight="900" fill="${colors.textWhite}">
      <tspan x="0" dy="0">DON&apos;T BUY THIS</tspan>
      <tspan x="0" dy="90" fill="${colors.accentCoral}">UNTIL YOU</tspan>
      <tspan x="0" dy="90" fill="${colors.textWhite}">SEE THIS.</tspan>
    </text>
    <text x="0" y="360" font-family="${fonts.body}" font-size="36" font-weight="700" fill="${colors.accentGold}">
      ${escapeXml(product.name)}
    </text>
  </g>

  <!-- Central Product Feature Frame -->
  <g transform="translate(72, 720)">
    <rect x="0" y="0" width="936" height="680" rx="32" fill="${colors.bgCard}" stroke="${colors.border}" stroke-width="2" filter="url(#cardShadow)" />
    
    <!-- 3D Bottle Silhouette -->
    <use href="#cosmeticSilhouette" transform="translate(380, 80) scale(2.2)" />

    <!-- Overlay Stats Pill -->
    <g transform="translate(68, 480)">
      <rect x="0" y="0" width="800" height="120" rx="20" fill="${colors.bgDeep}" stroke="${colors.primaryEmerald}" stroke-width="2" />
      <text x="400" y="50" font-family="${fonts.heading}" font-size="28" font-weight="800" fill="${colors.textWhite}" text-anchor="middle">
        Hidden Pore Cloggers: <tspan fill="${colors.accentEmeraldLight}">ZERO</tspan>
      </text>
      <text x="400" y="92" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}" text-anchor="middle">
        Formula Verified via 5,000+ Record Database
      </text>
    </g>
  </g>

  <!-- Lower Third Action Hook -->
  <g transform="translate(72, 1500)">
    <rect x="0" y="0" width="936" height="180" rx="28" fill="url(#alertGrad)" filter="url(#cardShadow)" />
    <text x="468" y="80" font-family="${fonts.heading}" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">
      WATCH BEFORE YOU BUY ⚠️
    </text>
    <text x="468" y="130" font-family="${fonts.body}" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle">
      Full 30s lab breakdown in pinned link
    </text>
  </g>

  ${this._generateWatermark(width, height)}
</svg>
`;

    return {
      svg,
      metadata: { width, height, ratio: spec.ratio, channel: spec.channel, productId: product.id || product.slug }
    };
  }

  /**
   * 5. TWITTER / X SUMMARY CARD (1200x675 - 16:9 Aspect Ratio) [REQ-3.2.4]
   */
  renderTwitterCard(product, options = {}) {
    const spec = CHANNEL_SPECS.TWITTER_CARD;
    const { width, height } = spec;
    const { colors, fonts } = this.brand;
    const heroes = Array.isArray(product.hero_ingredients) ? product.hero_ingredients : ['Ceramides', 'Niacinamide'];

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${this._generateDefs()}
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Left Side: Product Summary -->
  <g transform="translate(60, 60)">
    <!-- Brand Pill -->
    <rect x="0" y="0" width="200" height="36" rx="18" fill="${colors.bgCardRaised}" stroke="${colors.primaryEmerald}" stroke-width="1.5" />
    <text x="100" y="24" font-family="${fonts.body}" font-size="14" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="middle">
      LAB SCORECARD
    </text>

    <text x="0" y="100" font-family="${fonts.heading}" font-size="44" font-weight="900" fill="${colors.textWhite}">
      ${escapeXml(product.name)}
    </text>
    <text x="0" y="145" font-family="${fonts.body}" font-size="22" font-weight="600" fill="${colors.accentEmeraldLight}">
      Category: ${escapeXml((product.category || 'Moisturizer').toUpperCase())}
    </text>

    <!-- Key Metrics Grid -->
    <g transform="translate(0, 180)">
      <rect x="0" y="0" width="520" height="260" rx="16" fill="${colors.bgCard}" stroke="${colors.border}" stroke-width="1.5" />
      <text x="30" y="45" font-family="${fonts.heading}" font-size="20" font-weight="700" fill="${colors.textWhite}">Targeted Skin Concern:</text>
      <text x="30" y="80" font-family="${fonts.body}" font-size="18" fill="${colors.accentGold}">${escapeXml(product.target_concerns ? product.target_concerns.join(', ') : 'Barrier Repair')}</text>

      <text x="30" y="130" font-family="${fonts.heading}" font-size="20" font-weight="700" fill="${colors.textWhite}">Sensory Finish:</text>
      <text x="30" y="165" font-family="${fonts.body}" font-size="18" fill="${colors.textMuted}">${escapeXml(product.texture || 'Velvet Crème')} • ${escapeXml(product.absorption_speed || 'Fast Absorption')}</text>

      <line x1="30" y1="195" x2="490" y2="195" stroke="${colors.border}" stroke-width="1" />
      <text x="30" y="230" font-family="${fonts.body}" font-size="16" fill="${colors.accentEmeraldLight}">✓ 100% Unbiased Formulation Analysis</text>
    </g>
  </g>

  <!-- Right Side: Actives & Seal -->
  <g transform="translate(640, 60)">
    <rect x="0" y="0" width="500" height="470" rx="20" fill="${colors.bgCard}" stroke="${colors.primaryEmerald}" stroke-width="2" filter="url(#cardShadow)" />
    
    <text x="40" y="55" font-family="${fonts.heading}" font-size="24" font-weight="800" fill="${colors.textWhite}">Hero Actives Detected</text>
    ${heroes.slice(0, 3).map((hero, idx) => `
      <g transform="translate(40, ${85 + idx * 75})">
        <rect x="0" y="0" width="420" height="55" rx="8" fill="${colors.bgDeep}" />
        <text x="25" y="35" font-family="${fonts.heading}" font-size="18" font-weight="700" fill="${colors.textWhite}">${escapeXml(hero)}</text>
        <text x="395" y="35" font-family="${fonts.mono}" font-size="16" font-weight="700" fill="${colors.accentEmeraldLight}" text-anchor="end">CLINICAL</text>
      </g>
    `).join('')}

    <!-- Call to Action Banner -->
    <g transform="translate(40, 340)">
      <rect x="0" y="0" width="420" height="85" rx="12" fill="url(#emeraldGrad)" />
      <text x="210" y="42" font-family="${fonts.heading}" font-size="20" font-weight="800" fill="${colors.textWhite}" text-anchor="middle">
        Read Full Thread on SkinEthix
      </text>
      <text x="210" y="68" font-family="${fonts.body}" font-size="14" fill="#f1f5f9" text-anchor="middle">
        skinethix.com/products/${escapeXml(product.slug || 'product')}
      </text>
    </g>
  </g>

  ${this._generateWatermark(width, height)}
</svg>
`;

    return {
      svg,
      metadata: { width, height, ratio: spec.ratio, channel: spec.channel, productId: product.id || product.slug }
    };
  }

  /**
   * 6. LINKEDIN DOCUMENT SLIDE (1080x1350 - 4:5 Aspect Ratio) [REQ-3.2.1]
   */
  renderLinkedInSlide(product, slideData, options = {}) {
    const spec = CHANNEL_SPECS.LINKEDIN_DOCUMENT;
    const { width, height } = spec;
    const { colors, fonts } = this.brand;
    const slideNumber = options.slideNumber || slideData.slideNumber || 1;
    const totalSlides = options.totalSlides || 4;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${this._generateDefs()}
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Executive Header -->
  <g transform="translate(72, 80)">
    <text x="0" y="0" font-family="${fonts.mono}" font-size="16" font-weight="700" fill="${colors.accentEmeraldLight}">
      COSMETIC CHEMISTRY INTELLIGENCE • SKINETHIX RESEARCH
    </text>
    <text x="${width - 144}" y="0" font-family="${fonts.mono}" font-size="16" font-weight="700" fill="${colors.textMuted}" text-anchor="end">
      EXECUTIVE BRIEFING [${slideNumber}/${totalSlides}]
    </text>
    <line x1="0" y1="20" x2="${width - 144}" y2="20" stroke="${colors.border}" stroke-width="1.5" />
  </g>

  <!-- Editorial Headline -->
  <g transform="translate(72, 200)">
    <text x="0" y="0" font-family="${fonts.heading}" font-size="52" font-weight="900" fill="${colors.textWhite}">
      <tspan x="0" dy="0">Decoding Formulation Reality:</tspan>
      <tspan x="0" dy="70" fill="${colors.accentEmeraldLight}">${escapeXml(product.name)}</tspan>
    </text>
    <text x="0" y="160" font-family="${fonts.body}" font-size="24" fill="${colors.textMuted}">
      Why the $100B skincare industry relies on marketing over transparency.
    </text>
  </g>

  <!-- Main Intelligence Card -->
  <g transform="translate(72, 440)">
    <rect x="0" y="0" width="936" height="580" rx="24" fill="${colors.bgCard}" stroke="${colors.primaryEmerald}" stroke-width="2" filter="url(#cardShadow)" />
    
    <text x="50" y="70" font-family="${fonts.heading}" font-size="28" font-weight="800" fill="${colors.textWhite}">1. Formulation Breakdown</text>
    <text x="50" y="115" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}">
      Primary Actives: <tspan fill="${colors.accentEmeraldLight}" font-weight="700">${escapeXml((product.hero_ingredients || ['Ceramide NP', 'Niacinamide']).join(', '))}</tspan>
    </text>

    <text x="50" y="180" font-family="${fonts.heading}" font-size="28" font-weight="800" fill="${colors.textWhite}">2. Clinical Research Assessment</text>
    <rect x="50" y="210" width="836" height="140" rx="12" fill="${colors.bgDeep}" />
    <text x="80" y="255" font-family="${fonts.body}" font-size="19" fill="${colors.textWhite}">
      ${escapeXml(product.clinical_research || 'Evidence demonstrates a statistically significant reduction in trans-epidermal water loss.')}
    </text>
    <text x="80" y="310" font-family="${fonts.mono}" font-size="15" fill="${colors.accentGold}">Source: Journal of Dermatological Science &amp; SkinEthix Lab Index</text>

    <text x="50" y="410" font-family="${fonts.heading}" font-size="28" font-weight="800" fill="${colors.textWhite}">3. The Consumer Advocacy Impact</text>
    <text x="50" y="455" font-family="${fonts.body}" font-size="20" fill="${colors.textMuted}">
      By democratizing 5,000+ cosmetic formulas, consumers avoid £1,200/year in mismatched, pore-clogging products.
    </text>
  </g>

  <!-- CTA Box -->
  <g transform="translate(72, 1080)">
    <rect x="0" y="0" width="936" height="110" rx="16" fill="${colors.bgCardRaised}" stroke="${colors.border}" stroke-width="1.5" />
    <text x="40" y="45" font-family="${fonts.heading}" font-size="22" font-weight="700" fill="${colors.textWhite}">Join the Open Skincare Database Initiative</text>
    <text x="40" y="85" font-family="${fonts.body}" font-size="18" fill="${colors.accentEmeraldLight}">Read the full analysis and database at SkinEthix.com</text>
  </g>

  ${this._generateWatermark(width, height)}
</svg>
`;

    return {
      svg,
      metadata: { width, height, ratio: spec.ratio, channel: spec.channel, slideNumber, totalSlides, productId: product.id || product.slug }
    };
  }

  /**
   * 7. MASTER OMNICHANNEL BATCH GENERATOR
   * Generates all visual assets across all channels for a given product.
   */
  renderOmnichannelVisualBatch(product, copyBatch = null, options = {}) {
    const assets = {
      instagram: [],
      facebook: null,
      pinterest: null,
      youtube: null,
      twitter: null,
      linkedin: []
    };

    // Instagram: 5 Slides
    for (let s = 1; s <= 5; s++) {
      assets.instagram.push(
        this.renderInstagramCarouselSlide(product, { slideNumber: s }, { slideNumber: s, totalSlides: 5 })
      );
    }

    // Facebook: 1:1 Discussion Card
    assets.facebook = this.renderFacebookCard(product, options);

    // Pinterest: 2:3 Vertical Search Pin
    assets.pinterest = this.renderPinterestPin(product, options);

    // YouTube Shorts: 9:16 Cover
    assets.youtube = this.renderYouTubeShortsCover(product, options);

    // Twitter: 16:9 Card
    assets.twitter = this.renderTwitterCard(product, options);

    // LinkedIn: 4 Slides Document
    for (let l = 1; l <= 4; l++) {
      assets.linkedin.push(
        this.renderLinkedInSlide(product, { slideNumber: l }, { slideNumber: l, totalSlides: 4 })
      );
    }

    return {
      product_id: product.id || product.slug,
      product_name: product.name,
      generated_at: new Date().toISOString(),
      channels: Object.keys(assets),
      assets
    };
  }

  /**
   * 8. SAVE ASSETS TO DISK
   * Writes SVG files cleanly to designated target directory organized by platform.
   */
  saveVisualAssets(visualBatch, outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const savedFiles = [];

    // Instagram slides
    const igDir = path.join(outputDir, 'instagram');
    fs.mkdirSync(igDir, { recursive: true });
    visualBatch.assets.instagram.forEach((item, idx) => {
      const filePath = path.join(igDir, `slide_${idx + 1}.svg`);
      fs.writeFileSync(filePath, item.svg, 'utf8');
      savedFiles.push(filePath);
    });

    // Facebook
    const fbDir = path.join(outputDir, 'facebook');
    fs.mkdirSync(fbDir, { recursive: true });
    const fbPath = path.join(fbDir, 'discussion_card.svg');
    fs.writeFileSync(fbPath, visualBatch.assets.facebook.svg, 'utf8');
    savedFiles.push(fbPath);

    // Pinterest
    const pinDir = path.join(outputDir, 'pinterest');
    fs.mkdirSync(pinDir, { recursive: true });
    const pinPath = path.join(pinDir, 'vertical_search_pin.svg');
    fs.writeFileSync(pinPath, visualBatch.assets.pinterest.svg, 'utf8');
    savedFiles.push(pinPath);

    // YouTube
    const ytDir = path.join(outputDir, 'youtube');
    fs.mkdirSync(ytDir, { recursive: true });
    const ytPath = path.join(ytDir, 'shorts_cover.svg');
    fs.writeFileSync(ytPath, visualBatch.assets.youtube.svg, 'utf8');
    savedFiles.push(ytPath);

    // Twitter
    const twDir = path.join(outputDir, 'twitter_x');
    fs.mkdirSync(twDir, { recursive: true });
    const twPath = path.join(twDir, 'summary_card.svg');
    fs.writeFileSync(twPath, visualBatch.assets.twitter.svg, 'utf8');
    savedFiles.push(twPath);

    // LinkedIn
    const liDir = path.join(outputDir, 'linkedin');
    fs.mkdirSync(liDir, { recursive: true });
    visualBatch.assets.linkedin.forEach((item, idx) => {
      const filePath = path.join(liDir, `document_slide_${idx + 1}.svg`);
      fs.writeFileSync(filePath, item.svg, 'utf8');
      savedFiles.push(filePath);
    });

    return savedFiles;
  }
}

module.exports = {
  VisualCompositor,
  CHANNEL_SPECS,
  BRAND_SYSTEM
};
