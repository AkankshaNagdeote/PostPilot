/**
 * PostPilot — Data Ingestion Adapter
 * Complies with EARS Requirements:
 * - REQ-1.1.1 (Ubiquitous): Supports Postgres SQL queries and static JSON file imports without code changes.
 * - REQ-1.1.2 (Event): Extracts products matching campaign filters (is_famous, category, skin_type).
 * - REQ-1.1.3 (Unwanted): Gracefully falls back when texture, scent, or attributes are NULL.
 */

const fs = require('fs');
const path = require('path');

class DataIngestionAdapter {
  constructor(options = {}) {
    this.dataSourceType = options.dataSourceType || 'JSON'; // 'JSON' or 'POSTGRES'
    this.jsonFilePath = options.jsonFilePath || path.resolve(__dirname, '../data/sample_products.json');
    this.postgresClient = options.postgresClient || null;
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
    const name = (raw.name || 'Untitled Skincare Product').trim();
    const brand = (raw.brand || 'Independent Skincare').trim();
    const category = (raw.category || 'treatment').toLowerCase().trim();

    // Normalizing Array Fields
    const forWho = Array.isArray(raw.for_who)
      ? raw.for_who
      : (typeof raw.for_who === 'string' ? raw.for_who.split(',').map(s => s.trim()) : ['Normal skin', 'General barrier maintenance']);

    const notForWho = Array.isArray(raw.not_for_who)
      ? raw.not_for_who
      : (typeof raw.not_for_who === 'string' ? raw.not_for_who.split(',').map(s => s.trim()) : ['Compromised broken skin']);

    const heroIngredients = Array.isArray(raw.hero_ingredients)
      ? raw.hero_ingredients
      : (typeof raw.hero_ingredients === 'string' ? raw.hero_ingredients.split(',').map(s => s.trim()) : []);

    // REQ-1.1.3 Fallback Handling for sensory attributes
    const texture = raw.texture && raw.texture.trim() !== ''
      ? raw.texture.trim()
      : 'Lightweight universal emulsion'; // Fallback

    const scent = raw.scent && raw.scent.trim() !== ''
      ? raw.scent.trim()
      : '100% Fragrance-Free (Natural)'; // Fallback

    const isFamous = Boolean(raw.is_famous || raw.is_cult_product || false);
    const priceUsd = Number(raw.price_usd) || 0;
    const rating = Number(raw.rating) || 4.5;
    const canonicalSlug = raw.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const canonicalUrl = raw.canonical_url || `https://skinethix.com/product/${canonicalSlug}`;

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
      ingestedAt: new Date().toISOString()
    };
  }

  /**
   * Ingest products based on source type (REQ-1.1.1)
   */
  async fetchRawProducts() {
    if (this.dataSourceType === 'POSTGRES') {
      if (!this.postgresClient) {
        throw new Error('Postgres client is required when dataSourceType is POSTGRES');
      }
      const res = await this.postgresClient.query('SELECT * FROM products ORDER BY is_famous DESC, rating DESC LIMIT 500;');
      return res.rows;
    }

    // Default: JSON File import
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
    const rawList = await this.fetchRawProducts();
    const normalized = rawList.map(item => this.normalizeProduct(item));

    return normalized.filter(item => {
      // Filter by famous/viral status
      if (filter.isFamous !== undefined && item.isFamous !== filter.isFamous) {
        return false;
      }
      // Filter by category
      if (filter.category && item.category.toLowerCase() !== filter.category.toLowerCase()) {
        return false;
      }
      // Filter by target skin condition in forWho
      if (filter.skinCondition) {
        const matches = item.forWho.some(cond => cond.toLowerCase().includes(filter.skinCondition.toLowerCase()));
        if (!matches) return false;
      }
      return true;
    }).slice(0, filter.limit || 50);
  }
}

module.exports = { DataIngestionAdapter };
