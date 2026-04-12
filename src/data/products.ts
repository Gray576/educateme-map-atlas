import type { Product } from "@/types";

export const PRODUCTS: Product[] = [
  // ─── LUX ─────────────────────────────────────────────────────────────────
  {
    code: "A1 · F1",
    title: "AI Literacy Workshop",
    market: "LUX",
    readiness: "green",
    model: "B2B",
    bp: "ready",
    discoveryStatus: "📋 Ready to test",
    price: "€1,500–4,000",
    revenue: "Y1: €60–120K",
    confidence: 80,
    tags: ["B2B", "All industries"],
    upsell: "→ F2 Prompt Engineering → I1 AI Finance → D1 AI for Leaders",
    details: {
      targetAudience: "HR/L&D Directors, SME CEOs, Compliance Officers",
      jtbd: "\u201cWhen EU AI Act requires AI literacy from employees, I need to quickly train the team to be compliant by Aug 2026\u201d",
      curriculum: [
        "What is AI, ML, GenAI — plain language (1h)",
        "EU AI Act Art. 4 — obligations, risks, fines (1h)",
        "Hands-on: ChatGPT/Claude for daily tasks (1.5h)",
        "AI Ethics & Responsible Use — bias, privacy (0.5h)",
      ],
      grid: {
        Format: "Half-day (4h) or full-day (8h), online or on-site",
        "Group Size": "8–20",
        Languages: "FR, EN, DE (+LU)",
        Subsidy: "SME Package AI 70% (up to €17,500), INFPC 15–35%",
      },
      priceFull: "€1,500–4,000 (B2B) / €300–500 (open)",
      deliverables:
        "AI Literacy Certificate, audit-ready documentation, AI usage policy template",
      competitive:
        "Only provider combining EU AI Act compliance + hands-on practice + audit documentation. Elements of AI = free but no certificate. HoT = €300–600 but no compliance focus.",
      whyItWorks:
        "EU AI Act Art. 4 mandatory since Feb 2025. Fine up to €7.5M. 77% of employers plan AI upskilling. Only 14.4% of LUX companies use AI. State subsidy covers 70%.",
      readinessDetail:
        "Curriculum validated, JTBD Forces done (switch score +5.6), Kano model complete, positioning tested. N=0 customer interviews — need 1 pilot.",
    },
  },
  {
    code: "A2 · F3",
    title: "AI Productivity Day",
    market: "LUX",
    readiness: "green",
    model: "B2B",
    bp: "ready",
    discoveryStatus: "📋 Ready to test",
    price: "€2,500–5,000",
    revenue: "Y1: €50–100K",
    confidence: 75,
    tags: ["B2B", "Teams"],
    upsell: "→ I1–I8 Industry Modules → D3 AI Audit",
    details: {
      targetAudience: "Team leads (marketing, HR, sales, operations), 5–15 people",
      jtbd: "\u201cWhen I need to show AI ROI in 30 days, I want to train one team in 1 day on REAL tasks\u201d",
      curriculum: [
        "Pre-work: 2–4h analysis of client docs/workflows (trainer)",
        "Session 1: AI for documents & team communication (2h)",
        "Session 2: AI for department-specific tasks (2h)",
        "Session 3: Building 5–10 ready AI workflows (2h)",
        "Wrap-up: ROI assessment + implementation plan (2h)",
      ],
      grid: {
        Format: "1 day (8h), on client's real tasks",
        "Group Size": "5–15 (one team)",
        Languages: "FR, EN, DE",
        Subsidy: "SME Package AI 70%, INFPC 15–35%",
      },
      priceFull: "€2,500–5,000",
      deliverables:
        "5–10 ready AI workflows for the team, ROI estimate, implementation plan",
      competitive:
        "NOBODY in Luxembourg offers this format. Everyone uses generic examples. F3 = consulting disguised as training.",
      whyItWorks:
        "Highest PULL score (8.3/10) among ALL products. Lowest HABIT (5.5) — no entrenched competitor. 'Work on YOUR tasks' format is unique.",
      readinessDetail:
        "Concept validated via Forces Analysis. Need 1 pilot to validate pre-work process.",
    },
  },
  {
    code: "A3 · F2",
    title: "Prompt Engineering Workshop",
    market: "LUX",
    readiness: "green",
    model: "B2B",
    bp: "ready",
    discoveryStatus: "📋 Ready to test",
    price: "€2,000–4,000",
    revenue: "Y1: €40–80K",
    confidence: 70,
    tags: ["B2B", "Teams using AI"],
    upsell: "→ I1–I8 Industry Modules → D2 AI Agents",
    details: {
      targetAudience: "Teams already using AI (post-awareness)",
      jtbd: "\u201cWhen the team already uses ChatGPT but inefficiently, they need proper techniques for consistent, quality output\u201d",
      curriculum: [
        "Prompt engineering fundamentals — context, instructions, examples (2h)",
        "Advanced: chain-of-thought, few-shot, system prompts (2h)",
        "Tool mastery — ChatGPT, Claude, Copilot, Gemini (2h)",
        "AI for documents, presentations, email, data analysis (2h)",
      ],
      grid: {
        Format: "1–2 days, hands-on workshop",
        "Group Size": "8–15",
        Languages: "FR, EN, DE",
        Subsidy: "SME Package AI 70%, INFPC 15–35%",
      },
      priceFull: "€2,000–4,000 (B2B) / €400–700 (individual)",
      deliverables:
        "Company-specific prompt library (30–50 tested prompts), best practices doc",
      competitive:
        "We sell customization, not knowledge. Generic prompting = free. YOUR-business-specific library = paid.",
      whyItWorks:
        "Switch score +5.7 after mitigation. Main blocker (free content) mitigated via customization angle.",
      readinessDetail:
        "Forces analysis complete, curriculum framework ready. Need pre-sale 'Prompt Audit' tool validation.",
    },
  },
  {
    code: "A4 · I1",
    title: "AI for Finance & Compliance",
    market: "LUX",
    readiness: "yellow",
    model: "B2B",
    bp: "ready",
    discoveryStatus: "📋 Ready to test",
    price: "€8,000–15,000",
    revenue: "Y1: €80–150K",
    confidence: 75,
    tags: ["B2B", "Finance", "Regulated"],
    upsell: "→ D3 AI Audit → D4 Custom Program",
    details: {
      targetAudience: "Banks, funds, PSFs, insurance — 461+ financial institutions in LUX",
      jtbd: "\u201cWhen CSSF requires AI governance + EU AI Act compliance, I need to train the team and deploy AI to cut operational costs 20–30%\u201d",
      curriculum: [
        "AI Literacy for finance + EU AI Act + CSSF guidelines (1 day)",
        "AI for AML/KYC — automated screening, transaction monitoring (1 day)",
        "AI for risk management and fraud detection (1 day)",
        "AI for document processing — contracts, reports, filings (1 day)",
        "AI Governance framework — policies, audit trail, responsible AI (capstone)",
      ],
      grid: {
        Format: "2–4 days or 4–8 weeks (blended)",
        "Group Size": "8–20",
        Languages: "FR, EN, DE",
        Subsidy: "SME Package AI 70%, Fit4AI 50%/30%",
      },
      priceFull: "€8,000–15,000 (B2B) / €1,000–1,500 (individual)",
      deliverables: "AI governance framework, AML/KYC automation setup, audit documentation",
      competitive:
        "CSSF: 28% financial institutions with AI in production, 60% GenAI without usage policy. Educateme = only multilingual provider with CSSF focus.",
      whyItWorks:
        "Strongest Industry module — regulatory push + high willingness to pay. Switch score +5.8.",
      readinessDetail:
        "Framework complete. Needs finance domain expert/consultant for content. Launch Q2 2026.",
    },
  },
  {
    code: "A5 · NEW",
    title: "MiFID II Compliance Training",
    market: "LUX",
    readiness: "yellow",
    model: "B2B",
    bp: "hypothesis",
    discoveryStatus: "💡 Hypothesis",
    price: "€800–1,500",
    revenue: "Y1: €80–120K",
    confidence: 70,
    tags: ["B2B", "Finance", "Mandatory"],
    upsell: "→ I1 AI Finance → D3 AI Audit",
    details: {
      targetAudience:
        "All financial sector employees providing investment services (73K in LUX)",
      jtbd: "\u201cCSSF Circular 17/670 mandates 60h training. Need accredited course for compliance\u201d",
      curriculum: [
        "MiFID II: client categorisation, suitability, product governance (15h)",
        "Market abuse & insider dealing (10h)",
        "AML/KYC obligations (10h)",
        "Financial instruments & markets (10h)",
        "Regulatory framework & CSSF requirements (10h)",
        "Ethics & professional conduct (5h)",
      ],
      grid: {
        Format: "Modular course 60–69h (MiFID II, AML, market abuse)",
        "Group Size": "10–25",
        Languages: "FR, DE, EN, PT, IT",
        Subsidy: "INFPC 15–35%",
      },
      priceFull: "€800–1,500/person; B2B €5,000–15,000",
      deliverables: "CSSF-accredited completion certificate, audit documentation",
      competitive:
        "House of Training = FR/EN only. GAP: no DE/PT/IT providers. CSSF deadline June 30, 2026.",
      whyItWorks:
        "Regulatory mandate = guaranteed demand. License content + add language layer. HoT = potential partner, not competitor.",
      readinessDetail:
        "HYPOTHESIS. Need: 1) Study CSSF approved list, 2) Find content partner, 3) Apply for accreditation (2–3 months).",
    },
  },
  {
    code: "A6 · NEW",
    title: "Expat Onboarding 'Luxembourg Ready'",
    market: "LUX",
    readiness: "yellow",
    model: "B2B",
    bp: "hypothesis",
    discoveryStatus: "💡 Hypothesis",
    price: "€2,500–4,000",
    revenue: "Y1: €125–200K",
    confidence: 72,
    tags: ["B2B", "HR", "Relocation"],
    upsell: "→ Sproochtest → Integration Bundle → B2B corporate training",
    details: {
      targetAudience:
        "HR departments of companies relocating employees to Luxembourg (Big 4, funds, IT)",
      jtbd: "\u201cWhen a company relocates an employee, they need fast language + cultural integration to reduce turnover and speed up productivity\u201d",
      curriculum: [
        "Language intensive: FR or DE (level by assessment, 40h)",
        "Luxembourgish basics: A0–A1 for everyday life (10h)",
        "Cultural orientation: business etiquette, institutions, healthcare (4h)",
        "Practical integration: banks, schools, transport, admin (4h)",
        "Networking: intro to expat community + professional networks (2h)",
        "Sproochtest prep path (optional, +20h)",
      ],
      grid: {
        Format: "90-day program: intensive FR/DE + LU basics + cultural orientation",
        "Group Size": "1–5 per company",
        Languages: "FR, DE, EN, LU",
        Subsidy: "INFPC 15–35%",
      },
      priceFull: "€2,500–4,000/employee (3-month program)",
      deliverables:
        "Language assessment report, integration checklist, Sproochtest readiness evaluation",
      competitive:
        "NOBODY sells a single 'relocation language + integration' package. Companies assemble piecemeal.",
      whyItWorks:
        "12,000 immigrants/year, 220K cross-border. Reframe: 'Sell not courses but insurance against relocation failure.' HR ROI: 40% turnover reduction × €100K replacement / €5K = 8x.",
      readinessDetail:
        "HYPOTHESIS. Need: 5 validation calls with HR managers from Big 4/fund industry. Product = repackaging existing courses + cultural module.",
    },
  },
  {
    code: "A7 · PRO-FR",
    title: "Professional French (sector-specific)",
    market: "LUX",
    readiness: "green",
    model: "B2B,B2C",
    bp: "ready",
    discoveryStatus: "📋 Ready to test",
    price: "€600–800",
    revenue: "Y1: €77K",
    confidence: 78,
    tags: ["B2B", "B2C", "Cross-border"],
    upsell: "→ A9 Integration Bundle → A6 Expat Onboarding",
    details: {
      targetAudience: "228K cross-border workers, non-francophones in finance, IT, healthcare",
      jtbd: "\u201cWhen workplace requires French for contracts/meetings/compliance, I need sector-specific, not general French\u201d",
      curriculum: [
        "Finance French: banking terms, regulatory docs, client communication",
        "Healthcare French: patient communication, medical records, protocols",
        "Admin/Legal French: contracts, admin procedures, formal correspondence",
        "IT French: project management, technical specs, team communication",
      ],
      grid: {
        Format: "8 weeks, blended (LMS + live sessions)",
        "Group Size": "8–12",
        Languages: "FR",
        Subsidy: "INFPC 15–35%",
      },
      priceFull: "€600–800/person; B2B €2,000–6,000/group",
      deliverables:
        "Sector-specific vocabulary pack, communication templates, CEFR progress report",
      competitive:
        "Prolingua = general professional. INLL = free but slow/general. Alliance Francaise = cultural. Nobody does sector-specialized + INFPC.",
      whyItWorks:
        "47% LUX workforce = cross-border. Growing share of non-francophones. INFPC lowers barrier for employers.",
      readinessDetail:
        "Teachers ready, LMS ready. Need variant curricula (Finance first). Pilot on existing B2B clients.",
    },
  },
  {
    code: "A8 · NEW",
    title: "B2B Language Proficiency Audit",
    market: "LUX",
    readiness: "yellow",
    model: "B2B",
    bp: "hypothesis",
    discoveryStatus: "💡 Hypothesis",
    price: "€3,000–8,000",
    revenue: "Y1: €45–120K + training upsell €100K+",
    confidence: 68,
    tags: ["B2B", "Assessment", "Consulting"],
    upsell: "→ ANY language training product (perfect funnel entry)",
    details: {
      targetAudience:
        "Fund admins, law firms, fiduciaries — companies with multilingual operations",
      jtbd: "\u201cWhen a company hires/evaluates a multilingual workforce, they need objective level assessment + gap analysis\u201d",
      curriculum: [
        "Structured CEFR assessment: reading, writing, listening, speaking",
        "Luxembourg-specific: includes Luxembourgish (unique)",
        "Gap analysis report per employee + department",
        "Recommendations: training paths per gap level",
        "Optional: mini-audit (5 employees) as free lead magnet",
      ],
      grid: {
        Format: "Assessment (CEFR-aligned) + gap report + recommendations",
        "Group Size": "20–100 employees per audit",
        Languages: "FR, DE, EN, LU",
        Subsidy: "—",
      },
      priceFull: "€3,000–8,000/company (20–100 employees)",
      deliverables:
        "Company Language Capability Report, per-employee CEFR levels, training recommendations",
      competitive:
        "Pearson (Versant), Cambridge (Linguaskill), Pipplet = generic, English-focused. Allingua (LUX) = closest. Nobody does LU-specific trilingual audit.",
      whyItWorks:
        "78% of employers use language tests. Model: 'audit → find problem → sell solution.' Margin 70–75%.",
      readinessDetail:
        "HYPOTHESIS. Need: build assessment framework (CEFR), pilot with 3 companies (free mini-audit).",
    },
  },
  {
    code: "A9 · INT",
    title: "Integration Bundle (Sproochtest+)",
    market: "LUX",
    readiness: "green",
    model: "B2B,B2C",
    bp: "ready",
    discoveryStatus: "📋 Ready to test",
    price: "€200–400",
    revenue: "Y1: €55K",
    confidence: 80,
    tags: ["B2C", "B2B", "Integration"],
    upsell: "→ Sproochtest full course → A6 Expat Onboarding (B2B)",
    details: {
      targetAudience:
        "Existing Sproochtest students + HR departments for onboarding foreigners",
      jtbd: "\u201cWhen preparing for naturalisation, I want not just language but also understanding of the system — institutions, healthcare, schools\u201d",
      curriculum: [
        "Luxembourg institutions: government, commune, social security (2h)",
        "Healthcare system: CNS, doctors, pharmacies, emergency (2h)",
        "Education system: schools, crèches, aide financière (2h)",
        "Practical admin: bank account, transport, driving license (2h)",
        "Rights & responsibilities: voting, taxes, work permits (2h)",
      ],
      grid: {
        Format: "Add-on modules to existing Sproochtest course",
        "Group Size": "Same as Sproochtest (10)",
        Languages: "LU, FR, DE",
        Subsidy: "—",
      },
      priceFull: "+€200–400 upsell / B2B €1,000–3,000",
      deliverables:
        "Integration checklist, key contacts directory, Sproochtest + civic knowledge",
      competitive:
        "INLL = free but waitlists. Prolingua = no integration bundle. Educateme = already #1 in Sproochtest — pure upsell.",
      whyItWorks:
        "Minimal investment (€2K). No new traffic needed — sell to existing students. B2B: HR onboarding packages.",
      readinessDetail: "Add modules to existing course. Content creation 2 weeks. Low risk.",
    },
  },
  {
    code: "A10 · ESG",
    title: "CSRD/ESG Compliance Training",
    market: "LUX",
    readiness: "red",
    model: "B2B",
    bp: "hypothesis",
    discoveryStatus: "💡 Hypothesis",
    price: "€800–1,500",
    revenue: "Y1: €24–45K (net after partner split)",
    confidence: 60,
    tags: ["B2B", "Compliance", "Sustainability"],
    upsell: "→ EUDR training (Dec 2026) → ongoing ESG advisory",
    details: {
      targetAudience:
        "SMEs in supply chains of large companies, subject to CSRD Wave 2–3",
      jtbd: "\u201cWhen a large client demands ESG compliance from a supplier, I need to quickly train the team on CSRD reporting\u201d",
      curriculum: [
        "CSRD overview: who, what, when, penalties (2h)",
        "ESRS standards: double materiality assessment (3h)",
        "Data collection: what to measure, tools, templates (3h)",
        "Reporting: writing sustainability report sections (2h)",
        "Supply chain: cascading requirements to suppliers (2h)",
      ],
      grid: {
        Format: "1–2 day intensive or 4-week blended",
        "Group Size": "10–20",
        Languages: "FR, EN, DE",
        Subsidy: "INFPC 15–35%",
      },
      priceFull: "€800–1,500/person; B2B €3,000–8,000",
      deliverables:
        "CSRD readiness checklist, materiality assessment template, reporting templates",
      competitive:
        "Big 4 = €5,000+/person (enterprise). CSRD Institute = €995 (English-only online). No French/German CSRD training for LUX SMEs.",
      whyItWorks:
        "CSRD Wave 2 reporting NOW. Supply chain cascade = SMEs face questionnaires. FR/DE gap in market.",
      readinessDetail:
        "HYPOTHESIS. Educateme = 0 ESG expertise. Need content partner (ESG consultancy). 50/50 revenue share. 2–3 months.",
    },
  },
  {
    code: "L1 · SPROOCH",
    title: "Sproochtest Preparation",
    market: "LUX",
    readiness: "green",
    model: "B2C",
    bp: "live",
    discoveryStatus: "✅ Live — revenue",
    price: "€910–2,520",
    revenue: "Y1: Established (core)",
    confidence: 95,
    tags: ["B2C", "Citizenship", "Flagship"],
    upsell: "→ A9 Integration Bundle → Luxembourgish for Business",
    details: {
      targetAudience:
        "Individuals preparing for Luxembourgish citizenship exam (Sproochtest)",
      jtbd: "\u201cWhen I need to pass the Sproochtest for Luxembourg nationality, I want the best prep course to pass on the first attempt\u201d",
      curriculum: [
        "Luxembourgish A1–B1 grammar & vocabulary",
        "Sproochtest exam format: Héierverständnis, Schwetzen, Liesen",
        "Practice exams with mock Sproochtest simulations",
        "Pronunciation & conversation practice",
        "Cultural context for citizenship interview",
      ],
      grid: {
        Format: "Online group classes (~10 students), LMS with recordings",
        "Group Size": "~10 students",
        Languages: "LU",
        Subsidy: "Government reimbursement ~€750 after exam pass",
      },
      priceFull: "€910 (26h short) / €2,520 (72h full) — €35/hr",
      deliverables:
        "Course completion certificate, exam readiness assessment, recordings for review",
      competitive:
        "Top-3 private provider in Luxembourg. 98% pass rate (highest). INLL = free but waitlists. Prolingua = lower pass rate.",
      whyItWorks:
        "98% pass rate (highest among private providers). Core product. Established brand. Strong demand with waiting list.",
      readinessDetail: "100% — LIVE product. Established operations. Core revenue driver.",
    },
  },
  {
    code: "L2 · LETZ-CARE",
    title: "Lëtz Care — Medical Luxembourgish",
    market: "LUX",
    readiness: "green",
    model: "B2B",
    bp: "piloting",
    discoveryStatus: "🔄 Piloting",
    price: "€2,400–9,600",
    revenue: "Y1: Pilot stage (scaling)",
    confidence: 85,
    tags: ["B2B", "Healthcare", "Medical"],
    upsell: "→ I3 AI for Healthcare (bundle −15%) → Full corporate language package",
    details: {
      targetAudience:
        "Hospitals, clinics, care networks, pharmacies, elderly care — medical staff needing patient communication in Luxembourgish",
      jtbd: "\u201cWhen my medical staff cannot communicate with Luxembourgish-speaking patients, I need specialized training so patient safety and satisfaction improve\u201d",
      curriculum: [
        "Module A0→A1: Greetings, basic patient intake, appointment scheduling",
        "Module A1→A2: Medical history, symptoms, medication instructions",
        "Module A2: Consent forms, discharge instructions, SBAR handovers",
        "Roleplays: patient consultations, phone calls, emergency communication",
        "Medical terminology: body parts, conditions, procedures in Luxembourgish",
      ],
      grid: {
        Format:
          "8–12 weeks per module (A0→A1→A2), live online, small groups, evening sessions with recordings",
        "Group Size": "6–10",
        Languages: "LU (taught via FR)",
        Subsidy: "INFPC co-financing 15–35%",
      },
      priceFull: "€2,400–9,600 per cohort (before INFPC co-financing)",
      deliverables:
        "CEFR progress assessment, medical vocabulary certification, roleplay recordings",
      competitive:
        "ONLY specialized medical Luxembourgish program in Luxembourg. No competitor exists. Blue ocean.",
      whyItWorks:
        "Only product of its kind. Healthcare sector chronic staffing with non-LU speakers. Cross-sell with AI Healthcare (I3) at 15% bundle discount.",
      readinessDetail: "70% — Curriculum complete. Piloting stage. Active B2B sales.",
    },
  },
  {
    code: "L3 · FR-WORK",
    title: "French for Work & Business",
    market: "LUX",
    readiness: "green",
    model: "B2B",
    bp: "piloting",
    discoveryStatus: "🔄 Piloting",
    price: "€2,000–6,000",
    revenue: "Y1: Pilot stage (testing variants)",
    confidence: 80,
    tags: ["B2B", "Corporate", "Languages"],
    upsell: "→ A7 Professional French (advanced) → Corporate language package",
    details: {
      targetAudience:
        "Cross-border teams, finance, IT, retail, healthcare, public sector — non-francophone employees",
      jtbd: "\u201cWhen my team needs professional French for meetings, emails, and client communication, I want industry-specific training, not generic courses\u201d",
      curriculum: [
        "Finance French: banking terminology, regulatory docs, client correspondence",
        "IT French: project management, technical specs, team communication",
        "Retail & Hospitality French: customer service, complaints, daily operations",
        "Healthcare French: patient communication, medical records, protocols",
        "Public Sector French: admin procedures, legal terminology, formal correspondence",
      ],
      grid: {
        Format: "8–16 weeks, live online, small groups, industry-specific variants",
        "Group Size": "6–12",
        Languages: "FR",
        Subsidy: "INFPC co-financing 15–35%",
      },
      priceFull: "€2,000–6,000 per group / €400–800 per person",
      deliverables:
        "Industry vocabulary pack, communication templates, CEFR progress report, session recordings",
      competitive:
        "Prolingua = general professional French. INLL = free but generic & slow. Alliance Francaise = cultural focus. Nobody does sector-specialized + INFPC.",
      whyItWorks:
        "228K cross-border workers (47% of LUX workforce). Growing non-francophone share. Multiple industry variants = multiple buyer segments.",
      readinessDetail:
        "60% — Testing stage. Teachers ready. Needs variant curricula finalization (Finance first).",
    },
  },
  {
    code: "L4 · CORP-LANG",
    title: "Custom Corporate Language Programs",
    market: "LUX",
    readiness: "green",
    model: "B2B",
    bp: "live",
    discoveryStatus: "✅ Live — revenue",
    price: "€3,000–10,000",
    revenue: "Y1: Active growth (B2B core)",
    confidence: 90,
    tags: ["B2B", "Corporate", "Languages"],
    upsell: "→ AI products (F1–F3) → Lëtz Care → A6 Expat Onboarding",
    details: {
      targetAudience:
        "Any Luxembourg company needing language training for employees — ALL languages",
      jtbd: "\u201cWhen my company needs to train employees in any language, I want a flexible program with LMS tracking and INFPC subsidy support\u201d",
      curriculum: [
        "Needs assessment & placement test",
        "Customized curriculum based on company needs & industry",
        "Regular live sessions (group or 1:1)",
        "LMS access: progress tracking, recordings, homework",
        "Quarterly progress reports for HR",
        "CEFR-aligned milestones",
      ],
      grid: {
        Format: "Online, hybrid, or on-site / group or 1:1 / 8–52 weeks flexible",
        "Group Size": "1–20",
        Languages: "FR, EN, DE, LU, PT, ES, IT + more",
        Subsidy: "INFPC co-financing 15–35%",
      },
      priceFull: "€3,000–10,000 per team package",
      deliverables:
        "Real-time analytics for HR, attendance tracking, CEFR progress reports, session recordings",
      competitive:
        "Berlitz (global, expensive), Prolingua (local, general), freelancers (no tracking). Educateme = LMS analytics + INFPC + multilingual + flexible.",
      whyItWorks:
        "Core B2B growth engine. Active client base. Ministry of Education certified → INFPC eligible.",
      readinessDetail: "90% — LIVE service. Multiple client references. Active sales pipeline.",
    },
  },
  {
    code: "L5 · LU-BIZ",
    title: "Luxembourgish for Business",
    market: "LUX",
    readiness: "green",
    model: "B2B,B2C",
    bp: "live",
    discoveryStatus: "✅ Live — revenue",
    price: "€500–1,200",
    revenue: "Y1: Established (steady demand)",
    confidence: 85,
    tags: ["B2B", "B2C", "Languages"],
    upsell: "→ L1 Sproochtest Prep → A9 Integration Bundle",
    details: {
      targetAudience:
        "Expat employees, cross-border teams, public sector candidates needing Luxembourgish",
      jtbd: "\u201cWhen I need Luxembourgish for workplace integration or public sector career, I want a structured course leading to real conversational ability\u201d",
      curriculum: [
        "A1: Basic greetings, introductions, simple workplace phrases",
        "A2: Meetings, phone calls, small talk with colleagues",
        "B1: Presentations, negotiations, professional correspondence",
        "Cultural modules: workplace etiquette, networking, institutions",
      ],
      grid: {
        Format: "12–24 weeks (A1→B1), live online, small groups",
        "Group Size": "6–12",
        Languages: "LU",
        Subsidy: "Congé linguistique (200h paid leave for LU language courses), INFPC",
      },
      priceFull: "€2,500–8,000 per group / €500–1,200 per person",
      deliverables: "CEFR certification, workplace vocabulary pack, cultural guide",
      competitive:
        "INLL = free but overcrowded. Prolingua = competitor. Educateme edge: LMS + recordings + flexible scheduling.",
      whyItWorks:
        "Congé linguistique = 200h paid leave is a major selling point for employees. Growing demand from integration requirements.",
      readinessDetail: "80% — LIVE product. Established operations.",
    },
  },

  // ─── EU ──────────────────────────────────────────────────────────────────
  {
    code: "B1 · MED-DE",
    title: "German for Nurses (B1→B2 Pflege Sprint)",
    market: "EU",
    readiness: "yellow",
    model: "B2B,B2C",
    bp: "hypothesis",
    discoveryStatus: "💡 Hypothesis",
    price: "€699–1,200",
    revenue: "Y1: €90K (4 cohorts × 15 × €1,500)",
    confidence: 75,
    tags: ["B2C", "B2B", "Healthcare", "Migration"],
    upsell: "→ B2 Medical French → Full pipeline (recruit+train+place)",
    details: {
      targetAudience:
        "Nurses from India, Philippines, Morocco, Brazil — preparing to work in Germany",
      jtbd: "\u201cWhen I need to move to Germany and work as a nurse, I want to quickly pass telc B1–B2 Pflege to bring my family from €400/mo to €2,800/mo\u201d",
      curriculum: [
        "ONLY B1→B2 (not A1–B2 — narrow scope = premium quality)",
        "Medical vocabulary: Anamnese, Pflegebericht, Übergabe (20h)",
        "Klinikkommunikation: patient conversation, doctor handoff (15h)",
        "telc Pflege exam prep: format, strategies, mock tests (10h)",
        "AI practice partner: 24/7 conversation simulation (unlimited)",
        "Weekly live session with native DE teacher (1.5h × 12)",
      ],
      grid: {
        Format: "8–12 weeks online sprint, AI practice 24/7 + weekly live teacher",
        "Group Size": "10–15 per cohort",
        Languages: "DE, EN (support)",
        Subsidy: "—",
      },
      priceFull: "€699 (B2C) / €1,200 (white-label for agencies)",
      deliverables:
        "telc Pflege mock exam results, vocabulary mastery report, exam-day preparation kit",
      competitive:
        "iQ Lingua (in-person Germany), Evolanguage (live online), Goethe (€800+, not healthcare). BAMF = free but in-person, 6+ month waitlists. NO strong online-first healthcare German brand.",
      whyItWorks:
        "30–40K nurse deficit in Germany. 300K+ foreign nurses already there (17.8%). Bilateral agreements with India, Morocco, Brazil. Reframe: 'JTBD is not learning German — it's moving your family to €2,800/mo.'",
      readinessDetail:
        "HYPOTHESIS. Need: build curriculum (4–6 weeks), contact 2–3 German recruitment agencies, pilot with 10 students.",
    },
  },
  {
    code: "B2 · MED-FR",
    title: "Medical French for Nurses",
    market: "EU",
    readiness: "red",
    model: "B2B,B2C",
    bp: "hypothesis",
    discoveryStatus: "💡 Hypothesis",
    price: "€499–899",
    revenue: "Y1: €40–60K",
    confidence: 65,
    tags: ["B2C", "B2B", "Healthcare", "Migration"],
    upsell: "→ B5 Healthcare Recruitment Pipeline",
    details: {
      targetAudience: "Migrant nurses heading to France, Belgium, Switzerland",
      jtbd: "\u201cSame as B1 but for French-speaking healthcare systems\u201d",
      curriculum: [
        "Medical French B1–B2: patient communication, medical records (20h)",
        "French healthcare system: Sécurité sociale, hospital protocols (10h)",
        "Exam prep: DELF/DALF Pro Santé or TCF (10h)",
        "AI practice partner: 24/7 conversation simulation",
      ],
      grid: {
        Format: "Similar to B1, adapted for French medical context",
        "Group Size": "10–15",
        Languages: "FR, EN (support)",
        Subsidy: "—",
      },
      priceFull: "€499–899",
      deliverables: "DELF/TCF mock results, medical vocabulary mastery",
      competitive: "No dedicated online Medical French provider identified.",
      whyItWorks:
        "France needs 500K+ healthcare workers. Same model as B1 validated first, then replicate.",
      readinessDetail:
        "HYPOTHESIS. Launch AFTER B1 validates model. Curriculum build 6–8 weeks.",
    },
  },
  {
    code: "B3 · F1-EU",
    title: "AI Literacy (EU-wide remote)",
    market: "EU",
    readiness: "green",
    model: "B2B",
    bp: "ready",
    discoveryStatus: "📋 Ready to test",
    price: "€1,500–4,000",
    revenue: "Y1: €30–60K (incremental)",
    confidence: 75,
    tags: ["B2B", "Remote", "EU AI Act"],
    upsell: "→ F2, F3 (may require in-person for full value)",
    details: {
      targetAudience: "Any EU company under AI Act Art. 4 — remote delivery",
      jtbd: "\u201cSame as A1, wider geographic targeting\u201d",
      curriculum: [
        "Same as A1 — adapted for EU-wide remote delivery",
        "Country-specific AI Act compliance nuances",
        "Multilingual delivery (Benelux, DACH coverage)",
      ],
      grid: {
        Format: "Same as A1, online delivery",
        "Group Size": "8–20",
        Languages: "FR, EN, DE",
        Subsidy: "Depends on country",
      },
      priceFull: "€1,500–4,000",
      deliverables: "Same as A1",
      competitive:
        "Same as A1 + geographic reach advantage (multilingual for Benelux, DACH)",
      whyItWorks:
        "EU AI Act applies to ALL EU companies. Most training is English-only. Educateme = FR/DE/EN.",
      readinessDetail:
        "Same product as A1. Needs wider marketing (LinkedIn EU targeting, partnerships).",
    },
  },
  {
    code: "B4 · WL",
    title: "White-Label Course Licensing",
    market: "EU",
    readiness: "yellow",
    model: "B2B",
    bp: "hypothesis",
    discoveryStatus: "💡 Hypothesis",
    price: "€5,000–15,000/yr",
    revenue: "Y1: €25–150K",
    confidence: 65,
    tags: ["B2B", "Licensing", "Platform"],
    upsell: "→ Ongoing curriculum updates subscription",
    details: {
      targetAudience:
        "Belgian language schools, integration NGOs (Caritas, Red Cross), corporate training depts",
      jtbd: "\u201cWhen you need a ready-made Sproochtest/Medical LU/French for Work course, it's easier to license than create\u201d",
      curriculum: [
        "Existing Sproochtest, Lëtz Care, French for Work curricula — packaged for licensing",
      ],
      grid: {
        Format: "Curriculum packages (PDF + video + teacher guides) or LMS access",
        "Group Size": "N/A",
        Languages: "LU, FR, DE",
        Subsidy: "—",
      },
      priceFull: "€5,000–15,000/year per licensee OR €200–500/student",
      deliverables:
        "Licensed curriculum, teacher training materials, 'Educateme Certified' badge",
      competitive:
        "Unique content — Sproochtest prep is proprietary. No one else can create it at this quality.",
      whyItWorks:
        "Near-zero marginal cost. Defensible content (Luxembourg-specific). Belgium + border region demand.",
      readinessDetail:
        "HYPOTHESIS. Need: package top 3 courses, legal template for licensing, approach Belgian schools.",
    },
  },
  {
    code: "B5 · RECRUIT",
    title: "Healthcare Recruitment Pipeline",
    market: "EU",
    readiness: "red",
    model: "B2B2C",
    bp: "hypothesis",
    discoveryStatus: "💡 Hypothesis",
    price: "€2–4K + rev share",
    revenue: "Y1: €100–240K (at 20 placements)",
    confidence: 60,
    tags: ["B2B2C", "Healthcare", "Recruitment"],
    upsell:
      "→ Ongoing language support subscription → Lëtz Care for placed nurses",
    details: {
      targetAudience: "Recruitment agencies + Benelux hospitals (partnership model)",
      jtbd: "\u201cWhen an agency recruits nurses for EU, they need a language training component in the pipeline\u201d",
      curriculum: [
        "Medical language intensive: B1→B2 (German or French) (200h)",
        "Healthcare system orientation (20h)",
        "Interview prep + CV + credential recognition support (10h)",
        "Post-placement language support (3 months)",
      ],
      grid: {
        Format: "6-month intensive language + placement support",
        "Group Size": "Cohort 10–20",
        Languages: "DE, FR",
        Subsidy: "EU/Erasmus+ potential",
      },
      priceFull: "€2–4K/nurse (language) + rev share on placement (€3–8K)",
      deliverables: "Language certificate, placement support, ongoing coaching",
      competitive:
        "Li-reco (Sweden) = model. Vivantes International (Germany). No one does this for Luxembourg/Belgium.",
      whyItWorks:
        "Europe needs 950K health workers by 2030. Agencies spend £10–17K per nurse. Language = bottleneck.",
      readinessDetail:
        "HYPOTHESIS. Need: find recruitment agency partner, build Medical French B2 curriculum. 6–12 months.",
    },
  },
  {
    code: "B6 · EMBED",
    title: "Embedded Onboarding for Staffing Agencies",
    market: "EU",
    readiness: "yellow",
    model: "B2B2C",
    bp: "hypothesis",
    discoveryStatus: "💡 Hypothesis",
    price: "€1,500–3,000",
    revenue: "Y1: €50–80K",
    confidence: 65,
    tags: ["B2B2C", "Staffing", "Integration"],
    upsell: "→ A6 Expat Onboarding (for the employer directly)",
    details: {
      targetAudience: "EU staffing/relocation agencies placing workers in Benelux",
      jtbd: "\u201cWhen an agency places a worker, a turnkey language package increases their value proposition and fee\u201d",
      curriculum: [
        "Intensive language (FR or DE): workplace communication (40–60h)",
        "Luxembourg/Belgium orientation: culture, admin, practical (10h)",
        "Industry-specific vocabulary (10h)",
      ],
      grid: {
        Format: "Turnkey landing package bundled into agency placement fee",
        "Group Size": "1–5 per placement",
        Languages: "FR, DE, EN, LU",
        Subsidy: "—",
      },
      priceFull: "€1,500–3,000/package (20–80h language + orientation)",
      deliverables: "Language progress report, integration checklist",
      competitive:
        "RPO market growing 15.4% CAGR. Agencies charge €1,500 more per placement with language included.",
      whyItWorks:
        "EU Blue Card issuances grew 300%. Revised directive lowers thresholds. More workers need integration.",
      readinessDetail:
        "HYPOTHESIS. Identify 2–3 staffing agencies in LUX/BE. Propose pilot partnership.",
    },
  },

  // ─── GCC ─────────────────────────────────────────────────────────────────
  {
    code: "C1 · OET",
    title: "OET Prep (repriced)",
    market: "GCC",
    readiness: "green",
    model: "B2C",
    bp: "piloting",
    discoveryStatus: "🔄 Piloting",
    price: "€149–199",
    revenue: "Y1: €15–30K",
    confidence: 70,
    tags: ["B2C", "Healthcare", "International"],
    upsell: "→ OET Medical (doctors, €1,200) → Career coaching",
    details: {
      targetAudience:
        "Nurses and doctors in UAE/GCC preparing for OET for career advancement",
      jtbd: "\u201cWhen I need an OET certificate for DHA/DOH registration or migration to UK/AU, I want an affordable quality prep course\u201d",
      curriculum: [
        "OET Reading: scanning, skimming, medical texts (8h)",
        "OET Listening: clinical dialogues, health presentations (8h)",
        "OET Writing: referral letters — 15–24 practice letters with feedback (20h)",
        "OET Speaking: role-plays, patient consultation scenarios (12h)",
        "Mock exams: 3 full mock tests with detailed feedback",
      ],
      grid: {
        Format: "8–12 weeks, cohort-based (max 10), online",
        "Group Size": "Max 10",
        Languages: "EN",
        Subsidy: "—",
      },
      priceFull: "€149–199 (pivot from €349)",
      deliverables:
        "Mock exam scores, writing portfolio (15–24 corrected letters), speaking practice recordings",
      competitive:
        "Swoosh $99–359, E2 $59–239, Benchmark $0–219. Previous price €349 = too high. Repriced to market.",
      whyItWorks:
        "94 leads exist. Problem was pricing (€349) and targeting (93% wanted UK/AU, not UAE). Reprice + re-engage.",
      readinessDetail: "Product EXISTS. 85% ready. Just reprice + email 94 leads. Cost: €0.",
    },
  },
  {
    code: "L6 · OET-NUR",
    title: "OET Nursing Preparation",
    market: "GCC",
    readiness: "green",
    model: "B2C",
    bp: "piloting",
    discoveryStatus: "🔄 Piloting",
    price: "€199–599",
    revenue: "Y1: Pilot stage (validated curriculum)",
    confidence: 85,
    tags: ["B2C", "Healthcare", "International"],
    upsell: "→ OET Medical (doctors €1,200) → Career coaching → C1 repriced",
    details: {
      targetAudience:
        "Nurses (Filipino 40–60%, Indian 40–49%) preparing for OET exam in UAE/GCC",
      jtbd: "\u201cWhen I need OET Grade B to register with DHA/DOH or migrate to UK/AU, I want affordable, structured prep with personal feedback\u201d",
      curriculum: [
        "OET Reading: healthcare texts, scanning & skimming techniques (8h)",
        "OET Listening: clinical dialogues, health presentations (8h)",
        "OET Writing: 15–24 referral letters with personal feedback (20h)",
        "OET Speaking: patient consultation role-plays with examiner simulation (12h)",
        "Mock exams: 3 full tests with detailed scoring breakdown",
        "Writing focus: 50–60% of curriculum (main failure area)",
      ],
      grid: {
        Format: "8–12 weeks, cohort-based (max 10), online",
        "Group Size": "Max 10",
        Languages: "EN",
        Subsidy: "—",
      },
      priceFull: "€199 Essential / €349–399 Professional / €599 Premium",
      deliverables:
        "Mock exam scores, writing portfolio (15–24 corrected letters), speaking recordings, exam strategies",
      competitive:
        "Swoosh $99–359, E2 $59–239, Benchmark $0–219. Pass Guarantee + max 10 students + 15–20 writing corrections = differentiation.",
      whyItWorks:
        "OET curriculum fully validated. 85% ready. Pass Guarantee (90/90 rule). Small cohorts (max 10). Doctor-exclusive cohorts never mixed with nurses.",
      readinessDetail:
        "85% — Curriculum validated. Ready for launch. 94 leads from UAE pilot (need reprice to €199).",
    },
  },
  {
    code: "L7 · OET-DOC",
    title: "OET Medical Preparation (Doctors)",
    market: "GCC",
    readiness: "green",
    model: "B2C",
    bp: "piloting",
    discoveryStatus: "🔄 Piloting",
    price: "€700–1,500",
    revenue: "Y1: Pilot stage (premium segment)",
    confidence: 85,
    tags: ["B2C", "Healthcare", "Doctors"],
    upsell: "→ Career coaching → ECFMG pathway advisory",
    details: {
      targetAudience:
        "Doctors (specialists, consultants) in UAE/GCC — doctor-exclusive cohorts",
      jtbd: "\u201cWhen I need OET Medicine for career advancement or ECFMG, I want premium 1:1 prep with a medical instructor\u201d",
      curriculum: [
        "OET Reading: medical journals, clinical studies (8h)",
        "OET Listening: ward rounds, specialist consultations (8h)",
        "OET Writing: 24 medical letters (referrals, discharges, GP letters) (24h)",
        "OET Speaking: specialist-patient scenarios, breaking bad news, consent (16h)",
        "Medical terminology deep-dive by specialty",
        "Mock exams with MD/MBBS examiner simulation",
      ],
      grid: {
        Format: "8–16 weeks, 1:1 or small group (6–8 doctors ONLY), online",
        "Group Size": "1–8 (doctor-exclusive)",
        Languages: "EN",
        Subsidy: "—",
      },
      priceFull: "€700–850 group / €1,200 standard 1:1 / €1,500 intensive 1:1",
      deliverables:
        "24 corrected medical letters, mock exam scores, specialty-specific feedback, exam strategies",
      competitive:
        "Premium positioning: doctor-exclusive (never mixed with nurses), MD/MBBS tutors, 6AM–10PM flexibility, 24 letters (vs 10–15 at competitors).",
      whyItWorks:
        "Premium segment. High margins. ECFMG (US) now requires OET ONLY (dropped IELTS) = growing market for doctors.",
      readinessDetail:
        "85% — Curriculum validated. Tutor network: MD/MBBS + OET certified.",
    },
  },
];
