# Future Features & Roadmap

This document outlines proposed features and enhancements for the GAILP platform based on user requirements and strategic vision.

---

## 🚀 **High Priority Features**

### 1. Tweet-to-Site Mechanism (Micro-Blogging)
**Description:** Ability to post quick updates to the site via SMS/text, similar to Twitter but private.

**Use Case:**
> "If I'm out and about and I see something deserving of comment, I want to be able to 'text' my site and have it posted."

**Technical Approach:**
- **Option A: Twilio SMS Webhook**
  - Set up Twilio phone number
  - Create API endpoint: `/api/webhooks/sms`
  - Parse incoming SMS and create draft post
  - Requires: Twilio account ($1/month + per-message cost)

- **Option B: Email-to-Post**
  - Use unique email address (e.g., `post@gailp.ai`)
  - Parse email subject/body via SendGrid Inbound Parse
  - Convert to post format
  - Requires: SendGrid account (free tier available)

- **Option C: Mobile PWA**
  - Progressive Web App with "Quick Post" feature
  - Install on phone home screen
  - Requires: Service worker setup

**Implementation Time:** 4-6 hours
**Database Schema:**
```sql
CREATE TABLE quick_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES user_profiles(id),
  content TEXT NOT NULL,
  source TEXT, -- 'sms', 'email', 'web'
  status TEXT DEFAULT 'draft', -- 'draft', 'published'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);
```

---

### 2. Feed Image Assignment System
**Description:** Ability to assign/upload images for FreshRSS feed items that don't have accompanying images.

**Current Issue:**
> "Content from feeds rarely have accompanying images, I need the ability to assign them."

**Technical Approach:**
- Create `feed_image_overrides` table
- Admin UI to browse recent feed items
- Upload/assign images per feed item
- Cache images in Supabase Storage
- Fallback hierarchy: custom image → feed image → placeholder

**Implementation Time:** 3-4 hours

**Database Schema:**
```sql
CREATE TABLE feed_image_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id TEXT NOT NULL UNIQUE, -- FreshRSS item ID
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. Dynamic Homepage Featured Articles
**Description:** Replace hardcoded "Dr. Sara Green" article with dynamic content from Supabase.

**Current Issue:**
> "First of all this never updates or changes."

**Technical Approach:**
- Add `featured` boolean to articles table
- Query: `SELECT * FROM articles WHERE status = 'published' AND featured = true ORDER BY published_at DESC LIMIT 1`
- Fallback to most recent article if no featured articles
- Admin UI to toggle featured status

**Implementation Time:** 1-2 hours

**Database Update:**
```sql
ALTER TABLE articles ADD COLUMN featured BOOLEAN DEFAULT false;
CREATE INDEX idx_articles_featured ON articles(featured, published_at DESC);
```

---

### 4. Article Scheduling System Fix
**Description:** Make the scheduling feature functional for publishing articles at future dates.

**Current Issue:**
> "Scheduling doesn't work either. I can't seem to manipulate the scheduler."

**Technical Approach:**
- Implement Supabase Edge Function or cron job
- Check for articles where `scheduled_publish_date <= NOW()` and `status = 'scheduled'`
- Auto-publish those articles
- Options:
  - **Supabase pg_cron:** Native PostgreSQL scheduling
  - **Vercel Cron:** API route called on schedule
  - **GitHub Actions:** Workflow that hits API endpoint

**Implementation Time:** 2-3 hours

**Cron Function (Supabase):**
```sql
-- Schedule function to run every 5 minutes
SELECT cron.schedule('publish-scheduled-articles', '*/5 * * * *', $$
  UPDATE articles
  SET status = 'published', published_at = NOW()
  WHERE status = 'scheduled'
  AND scheduled_publish_date <= NOW()
$$);
```

---

### 5. Video Insights Feed Integration
**Description:** Populate Video Insights section with actual video content.

**Current Issue:**
> "How do we get some videos in the Video Insights section?"

**Technical Approach:**
- **Option A: YouTube Channel RSS**
  - Subscribe to policy-related YouTube channels
  - Parse RSS feeds (e.g., `https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`)
  - Display video thumbnails, titles, durations

- **Option B: Manual Video Curation**
  - Create `videos` table
  - Admin UI to add YouTube/Vimeo URLs
  - Fetch metadata via oEmbed API

- **Option C: Playlist Embedding**
  - Create curated YouTube playlists
  - Embed playlist widget on page

**Implementation Time:** 2-3 hours (for Option A)

**Suggested YouTube Channels:**
- Center for Democracy & Technology
- Electronic Frontier Foundation
- Brookings Institution Tech Policy
- MIT Media Lab

---

## 🔬 **Research & Exploration**

### 6. Micro-LLM for Content Curation
**Description:** AI system to scan feeds and auto-post relevant content based on training.

**Question:**
> "What kind of resources are required to devise what I am calling a micro-llm to scan over current feeds and post ones according to its training?"

**Analysis:**

**Approach A: GPT-4 API Integration (Recommended)**
- **Cost:** ~$0.01-0.03 per feed item analyzed
- **Effort:** 8-12 hours development
- **How it works:**
  1. Fetch new feed items hourly
  2. Send to GPT-4 with prompt: "Is this relevant to AI policy, digital governance, or data protection? Rate 1-10 and explain."
  3. Auto-publish items rated 8+
  4. Save to drafts for 6-7

**Prompt Engineering:**
```
You are an AI policy analyst. Rate this article's relevance to:
- AI governance and regulation
- Data protection and privacy
- Digital identity
- Cross-border data flows

