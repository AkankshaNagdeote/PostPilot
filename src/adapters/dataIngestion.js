/**
 * PostPilot — Data Ingestion Adapter
 * Complies with EARS Requirements:
 * - REQ-1.1.1 (Ubiquitous): Supports Postgres SQL queries, static JSON files, and live URL web ingestion without code changes.
 * - REQ-1.1.2 (Event): Extracts products matching campaign filters (is_famous, category, skin_type).
 * - REQ-1.1.3 (Unwanted): Gracefully falls back when texture, scent, or attributes are NULL or missing from HTML/JSON.
 * - REQ-1.1.4 (Event): When given a web URL, fetches and extracts OpenGraph, JSON-LD, and HTML product metadata into a normalized DTO.
 */

const fs = require('fs');
const path = require('path');

class DataIngestionAdapter {
  constructor(options = {}) {
    this.dataSourceType = options.dataSourceType || 'JSON'; // 'JSON' | 'POSTGRES' | 'URL'
    this.jsonFilePath = options.jsonFilePath || path.resolve(__dirname, '../data/sample_products.json');
    this.postgresClient = options.postgresClient || null;
    this.targetUrls = options.targetUrls || [];
    this.customFetcher = options.customFetcher || (typeof fetch !== 'undefined' ? fetch : null);
  }

  /**
   * Normalize raw product row/object into a standardized ProductDTO
   * Enforces REQ-1.1.3 (Graceful Fallback)
   */
  normalizeProduct(raw) {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid raw product record: record must be a valid object');
    }

    const id = raw.id || `se-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const name = (raw.name || raw.title || 'Untitled Skincare Product').trim();
    const brand = (raw.brand || 'Independent Skincare').trim();
    const category = (raw.category || 'treatment').toLowerCase().trim();

    // Normalizing Array Fields
    const forWho = Array.isArray(raw.for_who)
      ? raw.for_who
      : (typeof raw.for_who === 'string' && raw.for_who.trim() !== ''
        ? raw.for_who.split(',').map(s => s.trim())
        : ['Normal skin', 'General barrier maintenance']);

    const notForWho = Array.isArray(raw.not_for_who)
      ? raw.not_for_who
      : (typeof raw.not_for_who === 'string' && raw.not_for_who.trim() !== ''
        ? raw.not_for_who.split(',').map(s => s.trim())
        : ['Compromised broken skin']);

    const heroIngredients = Array.isArray(raw.hero_ingredients)
      ? raw.hero_ingredients
      : (typeof raw.hero_ingredients === 'string' && raw.hero_ingredients.trim() !== ''
        ? raw.hero_ingredients.split(',').map(s => s.trim())
        : (raw.ingredients ? (Array.isArray(raw.ingredients) ? raw.ingredients : [raw.ingredients]) : []));

    // REQ-1.1.3 Fallback Handling for sensory attributes
    const texture = raw.texture && String(raw.texture).trim() !== ''
      ? String(raw.texture).trim()
      : 'Lightweight universal emulsion'; // Fallback

    const scent = raw.scent && String(raw.scent).trim() !== ''
      ? String(raw.scent).trim()
      : '100% Fragrance-Free (Natural)'; // Fallback

    const isFamous = Boolean(raw.is_famous || raw.is_cult_product || false);
    const priceUsd = Number(raw.price_usd || raw.price) || 0;
    const rating = Number(raw.rating) || 4.5;
    const canonicalSlug = raw.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const canonicalUrl = raw.canonical_url || raw.url || `https://skinethix.com/product/${canonicalSlug}`;
    const description = raw.description || raw.summary || '';

