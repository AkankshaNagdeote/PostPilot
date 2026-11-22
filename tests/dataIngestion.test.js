/**
 * PostPilot — Automated Unit Test Suite for STORY-01.1: Data Ingestion Adapter
 * Verifies EARS Requirements: REQ-1.1.1, REQ-1.1.2, REQ-1.1.3
 */

const assert = require('assert');
const path = require('path');
const { DataIngestionAdapter } = require('../src/adapters/dataIngestion');

async function runTests() {
  console.log('🧪 PostPilot: Running Test Suite for STORY-01.1 Data Ingestion Adapter\n');
  let passed = 0;
  let failed = 0;

  // TEST 1: REQ-1.1.1 — Static JSON Import and Normalization
  try {
    const adapter = new DataIngestionAdapter({
      dataSourceType: 'JSON',
      jsonFilePath: path.resolve(__dirname, '../src/data/sample_products.json')
    });
    const products = await adapter.getProductsForCampaign();
    assert.strictEqual(Array.isArray(products), true, 'Products should be an array');
    assert.strictEqual(products.length >= 5, true, 'Should have loaded at least 5 products');
    assert.strictEqual(products[0].name, 'CeraVe PM Facial Moisturising Lotion');
    assert.strictEqual(products[0].canonicalUrl.startsWith('https://skinethix.com/'), true);
    console.log('  ✔ TEST-1.1.1 (JSON Ingestion & Normalization): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-1.1.1 FAILED:', err.message);
    failed++;
  }

  // TEST 2: REQ-1.1.1 — Postgres Query Compatibility Mock
  try {
    const mockPgClient = {
      query: async (sql) => {
        return {
          rows: [
            {
              id: 'pg-101',
              name: 'Mock Clinical Niacinamide Serum',
              brand: 'DermPro',
              category: 'serum',
              for_who: 'Acne-prone skin',
              not_for_who: 'Peeling skin',
              hero_ingredients: 'Niacinamide 5%',
              texture: 'Gel-serum',
              scent: 'None',
              price_usd: 24.0,
              is_famous: true
            }
          ]
        };
      }
    };

    const pgAdapter = new DataIngestionAdapter({
      dataSourceType: 'POSTGRES',
      postgresClient: mockPgClient
    });

    const products = await pgAdapter.getProductsForCampaign();
    assert.strictEqual(products.length, 1);
    assert.strictEqual(products[0].id, 'pg-101');
    assert.strictEqual(products[0].isFamous, true);
    console.log('  ✔ TEST-1.1.1b (Postgres Client Ingestion): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-1.1.1b FAILED:', err.message);
    failed++;
  }

  // TEST 3: REQ-1.1.2 — Campaign Filter Accuracy (Famous vs Niche)
  try {
    const adapter = new DataIngestionAdapter();
    const famousProducts = await adapter.getProductsForCampaign({ isFamous: true });
    assert.strictEqual(famousProducts.every(p => p.isFamous === true), true);

    const nicheProducts = await adapter.getProductsForCampaign({ isFamous: false });
    assert.strictEqual(nicheProducts.every(p => p.isFamous === false), true);
    assert.strictEqual(nicheProducts.length >= 1, true);

    const serums = await adapter.getProductsForCampaign({ category: 'serum' });
    assert.strictEqual(serums.every(p => p.category === 'serum'), true);
    console.log('  ✔ TEST-1.1.2 (Campaign Filter Accuracy): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-1.1.2 FAILED:', err.message);
    failed++;
  }

  // TEST 4: REQ-1.1.3 — Fallback Handling for Missing Sensory Fields
  try {
    const adapter = new DataIngestionAdapter();
    const rawIncomplete = {
      id: 'incomplete-01',
      name: 'Unlabeled Barrier Cream',
      texture: null, // Missing sensory field
      scent: '',     // Missing sensory field
      for_who: null  // Missing array
    };
    const normalized = adapter.normalizeProduct(rawIncomplete);
    assert.strictEqual(normalized.texture, 'Lightweight universal emulsion');
    assert.strictEqual(normalized.scent, '100% Fragrance-Free (Natural)');
    assert.strictEqual(Array.isArray(normalized.forWho), true);
    console.log('  ✔ TEST-1.1.3 (Sensory Attribute Fallback Handling): PASSED');
    passed++;
  } catch (err) {
    console.error('  ✖ TEST-1.1.3 FAILED:', err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`PostPilot Test Summary: ${passed + failed} Total | ${passed} Passed | ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