Title: {title}
Summary: {summary}
Source: {source}

Rate 1-10 and provide 2-sentence explanation.
```

**Approach B: Fine-tuned Small Model**
- **Cost:** $200-500 (OpenAI fine-tuning) or $50-100 (RunPod GPU rental)
- **Effort:** 20-30 hours (data labeling + training)
- **Dataset needed:** 500-1000 labeled examples
- **Model options:**
  - DistilBERT (66M parameters)
  - BERT-tiny (4M parameters)
  - Custom transformer

**Approach C: Rule-Based + Embeddings**
- **Cost:** ~$0.001 per item
- **Effort:** 6-8 hours
- **How it works:**
  1. Generate embeddings for feed items (OpenAI text-embedding-3-small)
  2. Compare to curated "ideal content" embeddings
  3. Threshold-based auto-posting

**Recommendation:** Start with Approach A (GPT-4 API) for fastest time-to-value, then consider fine-tuning after 6 months of data collection.

---

### 7. Public Datasets Integration
**Description:** Surface interesting public datasets related to AI policy and digital governance.

**Question:**
> "What public datasets are there available across the world that might be interesting to surface here? How can we make that engaging?"

**Curated Dataset List:**

#### **AI & Policy Datasets**
1. **OECD AI Policy Observatory**
   - URL: https://oecd.ai/en/dashboards
   - Data: AI strategies by country, regulations, incidents
   - Format: Web dashboard + downloadable CSV

2. **Stanford AI Index**
   - URL: https://aiindex.stanford.edu/
   - Data: AI investment, publications, ethics metrics
   - Format: Annual report + data files

3. **AI Incident Database**
   - URL: https://incidentdatabase.ai/
   - Data: 2000+ AI incidents and harms
   - Format: API available

4. **EU AI Act Compliance Tracker**
   - URL: https://artificialintelligenceact.eu/
   - Data: Implementation status across EU member states

#### **Privacy & Data Protection**
5. **GDPR Enforcement Tracker**
   - URL: https://www.enforcementtracker.com/
   - Data: GDPR fines, decisions, DPAs
   - Format: JSON API

6. **Privacy International Datasets**
   - URL: https://privacyinternational.org/
   - Data: Surveillance tech exports, data breaches

#### **Digital Identity**
7. **World Bank ID4D Dataset**
   - URL: https://id4d.worldbank.org/
   - Data: Digital ID coverage by country
   - Format: CSV downloads

8. **DIF Identity Standards Registry**
   - URL: https://identity.foundation/
   - Data: Decentralized identity implementations

**Engagement Ideas:**
- **Interactive Dashboard:** Filterable by country, category, date
- **Weekly Data Snapshot:** "This week in numbers" section on homepage
- **Data Visualizations:** Charts showing trends (e.g., "GDPR fines by country")
- **API Access:** Offer public API for researchers
- **Data Stories:** Blog posts analyzing interesting patterns

**Implementation:**
- Create `datasets` table with metadata
- Build `/data` page with interactive filters
- Embed visualizations using Chart.js or D3.js
- Auto-refresh data via scheduled jobs

**Time Estimate:** 12-16 hours for MVP

---

### 8. Top Voices in AI Policy
**Description:** Compile list of leading voices and track their content.

**Question:**
> "Compile a list of the top ten voices in our domains of interest."

**Curated List:**

#### **Academia & Research**
1. **Stuart Russell** - UC Berkeley, AI safety pioneer
   - Twitter: @stuartjrussell
   - Focus: AI ethics, safety, governance

2. **Kate Crawford** - Microsoft Research, AI Now Institute
   - Twitter: @katecrawford
   - Focus: AI ethics, social implications

3. **Timnit Gebru** - DAIR Institute founder
   - Twitter: @timnitGebru
   - Focus: AI ethics, algorithmic bias

#### **Policy & Government**
4. **Helen Toner** - CSET, former OpenAI board member
   - Twitter: @hlntnr
   - Focus: AI policy, national security

5. **Marietje Schaake** - Stanford HAI, former MEP
   - Twitter: @MarietjeSchaake
   - Focus: Tech policy, EU regulation

6. **Meredith Whittaker** - Signal president, AI Now co-founder
   - Twitter: @mer__edith
   - Focus: Privacy, surveillance, AI accountability

#### **Industry & Standards**
7. **Rumman Chowdhury** - Twitter (former), Humane Intelligence
   - Twitter: @ruchowdh
   - Focus: Responsible AI, algorithmic auditing

8. **Yoav Shoham** - AI Index lead, Stanford
   - Twitter: @yoavshoham
   - Focus: AI benchmarks, policy metrics

#### **Privacy & Data Protection**
9. **Max Schrems** - NOYB founder
   - Twitter: @maxschrems
   - Focus: GDPR enforcement, privacy activism

10. **Cory Doctorow** - EFF, author
    - Twitter: @doctorow
    - Focus: Digital rights, interoperability, antitrust

**Integration Ideas:**
- Create "Expert Voices" section on homepage
- Aggregate their latest tweets/posts
- Weekly newsletter featuring their insights
- Invitation to contribute guest posts

**Technical Implementation:**
- Use Twitter API v2 (now X API) to fetch recent tweets
- Store in `expert_voices` table
- Display on `/experts` page
- Real-time updates via webhook

**Time Estimate:** 6-8 hours

---

## 🗄️ **Database & Infrastructure**

### 9. Glossary Management Interface
**Description:** Admin interface to add/update glossary definitions.

**Current Issue:**
> "How do I update the definitions list with more?"

**Technical Approach:**
- Create `glossary_terms` table
- Admin CRUD interface at `/admin/glossary`
- Rich text editor for definitions
- Category management
- Related terms linking

**Implementation Time:** 4-5 hours

---

### 10. Data Tab Accuracy System
**Description:** Ensure statistics and data displays are accurate and auto-updating.

**Current Issue:**
> "Can we check the data tab for accuracy and how do we ensure accuracy moving forward?"

**Technical Approach:**
- Document all data sources in `data_sources` table
- Include: source URL, update frequency, last_fetched
- Create monitoring dashboard showing data freshness
- Alert system for stale data (>7 days old)
- Data validation rules per metric

**Implementation Time:** 3-4 hours

---

## 📊 **Priority Matrix**

| Feature | Impact | Effort | Priority | Timeline |
|---------|--------|--------|----------|----------|
| Fix read_time_minutes DB error | Critical | 10 mins | P0 | Immediate |
| Tweet-to-site mechanism | High | 4-6 hrs | P1 | Week 1 |
| Feed image assignment | High | 3-4 hrs | P1 | Week 1 |
| Dynamic featured articles | High | 1-2 hrs | P1 | Week 1 |
| Scheduling fix | High | 2-3 hrs | P1 | Week 2 |
| Video insights feed | Medium | 2-3 hrs | P2 | Week 2 |
| GPT-4 content curation | Medium | 8-12 hrs | P2 | Week 3 |
| Public datasets integration | Medium | 12-16 hrs | P2 | Month 1 |
| Expert voices tracking | Medium | 6-8 hrs | P2 | Month 1 |
| Glossary admin interface | Low | 4-5 hrs | P3 | Month 2 |
| Data accuracy monitoring | Medium | 3-4 hrs | P2 | Month 1 |
| Fine-tuned micro-LLM | Low | 20-30 hrs | P3 | Month 3+ |

---

## 💰 **Cost Estimates**

### Monthly Recurring Costs
- **Twilio SMS:** ~$10-20/month (500 texts)
- **GPT-4 Content Curation:** ~$50-100/month (5000 items analyzed)
- **Additional API calls:** ~$20-30/month

### One-Time Costs
- **Fine-tuned Model Training:** $200-500 (if pursued)
- **Development Time:** 50-70 hours total for all P1-P2 features

---

## 🔄 **Implementation Phases**

### **Phase 1: Critical Fixes (Week 1)**
- Fix Supabase schema cache issue
- Dynamic featured articles
- Tweet-to-site mechanism
- Feed image assignment

### **Phase 2: Content Enhancement (Weeks 2-3)**
- Video insights integration
- Scheduling system fix
- GPT-4 content curation pilot

### **Phase 3: Data & Insights (Month 1-2)**
- Public datasets integration
- Expert voices tracking
- Data accuracy monitoring
- Glossary admin interface

### **Phase 4: Advanced Features (Month 3+)**
- Fine-tuned micro-LLM (if ROI justifies)
- Advanced analytics dashboard
- API for external developers
- Mobile app considerations

---

## 📝 **Notes**

- All features should maintain current site performance (<2s page load)
- Prioritize features that drive user engagement (content variety, freshness)
- Consider cost vs. value for AI-powered features
- Document all third-party API integrations
- Regular security audits for SMS/email-to-post features

---

**Last Updated:** 2025-11-12
**Next Review:** 2025-12-01
