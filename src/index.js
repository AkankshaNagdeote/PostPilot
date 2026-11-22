#!/usr/bin/env node
/**
 * PostPilot: Automated Omnichannel Social Media Content Engine
 * =============================================================
 * Generates ready-to-publish social content, carousels, video scripts,
 * and graphics across 7 major social networks from skincare database records.
 * 
 * Usage:
 *   node src/index.js --campaign product_launch --limit 2
 *   node src/index.js --source url --input "https://skinethix.com/products/ceramide-serum"
 *   npm run generate -- --campaign viral_teardown
 */

const path = require('path');
const { CampaignExporter } = require('./dispatcher/campaignExporter');
const { DataIngestionAdapter } = require('./adapters/dataIngestion');

function parseArgs(args) {
  const options = {
    campaign: 'product_launch',
    source: 'json',
    input: path.join(__dirname, 'data/sample_products.json'),
    limit: 2,
    outputDir: path.join(process.cwd(), 'exports')
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--campaign' && args[i + 1]) {
      options.campaign = args[++i];
    } else if (arg.startsWith('--campaign=')) {
      options.campaign = arg.split('=')[1];
    } else if (arg === '--source' && args[i + 1]) {
      options.source = args[++i];
    } else if (arg.startsWith('--source=')) {
      options.source = arg.split('=')[1];
    } else if (arg === '--input' && args[i + 1]) {
      options.input = args[++i];
    } else if (arg.startsWith('--input=')) {
      options.input = arg.split('=')[1];
    } else if (arg === '--url' && args[i + 1]) {
      options.source = 'url';
      options.input = args[++i];
    } else if (arg.startsWith('--url=')) {
      options.source = 'url';
      options.input = arg.split('=')[1];
    } else if (arg === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[++i], 10);
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--out' && args[i + 1]) {
      options.outputDir = args[++i];
    } else if (arg.startsWith('--out=')) {
      options.outputDir = arg.split('=')[1];
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  console.log('\n============================================================');
  console.log('🚀 POSTPILOT: Autonomous Omnichannel Content Engine');
  console.log('============================================================');
  console.log(`• Campaign Archetype : ${options.campaign.toUpperCase()}`);
  console.log(`• Data Ingestion Src : ${options.source.toUpperCase()} (${options.input})`);
  console.log(`• Product Limit      : ${options.limit}`);
  console.log(`• Target Directory   : ${options.outputDir}`);
  console.log(`• Total Cloud Cost   : $0.00 (Deterministic Heuristics + Local Vector Engine)`);
  console.log('============================================================\n');

  try {
    const exporter = new CampaignExporter({ outputDir: options.outputDir });
    console.log('⏳ Ingesting product records and generating omnichannel assets...');

    const result = await exporter.exportBatch({
      source: options.source,
      sourcePath: options.input,
      campaign: options.campaign,
      limit: options.limit
    });

    console.log(`\n✔ Completed batch export for ${result.total_products_exported} product(s)!\n`);

    result.manifests.forEach((m, idx) => {
      console.log(`[Product ${idx + 1}/${result.total_products_exported}] ${m.product_name} (${m.brand})`);
      console.log(`  Directory: ${m.output_directory}`);
      console.log(`  Channels Generated:`);
      console.log(`    ├── Instagram     : 5 Slide SVGs (1080x1350) + caption.txt`);
      console.log(`    ├── Facebook      : 1 Discussion Card (1080x1080) + post.txt`);
      console.log(`    ├── YouTube Shorts: 1 Cover (1080x1920) + 30s timed script.txt`);
      console.log(`    ├── Twitter / X   : 1 Summary Card (1200x675) + 5-tweet thread.txt`);
      console.log(`    ├── LinkedIn      : 4 Document Slides (1080x1350) + article.txt`);
      console.log(`    ├── Pinterest     : 1 Vertical Search Pin (1000x1500) + metadata.json`);
      console.log(`    └── Reddit/Threads: 1 Value-First discussion_post.md`);
      console.log('');
    });

    console.log('============================================================');
    console.log('🎉 Ready for $0 Human-in-the-Loop Publishing (Meta / Buffer / Direct)');
    console.log('============================================================\n');

    return result;
  } catch (err) {
    console.error('❌ PostPilot execution error:', err.message);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  parseArgs
};