    return {
      id,
      name,
      brand,
      category,
      isFamous,
      forWho,
      notForWho,
      heroIngredients,
      texture,
      scent,
      priceUsd,
      rating,
      canonicalUrl,
      description,
      sourceType: raw.sourceType || this.dataSourceType,
      ingestedAt: new Date().toISOString()
    };
  }

  /**
   * Parse HTML content from a URL to extract JSON-LD, OpenGraph, and Meta tags
   * Zero external dependencies (native regex parser)
   */
  parseHtmlContent(html, sourceUrl = '') {
    if (!html || typeof html !== 'string') {
      throw new Error('Invalid HTML input: content must be a non-empty string');
    }

    const extracted = {
      sourceType: 'URL',
      canonical_url: sourceUrl
    };

    // 1. Extract JSON-LD (Schema.org Product / Article)
    const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsedJson = JSON.parse(match[1].trim());
        const entity = Array.isArray(parsedJson) ? parsedJson[0] : (parsedJson['@graph'] ? parsedJson['@graph'][0] : parsedJson);
        if (entity) {
          if (entity.name) extracted.name = entity.name;
          if (entity.brand) extracted.brand = typeof entity.brand === 'object' ? (entity.brand.name || '') : entity.brand;
          if (entity.description) extracted.description = entity.description;
          if (entity.category) extracted.category = entity.category;
          if (entity.offers && entity.offers.price) extracted.price_usd = entity.offers.price;
          if (entity.aggregateRating && entity.aggregateRating.ratingValue) extracted.rating = entity.aggregateRating.ratingValue;
        }
      } catch (e) {
        // Continue to next JSON-LD block if malformed
      }
    }

    // 2. Extract OpenGraph tags
    const ogRegex = /<meta\b[^>]*property=["']og:([a-zA-Z0-9_:]+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
    let ogMatch;
    while ((ogMatch = ogRegex.exec(html)) !== null) {
      const prop = ogMatch[1].toLowerCase();
      const content = ogMatch[2];
      if (prop === 'title' && !extracted.name) extracted.name = content;
      if (prop === 'description' && !extracted.description) extracted.description = content;
      if (prop === 'url' && !extracted.canonical_url) extracted.canonical_url = content;
      if (prop === 'site_name' && !extracted.brand) extracted.brand = content;
    }

    // 3. Fallback to standard HTML tags if needed
    if (!extracted.name) {
      const titleMatch = html.match(/<title\b[^>]*>([^<]*)<\/title>/i);
      if (titleMatch && titleMatch[1]) extracted.name = titleMatch[1].split('|')[0].split('-')[0].trim();
    }
    if (!extracted.description) {
      const metaDescMatch = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
      if (metaDescMatch && metaDescMatch[1]) extracted.description = metaDescMatch[1].trim();
    }

    return this.normalizeProduct(extracted);
  }

  /**
   * Fetch and ingest content from a single web URL (REQ-1.1.4)
   */
  async ingestFromUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new Error('A valid HTTP/HTTPS URL string is required');
    }

    if (!this.customFetcher) {
      throw new Error('Fetch API is not available in the current environment');
    }

    const response = await this.customFetcher(url, {
      headers: {
        'User-Agent': 'PostPilot-ContentEngine/1.0 (+https://skinethix.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL ${url}: HTTP status ${response.status}`);
    }

    const html = await response.text();
    return this.parseHtmlContent(html, url);
  }

  /**
   * Ingest products based on source type (REQ-1.1.1 & REQ-1.1.4)
   */
  async fetchRawProducts(options = {}) {
    // Mode 1: URL Ingestion
    if (this.dataSourceType === 'URL') {
      const urls = options.urls || this.targetUrls;
      if (!urls || urls.length === 0) {
        throw new Error('No target URLs provided for URL data source');
      }
      const results = [];
      for (const url of urls) {
        const item = await this.ingestFromUrl(url);
        results.push(item);
      }
      return results;
    }

    // Mode 2: Postgres Ingestion
    if (this.dataSourceType === 'POSTGRES') {
      if (!this.postgresClient) {
        throw new Error('Postgres client is required when dataSourceType is POSTGRES');
      }
      const res = await this.postgresClient.query('SELECT * FROM products ORDER BY is_famous DESC, rating DESC LIMIT 500;');
      return res.rows;
    }

    // Mode 3: Default JSON File import
    if (!fs.existsSync(this.jsonFilePath)) {
      throw new Error(`Data file not found at: ${this.jsonFilePath}`);
    }

    const rawData = fs.readFileSync(this.jsonFilePath, 'utf8');
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : (parsed.products || []);
  }

  /**
   * Fetch and filter products for a campaign (REQ-1.1.2)
   */
  async getProductsForCampaign(filter = {}) {
    // If a specific URL is requested on-the-fly in the filter
    if (filter.url) {
      return [await this.ingestFromUrl(filter.url)];
    }

    const rawList = await this.fetchRawProducts(filter);
    const normalized = rawList.map(item => (item.ingestedAt ? item : this.normalizeProduct(item)));

    return normalized.filter(item => {
      if (filter.isFamous !== undefined && item.isFamous !== filter.isFamous) {
        return false;
      }
      if (filter.category && item.category.toLowerCase() !== filter.category.toLowerCase()) {
        return false;
      }
      if (filter.skinCondition) {
        const matches = item.forWho.some(cond => cond.toLowerCase().includes(filter.skinCondition.toLowerCase()));
        if (!matches) return false;
      }
      return true;
    }).slice(0, filter.limit || 50);
  }

  /**
   * Ingest and filter products directly from a JSON file
   */
  ingestFromJson(filePath = null, filter = {}) {
    const targetFile = filePath || this.jsonFilePath;
    if (!fs.existsSync(targetFile)) {
      throw new Error(`Data file not found at: ${targetFile}`);
    }
    const rawData = fs.readFileSync(targetFile, 'utf8');
    const parsed = JSON.parse(rawData);
    const rawList = Array.isArray(parsed) ? parsed : (parsed.products || []);
    const normalized = rawList.map(item => this.normalizeProduct(item));

    return normalized.filter(item => {
      if (filter.isFamous !== undefined && item.isFamous !== filter.isFamous) return false;
      if (filter.category && item.category.toLowerCase() !== filter.category.toLowerCase()) return false;
      if (filter.skinCondition) {
        const matches = item.forWho.some(cond => cond.toLowerCase().includes(filter.skinCondition.toLowerCase()));
        if (!matches) return false;
      }
      return true;
    }).slice(0, filter.limit || 50);
  }

  /**
   * Ingest and filter products directly from Postgres
   */
  async ingestFromPostgres(filter = {}) {
    this.dataSourceType = 'POSTGRES';
    return this.getProductsForCampaign(filter);
  }
}

module.exports = { DataIngestionAdapter };
