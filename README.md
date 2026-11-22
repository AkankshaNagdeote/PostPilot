# PostPilot: Automated Multi-Platform Social Media Content Engine

> **PostPilot** is an agentic, zero-cost content generation platform that transforms raw structured product and ingredient data (Postgres / JSON) into platform-native, high-conversion social media assets for **Instagram, Facebook, YouTube, Twitter/X, LinkedIn, Pinterest, and Reddit/Threads**.

---

## 🚀 Key Capabilities

- **Multi-Source Data Ingestion:** Reads directly from local Postgres tables or static JSON dumps with automatic fallback for missing sensory attributes.
- **Omnichannel Format Generation:**
  - **Instagram:** 1080x1350 (4:5) Carousels & 9:16 Reel Covers
  - **Facebook:** 1080x1080 (1:1) / 4:5 Feed Images & Community Discussions
  - **YouTube:** 1080x1920 (9:16) Shorts Scripts & 1:1 Community Polls
  - **Twitter / X:** 1200x675 (16:9) Header Cards & 5-Tweet Science Threads
  - **LinkedIn:** 1080x1350 Multi-Page PDF Document Carousels
  - **Pinterest:** 1000x1500 (2:3) Vertical Search Pins with canonical backlinks
  - **Reddit & Threads:** Value-first conversational response drafts
- **$0.00 Local-First Stack:** Powered by Google AI Pro (Gemini Pro), Headless Blender CLI, and local HTML5/Canvas rendering.

---

## 🧪 Testing & Execution

```bash
# Run full 24-test omnichannel suite
npm test

# Generate ready-to-publish social campaigns (5 products)
npm run generate -- --campaign product_launch --limit 5

# Scrape and generate assets from a live URL on the fly
npm run generate -- --url "https://skinethix.com/products/ceramide-rescue"
```

---

## 🌳 Git Branching & Audit Backtracking Strategy

PostPilot enforces a 4-tier branching and audit architecture to guarantee **100% traceability and instant rollback**:

```text
main (Production Golden Copy)
  └── feat/003/omni-engine-base (Integration Trunk)
        ├── feat/003/STORY-01-data-ingestion     [Tag: v0.1.0-story-01]
        ├── feat/003/STORY-02-gemini-copy-engine [Tag: v0.1.0-story-02]
        ├── feat/003/STORY-03-visual-compositor  [Tag: v0.1.0-story-03]
        └── feat/003/STORY-04-launch-campaign    [Tag: v0.1.0-story-04]
```

### 1. Branch Hierarchy
- **`main`**: Production-ready, locked release branch.
- **`feat/003/omni-engine-base`**: Initiative base branch where all stories merge via `--no-ff`.
- **`feat/003/STORY-<id>-<slug>`**: Story branches pushed to GitHub remote for granular review and inspection. Story branches are preserved on remote for visual review.

### 2. Instant Backtracking via Immutable Git Tags
Every completed story and milestone is cryptographically tagged. You can instantly rewind the entire codebase to any exact moment in time:

```bash
# Rewind to Story 01 (Data Ingestion):
git checkout v0.1.0-story-01

# Rewind to Story 02 (Gemini Copy Engine):
git checkout v0.1.0-story-02

# Rewind to Story 03 (Visual Compositor & Blender Pipeline):
git checkout v0.1.0-story-03

# Rewind to Story 04 (Campaign Exporter & CLI Dispatcher):
git checkout v0.1.0-story-04

# Rewind to the full Omnichannel Release Candidate:
git checkout v0.1.0-omni-2026.11.22
```

In GitHub's web interface, navigate to **Tags** or **Releases** to browse snapshots, download archives, or view the complete commit history.
