import type { ArchetypeAssignment } from "@/types";

export const RESEARCH_ARCHETYPE_ASSIGNMENTS: Record<string, ArchetypeAssignment> = {
  "A1": {
    id: "compliance_ai_training",
    label: "Compliance & AI Training",
    shortLabel: "Compliance / AI",
    confidence: 0.93,
    ruleApplied: "Card is driven by AI literacy, AI productivity, governance, compliance, CSSF, MiFID, ESG, or mandatory training signals.",
    matchedKeywords: ["ai act", "mandatory", "compliance", "ai literacy"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, All industries",
      },
      {
        field: "Target Audience",
        value: "HR/L&D Directors, SME CEOs, Compliance Officers",
      },
      {
        field: "JTBD",
        value: "\u201cWhen EU AI Act requires AI literacy from employees, I need to quickly train the team to be compliant by Aug 2026\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Only provider combining EU AI Act compliance + hands-on practice + audit documentation. Elements of AI = free but no certificate. HoT = \u20ac300\u2013600 but no complian",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Medium",
  },
  "A10": {
    id: "compliance_ai_training",
    label: "Compliance & AI Training",
    shortLabel: "Compliance / AI",
    confidence: 0.88,
    ruleApplied: "Card is driven by AI literacy, AI productivity, governance, compliance, CSSF, MiFID, ESG, or mandatory training signals.",
    matchedKeywords: ["esg", "csrd", "compliance"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Compliance, Sustainability",
      },
      {
        field: "Target Audience",
        value: "SMEs in supply chains of large companies, subject to CSRD Wave 2\u20133",
      },
      {
        field: "JTBD",
        value: "\u201cWhen a large client demands ESG compliance from a supplier, I need to quickly train the team on CSRD reporting\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Big 4 = \u20ac5,000+/person (enterprise). CSRD Institute = \u20ac995 (English-only online). No French/German CSRD training for LUX SMEs.",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Medium",
  },
  "A2": {
    id: "compliance_ai_training",
    label: "Compliance & AI Training",
    shortLabel: "Compliance / AI",
    confidence: 0.93,
    ruleApplied: "Card is driven by AI literacy, AI productivity, governance, compliance, CSSF, MiFID, ESG, or mandatory training signals.",
    matchedKeywords: [],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Teams",
      },
      {
        field: "Target Audience",
        value: "Team leads (marketing, HR, sales, operations), 5\u201315 people",
      },
      {
        field: "JTBD",
        value: "\u201cWhen I need to show AI ROI in 30 days, I want to train one team in 1 day on REAL tasks\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "NOBODY in Luxembourg offers this format. Everyone uses generic examples. F3 = consulting disguised as training.",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Medium",
  },
  "A3": {
    id: "compliance_ai_training",
    label: "Compliance & AI Training",
    shortLabel: "Compliance / AI",
    confidence: 0.93,
    ruleApplied: "Card is driven by AI literacy, AI productivity, governance, compliance, CSSF, MiFID, ESG, or mandatory training signals.",
    matchedKeywords: ["prompt"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Teams using AI",
      },
      {
        field: "Target Audience",
        value: "Teams already using AI (post-awareness)",
      },
      {
        field: "JTBD",
        value: "\u201cWhen the team already uses ChatGPT but inefficiently, they need proper techniques for consistent, quality output\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "We sell customization, not knowledge. Generic prompting = free. YOUR-business-specific library = paid.",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Medium",
  },
  "A4": {
    id: "compliance_ai_training",
    label: "Compliance & AI Training",
    shortLabel: "Compliance / AI",
    confidence: 0.9,
    ruleApplied: "Card is driven by AI literacy, AI productivity, governance, compliance, CSSF, MiFID, ESG, or mandatory training signals.",
    matchedKeywords: ["ai act", "cssf", "compliance", "governance", "finance"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Finance, Regulated",
      },
      {
        field: "Target Audience",
        value: "Banks, funds, PSFs, insurance \u2014 461+ financial institutions in LUX",
      },
      {
        field: "JTBD",
        value: "\u201cWhen CSSF requires AI governance + EU AI Act compliance, I need to train the team and deploy AI to cut operational costs 20\u201330%\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "CSSF: 28% financial institutions with AI in production, 60% GenAI without usage policy. Educateme = only multilingual provider with CSSF focus.",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Medium",
  },
  "A5": {
    id: "compliance_ai_training",
    label: "Compliance & AI Training",
    shortLabel: "Compliance / AI",
    confidence: 0.93,
    ruleApplied: "Card is driven by AI literacy, AI productivity, governance, compliance, CSSF, MiFID, ESG, or mandatory training signals.",
    matchedKeywords: ["cssf", "mifid", "mandatory", "compliance", "finance"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Finance, Mandatory",
      },
      {
        field: "Target Audience",
        value: "All financial sector employees providing investment services (73K in LUX)",
      },
      {
        field: "JTBD",
        value: "\u201cCSSF Circular 17/670 mandates 60h training. Need accredited course for compliance\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "House of Training = FR/EN only. GAP: no DE/PT/IT providers. CSSF deadline June 30, 2026.",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Medium",
  },
  "A6": {
    id: "integration_onboarding",
    label: "Integration & Onboarding",
    shortLabel: "Integration",
    confidence: 0.92,
    ruleApplied: "Card explicitly sells onboarding, relocation, integration bundle, or Luxembourg-ready package.",
    matchedKeywords: ["onboarding", "relocation", "integration", "luxembourg ready"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, HR, Relocation",
      },
      {
        field: "Target Audience",
        value: "HR departments of companies relocating employees to Luxembourg (Big 4, funds, IT)",
      },
      {
        field: "JTBD",
        value: "\u201cWhen a company relocates an employee, they need fast language + cultural integration to reduce turnover and speed up productivity\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "NOBODY sells a single \u2018relocation language + integration\u2019 package. Companies assemble piecemeal.",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Low-medium",
  },
  "A7": {
    id: "core_language_programs",
    label: "Core Language Programs",
    shortLabel: "Core Language",
    confidence: 0.77,
    ruleApplied: "Fallback for flagship/workplace/corporate language products and core language offers.",
    matchedKeywords: ["french", "workplace"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, B2C, Cross-border",
      },
      {
        field: "Target Audience",
        value: "228K cross-border workers, non-francophones in finance, IT, healthcare",
      },
      {
        field: "JTBD",
        value: "\u201cWhen workplace requires French for contracts/meetings/compliance, I need sector-specific, not general French\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Prolingua = general professional. INLL = free but slow/general. Alliance Francaise = cultural. Nobody does sector-specialized + INFPC.",
      },
    ],
    operatorDifficulty: "easy",
    operatorDifficultySourceLabel: "Low",
  },
  "A8": {
    id: "diagnostics_capability_audit",
    label: "Diagnostics & Capability Audit",
    shortLabel: "Audit",
    confidence: 0.97,
    ruleApplied: "Card explicitly sells audit, assessment, proficiency testing, or capability diagnosis.",
    matchedKeywords: ["audit", "assessment", "gap analysis", "proficiency"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Assessment, Consulting",
      },
      {
        field: "Target Audience",
        value: "Fund admins, law firms, fiduciaries \u2014 companies with multilingual operations",
      },
      {
        field: "JTBD",
        value: "\u201cWhen a company hires/evaluates a multilingual workforce, they need objective level assessment + gap analysis\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Pearson (Versant), Cambridge (Linguaskill), Pipplet = generic, English-focused. Allingua (LUX) = closest. Nobody does LU-specific trilingual audit.",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Medium",
  },
  "A9": {
    id: "integration_onboarding",
    label: "Integration & Onboarding",
    shortLabel: "Integration",
    confidence: 0.92,
    ruleApplied: "Card explicitly sells onboarding, relocation, integration bundle, or Luxembourg-ready package.",
    matchedKeywords: ["onboarding", "integration", "naturalisation"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2C, B2B, Integration",
      },
      {
        field: "Target Audience",
        value: "Existing Sproochtest students + HR departments for onboarding foreigners",
      },
      {
        field: "JTBD",
        value: "\u201cWhen preparing for naturalisation, I want not just language but also understanding of the system \u2014 institutions, healthcare, schools\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "INLL = free but waitlists. Prolingua = no integration bundle. Educateme = already #1 in Sproochtest \u2014 pure upsell.",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Low-medium",
  },
  "B1": {
    id: "regulated_workforce_pathways_exam_prep",
    label: "Regulated Workforce Pathways & Exam Prep",
    shortLabel: "Regulated Pathways",
    confidence: 0.9,
    ruleApplied: "Card is tied to healthcare communication, migration route, regulated workforce entry, exam prep, or OET/telc pathway.",
    matchedKeywords: ["oet", "telc", "pfleg", "nurse", "nurses", "healthcare", "migration"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2C, B2B, Healthcare, Migration",
      },
      {
        field: "Target Audience",
        value: "Nurses from India, Philippines, Morocco, Brazil \u2014 preparing to work in Germany",
      },
      {
        field: "JTBD",
        value: "\u201cWhen I need to move to Germany and work as a nurse, I want to quickly pass telc B1\u2013B2 Pflege to bring my family from \u20ac400/mo to \u20ac2,800/mo\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "iQ Lingua (in-person Germany), Evolanguage (live online), Goethe (\u20ac800+, not healthcare). BAMF = free but in-person, 6+ month waitlists. NO strong online-first ",
      },
    ],
    operatorDifficulty: "hard",
    operatorDifficultySourceLabel: "High",
  },
  "B2": {
    id: "regulated_workforce_pathways_exam_prep",
    label: "Regulated Workforce Pathways & Exam Prep",
    shortLabel: "Regulated Pathways",
    confidence: 0.9,
    ruleApplied: "Card is tied to healthcare communication, migration route, regulated workforce entry, exam prep, or OET/telc pathway.",
    matchedKeywords: ["nurse", "nurses", "medical", "healthcare", "migration"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2C, B2B, Healthcare, Migration",
      },
      {
        field: "Target Audience",
        value: "Migrant nurses heading to France, Belgium, Switzerland",
      },
      {
        field: "JTBD",
        value: "\u201cSame as B1 but for French-speaking healthcare systems\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "No dedicated online Medical French provider identified.",
      },
    ],
    operatorDifficulty: "hard",
    operatorDifficultySourceLabel: "High",
  },
  "B3": {
    id: "compliance_ai_training",
    label: "Compliance & AI Training",
    shortLabel: "Compliance / AI",
    confidence: 0.93,
    ruleApplied: "Card is driven by AI literacy, AI productivity, governance, compliance, CSSF, MiFID, ESG, or mandatory training signals.",
    matchedKeywords: ["ai act", "ai literacy"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Remote, EU AI Act",
      },
      {
        field: "Target Audience",
        value: "Any EU company under AI Act Art. 4 \u2014 remote delivery",
      },
      {
        field: "JTBD",
        value: "\u201cSame as A1, wider geographic targeting\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Same as A1 + geographic reach advantage (multilingual for Benelux, DACH)",
      },
    ],
    operatorDifficulty: "medium",
    operatorDifficultySourceLabel: "Medium",
  },
  "B4": {
    id: "channel_licensing_placement",
    label: "Channel, Licensing & Placement",
    shortLabel: "Channel / Placement",
    confidence: 0.95,
    ruleApplied: "Card explicitly sells licensing, recruitment, placement, staffing, partner pipeline, or embedded agency offer.",
    matchedKeywords: ["white-label", "licensing"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Licensing, Platform",
      },
      {
        field: "Target Audience",
        value: "Belgian language schools, integration NGOs (Caritas, Red Cross), corporate training depts",
      },
      {
        field: "JTBD",
        value: "\u201cWhen you need a ready-made Sproochtest/Medical LU/French for Work course, it\u2019s easier to license than create\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Unique content \u2014 Sproochtest prep is proprietary. No one else can create it at this quality.",
      },
    ],
    operatorDifficulty: "hard",
    operatorDifficultySourceLabel: "High",
  },
  "B5": {
    id: "channel_licensing_placement",
    label: "Channel, Licensing & Placement",
    shortLabel: "Channel / Placement",
    confidence: 0.95,
    ruleApplied: "Card explicitly sells licensing, recruitment, placement, staffing, partner pipeline, or embedded agency offer.",
    matchedKeywords: ["recruitment", "agency"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B2C, Healthcare, Recruitment",
      },
      {
        field: "Target Audience",
        value: "Recruitment agencies + Benelux hospitals (partnership model)",
      },
      {
        field: "JTBD",
        value: "\u201cWhen an agency recruits nurses for EU, they need a language training component in the pipeline\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Li-reco (Sweden) = model. Vivantes International (Germany). No one does this for Luxembourg/Belgium.",
      },
    ],
    operatorDifficulty: "hard",
    operatorDifficultySourceLabel: "High",
  },
  "B6": {
    id: "channel_licensing_placement",
    label: "Channel, Licensing & Placement",
    shortLabel: "Channel / Placement",
    confidence: 0.9,
    ruleApplied: "Card explicitly sells licensing, recruitment, placement, staffing, partner pipeline, or embedded agency offer.",
    matchedKeywords: ["staffing", "agency", "embedded onboarding", "placement"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B2C, Staffing, Integration",
      },
      {
        field: "Target Audience",
        value: "EU staffing/relocation agencies placing workers in Benelux",
      },
      {
        field: "JTBD",
        value: "\u201cWhen an agency places a worker, a turnkey language package increases their value proposition and fee\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "RPO market growing 15.4% CAGR. Agencies charge \u20ac1,500 more per placement with language included.",
      },
    ],
    operatorDifficulty: "hard",
    operatorDifficultySourceLabel: "High",
  },
  "C1": {
    id: "regulated_workforce_pathways_exam_prep",
    label: "Regulated Workforce Pathways & Exam Prep",
    shortLabel: "Regulated Pathways",
    confidence: 0.9,
    ruleApplied: "Card is tied to healthcare communication, migration route, regulated workforce entry, exam prep, or OET/telc pathway.",
    matchedKeywords: ["oet", "nurse", "nurses", "doctors", "healthcare", "migration", "registration"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2C, Healthcare, International",
      },
      {
        field: "Target Audience",
        value: "Nurses and doctors in UAE/GCC preparing for OET for career advancement",
      },
      {
        field: "JTBD",
        value: "\u201cWhen I need an OET certificate for DHA/DOH registration or migration to UK/AU, I want an affordable quality prep course\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Swoosh $99\u2013359, E2 $59\u2013239, Benchmark $0\u2013219. Previous price \u20ac349 = too high. Repriced to market.",
      },
    ],
    operatorDifficulty: "hard",
    operatorDifficultySourceLabel: "High",
  },
  "L1": {
    id: "core_language_programs",
    label: "Core Language Programs",
    shortLabel: "Core Language",
    confidence: 0.85,
    ruleApplied: "Fallback for flagship/workplace/corporate language products and core language offers.",
    matchedKeywords: ["luxembourgish", "citizenship"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2C, Citizenship, Flagship",
      },
      {
        field: "Target Audience",
        value: "Individuals preparing for Luxembourgish citizenship exam (Sproochtest)",
      },
      {
        field: "JTBD",
        value: "\u201cWhen I need to pass the Sproochtest for Luxembourg nationality, I want the best prep course to pass on the first attempt\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Top-3 private provider in Luxembourg. 98% pass rate (highest). INLL = free but waitlists. Prolingua = lower pass rate.",
      },
    ],
    operatorDifficulty: "easy",
    operatorDifficultySourceLabel: "Low",
  },
  "L2": {
    id: "regulated_workforce_pathways_exam_prep",
    label: "Regulated Workforce Pathways & Exam Prep",
    shortLabel: "Regulated Pathways",
    confidence: 0.78,
    ruleApplied: "Card is tied to healthcare communication, migration route, regulated workforce entry, exam prep, or OET/telc pathway.",
    matchedKeywords: ["medical", "healthcare", "patient communication"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Healthcare, Medical",
      },
      {
        field: "Target Audience",
        value: "Hospitals, clinics, care networks, pharmacies, elderly care \u2014 medical staff needing patient communication in Luxembourgish",
      },
      {
        field: "JTBD",
        value: "\u201cWhen my medical staff cannot communicate with Luxembourgish-speaking patients, I need specialized training so patient safety and satisfaction improve\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "ONLY specialized medical Luxembourgish program in Luxembourg. No competitor exists. Blue ocean.",
      },
    ],
    operatorDifficulty: "hard",
    operatorDifficultySourceLabel: "High",
  },
  "L3": {
    id: "core_language_programs",
    label: "Core Language Programs",
    shortLabel: "Core Language",
    confidence: 0.85,
    ruleApplied: "Fallback for flagship/workplace/corporate language products and core language offers.",
    matchedKeywords: ["language", "french", "corporate"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Corporate, Languages",
      },
      {
        field: "Target Audience",
        value: "Cross-border teams, finance, IT, retail, healthcare, public sector \u2014 non-francophone employees",
      },
      {
        field: "JTBD",
        value: "\u201cWhen my team needs professional French for meetings, emails, and client communication, I want industry-specific training, not generic courses\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Prolingua = general professional French. INLL = free but generic & slow. Alliance Francaise = cultural focus. Nobody does sector-specialized + INFPC.",
      },
    ],
    operatorDifficulty: "easy",
    operatorDifficultySourceLabel: "Low",
  },
  "L4": {
    id: "core_language_programs",
    label: "Core Language Programs",
    shortLabel: "Core Language",
    confidence: 0.85,
    ruleApplied: "Fallback for flagship/workplace/corporate language products and core language offers.",
    matchedKeywords: ["language", "corporate"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, Corporate, Languages",
      },
      {
        field: "Target Audience",
        value: "Any Luxembourg company needing language training for employees \u2014 ALL languages",
      },
      {
        field: "JTBD",
        value: "\u201cWhen my company needs to train employees in any language, I want a flexible program with LMS tracking and INFPC subsidy support\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Berlitz (global, expensive), Prolingua (local, general), freelancers (no tracking). Educateme = LMS analytics + INFPC + multilingual + flexible.",
      },
    ],
    operatorDifficulty: "easy",
    operatorDifficultySourceLabel: "Low",
  },
  "L5": {
    id: "core_language_programs",
    label: "Core Language Programs",
    shortLabel: "Core Language",
    confidence: 0.85,
    ruleApplied: "Fallback for flagship/workplace/corporate language products and core language offers.",
    matchedKeywords: ["language", "luxembourgish", "workplace"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2B, B2C, Languages",
      },
      {
        field: "Target Audience",
        value: "Expat employees, cross-border teams, public sector candidates needing Luxembourgish",
      },
      {
        field: "JTBD",
        value: "\u201cWhen I need Luxembourgish for workplace integration or public sector career, I want a structured course leading to real conversational ability\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "INLL = free but overcrowded. Prolingua = competitor. Educateme edge: LMS + recordings + flexible scheduling.",
      },
    ],
    operatorDifficulty: "easy",
    operatorDifficultySourceLabel: "Low",
  },
  "L6": {
    id: "regulated_workforce_pathways_exam_prep",
    label: "Regulated Workforce Pathways & Exam Prep",
    shortLabel: "Regulated Pathways",
    confidence: 0.9,
    ruleApplied: "Card is tied to healthcare communication, migration route, regulated workforce entry, exam prep, or OET/telc pathway.",
    matchedKeywords: ["oet", "nurse", "nurses", "healthcare"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2C, Healthcare, International",
      },
      {
        field: "Target Audience",
        value: "Nurses (Filipino 40\u201360%, Indian 40\u201349%) preparing for OET exam in UAE/GCC",
      },
      {
        field: "JTBD",
        value: "\u201cWhen I need OET Grade B to register with DHA/DOH or migrate to UK/AU, I want affordable, structured prep with personal feedback\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Swoosh $99\u2013359, E2 $59\u2013239, Benchmark $0\u2013219. Pass Guarantee + max 10 students + 15\u201320 writing corrections = differentiation.",
      },
    ],
    operatorDifficulty: "hard",
    operatorDifficultySourceLabel: "High",
  },
  "L7": {
    id: "regulated_workforce_pathways_exam_prep",
    label: "Regulated Workforce Pathways & Exam Prep",
    shortLabel: "Regulated Pathways",
    confidence: 0.9,
    ruleApplied: "Card is tied to healthcare communication, migration route, regulated workforce entry, exam prep, or OET/telc pathway.",
    matchedKeywords: ["oet", "nurse", "nurses", "doctors", "medical", "healthcare"],
    sourceSignals: [
      {
        field: "tags",
        value: "B2C, Healthcare, Doctors",
      },
      {
        field: "Target Audience",
        value: "Doctors (specialists, consultants) in UAE/GCC \u2014 doctor-exclusive cohorts",
      },
      {
        field: "JTBD",
        value: "\u201cWhen I need OET Medicine for career advancement or ECFMG, I want premium 1:1 prep with a medical instructor\u201d",
      },
      {
        field: "Competitive Positioning",
        value: "Premium positioning: doctor-exclusive (never mixed with nurses), MD/MBBS tutors, 6AM\u201310PM flexibility, 24 letters (vs 10\u201315 at competitors).",
      },
    ],
    operatorDifficulty: "hard",
    operatorDifficultySourceLabel: "High",
  },
};

const FALLBACK_ARCHETYPE: ArchetypeAssignment = {
  id: "core_language_programs",
  label: "Core Language Programs",
  shortLabel: "Core Language",
  confidence: 0,
  ruleApplied: "Fallback archetype used because no derived assignment was bundled for this product code.",
  matchedKeywords: [],
  sourceSignals: [],
  operatorDifficulty: "medium",
  operatorDifficultySourceLabel: "Unknown",
};

export function getArchetypeAssignment(code: string): ArchetypeAssignment {
  return RESEARCH_ARCHETYPE_ASSIGNMENTS[code] ?? FALLBACK_ARCHETYPE;
}
