#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const RUN_DIR = path.join(ROOT, "research-runs/2026-04-18-all-24");

function averageAvailable(values) {
  const usable = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (usable.length === 0) return null;
  const avg = usable.reduce((sum, value) => sum + value, 0) / usable.length;
  return Math.round(avg * 100) / 100;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

const updates = {
  L1_sproochtest_preparation: {
    demand_pull: {
      demand_evidence_score_1_5: 4,
      cac_reality_score_1_5: 3,
      channel_fit_score_1_5: 4,
      confidence_band: "medium",
      derivation_basis:
        "Screenshot-backed review adds visible Luxembourg route-keyword demand, incumbent density, and owned Educateme rankings. WTP and paid metrics remain uncollected.",
      notes:
        "Observed in screenshots: inll.lu ~26.9K organic traffic, houseoftraining.lu ~7K, prolingua.lu ~213 LU keywords / ~1.8K traffic, educateme.lu ~417 organic traffic with current rankings on sproochentest, learn luxembourgish online, luxembourgish online course, and sproochentest luxembourg. SEO pull exists and Educateme already has route-content traction."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR/DE/LB)",
      keyword_buckets: {
        head_terms: [
          "sproochentest",
          "sproochentest luxembourg",
          "sproochentest letzebuergesch",
          "luxembourgish online course",
          "learn luxembourgish online"
        ],
        commercial_modifiers: [
          "sproochtest preparation",
          "luxembourgish course",
          "language courses luxembourg",
          "luxembourg language exam",
          "learn luxembourgish"
        ],
        problem_intent: [
          "sproochentest examples",
          "sproochentest luxembourg",
          "learn luxembourgish online",
          "luxembourgish online course",
          "luxembourg national language"
        ],
        competitor_route: [
          "INLL sproochentest",
          "Prolingua sproochentest",
          "LuxLanguages sproochentest",
          "LuxLessons sproochentest",
          "sproochentest.etic.lu"
        ]
      },
      serp_feature_notes:
        "Best screenshot evidence comes from LU organic positions, not keyword overview. Route queries dominate the visible market and Educateme already ranks on several of them.",
      traffic_analytics_notes:
        "Primary local incumbents: INLL, House of Training, Prolingua, Inlingua, LuxLanguages, LuxLessons. Overlap table adds cflh.lu, scholanova.lu, unipop.lu, moienasbl.lu, apprentus.lu, and institut-francais-luxembourg.lu as watchlist competitors."
    },
    portfolio_tags: {
      channel_primary: "SEO / route-content",
      channel_secondary: "referral / community"
    },
    collapsed_scores: {
      overall_confidence_band: "medium",
      confidence_reason:
        "Demand pull is now partially evidenced by Luxembourg competitor and ranking screenshots. WTP, paid density, and macro remain incomplete."
    }
  },
  A9_integration_bundle_sproochtest: {
    demand_pull: {
      demand_evidence_score_1_5: 4,
      cac_reality_score_1_5: 3,
      channel_fit_score_1_5: 4,
      confidence_band: "medium",
      derivation_basis:
        "Screenshot-backed review adds visible Luxembourg route-keyword demand and existing Educateme route-content traction. Bundle-specific buyer proof is still missing.",
      notes:
        "The same LU route market visible for L1 is relevant here: sproochentest and Luxembourgish route terms have observable demand and multiple incumbents, while Educateme already ranks on route-support content. The bundle still needs partner-motion proof, but category pull is no longer blank."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR/DE/LB)",
      keyword_buckets: {
        head_terms: [
          "sproochentest",
          "sproochentest luxembourg",
          "luxembourgish online course",
          "learn luxembourgish online",
          "language courses luxembourg"
        ],
        commercial_modifiers: [
          "sproochtest preparation",
          "luxembourgish course",
          "integration luxembourg language",
          "language courses luxembourg",
          "learn luxembourgish"
        ],
        problem_intent: [
          "sproochentest examples",
          "sproochentest luxembourg",
          "learn luxembourgish online",
          "luxembourgish online course",
          "luxembourg national language"
        ],
        competitor_route: [
          "INLL sproochentest route",
          "Prolingua sproochentest",
          "LuxLanguages sproochentest",
          "LuxLessons sproochentest",
          "sproochentest.etic.lu"
        ]
      },
      serp_feature_notes:
        "Bundle-related demand should be inferred from route queries and integration-language intent, not from the product title.",
      traffic_analytics_notes:
        "Category incumbents and overlap competitors mirror the L1 cluster. The relevant insight is route density plus Educateme's existing foothold, not paid competition."
    },
    portfolio_tags: {
      channel_primary: "SEO / route-content",
      channel_secondary: "partner / referral"
    },
    collapsed_scores: {
      overall_confidence_band: "medium",
      confidence_reason:
        "The route-driven LU market is evidenced, but bundle-specific WTP and partner-motion still require validation."
    }
  },
  L5_luxembourgish_for_business: {
    demand_pull: {
      demand_evidence_score_1_5: 2,
      cac_reality_score_1_5: 2,
      channel_fit_score_1_5: 2,
      confidence_band: "low",
      derivation_basis:
        "Screenshots confirm adjacent Luxembourgish-learning demand, but business-specific pull is still inferred rather than directly observed.",
      notes:
        "Local Luxembourgish demand is visible in LU screenshots, but most observable queries are nationality, exam, or general learning intent. Business-specific pull remains only partially evidenced."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR/DE/LB)",
      keyword_buckets: {
        head_terms: [
          "luxembourgish course",
          "luxembourgish online course",
          "learn luxembourgish",
          "learn luxembourgish online"
        ],
        commercial_modifiers: [
          "luxembourgish course luxembourg",
          "luxembourgish lessons luxembourg",
          "language courses luxembourg",
          "learn luxembourgish online"
        ],
        problem_intent: [
          "learn luxembourgish",
          "luxembourgish online course",
          "language courses luxembourg",
          "luxembourg national language"
        ],
        competitor_route: [
          "INLL luxembourgish",
          "Prolingua luxembourgish",
          "Inlingua luxembourgish",
          "LuxLessons luxembourgish",
          "LuxLanguages luxembourgish"
        ]
      },
      serp_feature_notes:
        "The strongest observable search behavior is adjacent Luxembourgish learning demand, not explicit 'for business' intent.",
      traffic_analytics_notes:
        "Use this cluster for category sizing and SEO adjacency, not for direct proof that firms buy Luxembourgish-for-business as a standalone category."
    },
    collapsed_scores: {
      overall_confidence_band: "low",
      confidence_reason:
        "Only adjacent Luxembourgish-learning demand is evidenced so far; business-specific pull, WTP, and CAC remain underdetermined."
    }
  },
  L3_french_for_work_business: {
    demand_pull: {
      demand_evidence_score_1_5: 2,
      cac_reality_score_1_5: 2,
      channel_fit_score_1_5: 2,
      confidence_band: "low",
      derivation_basis:
        "Screenshots confirm local language-training demand and visible French-course terms, but not strong B2B buyer intent by themselves.",
      notes:
        "LU screenshots show queries such as french courses luxembourg, french lessons luxembourg, and language courses luxembourg on incumbent domains. This is useful category evidence but not direct proof of employer-paid demand."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR)",
      keyword_buckets: {
        head_terms: [
          "french courses luxembourg",
          "french lessons luxembourg",
          "language courses luxembourg",
          "language school luxembourg"
        ],
        commercial_modifiers: [
          "french courses luxembourg",
          "business french luxembourg",
          "professional french luxembourg",
          "language courses luxembourg"
        ],
        problem_intent: [
          "french lessons luxembourg",
          "language school luxembourg",
          "cours de francais luxembourg",
          "workplace language training"
        ],
        competitor_route: [
          "Prolingua",
          "Inlingua Luxembourg",
          "Berlitz Luxembourg",
          "INLL French courses",
          "LuxLanguages"
        ]
      },
      serp_feature_notes:
        "Visible SEO demand is centered on local language-school queries and French course intent. Business-specific modifiers should be tested against this base set.",
      traffic_analytics_notes:
        "Relevant overlap competitors include Prolingua, Inlingua, Berlitz, INLL, LuxLanguages, and local training-school domains from the Prolingua overlap tables."
    },
    collapsed_scores: {
      overall_confidence_band: "low",
      confidence_reason:
        "Category demand is partially evidenced, but B2B buyer intent and economics are still not directly observed."
    }
  },
  A7_professional_french_sector_specific: {
    demand_pull: {
      demand_evidence_score_1_5: 2,
      cac_reality_score_1_5: 2,
      channel_fit_score_1_5: 2,
      confidence_band: "low",
      derivation_basis:
        "Screenshots confirm local French-course demand, but sector-specific professional demand is still an extrapolation from general category search behavior.",
      notes:
        "Local French-course and language-school demand is visible on incumbent domains, but the sector-specific framing is still a narrower hypothesis than the screenshot set can directly prove."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR)",
      keyword_buckets: {
        head_terms: [
          "french courses luxembourg",
          "french lessons luxembourg",
          "language school luxembourg",
          "language courses luxembourg"
        ],
        commercial_modifiers: [
          "professional french luxembourg",
          "business french luxembourg",
          "french courses luxembourg",
          "language courses luxembourg"
        ],
        problem_intent: [
          "french lessons luxembourg",
          "workplace language training",
          "sector language course",
          "cours de francais luxembourg"
        ],
        competitor_route: [
          "Prolingua",
          "Inlingua Luxembourg",
          "Allingua corporate training",
          "INLL French courses"
        ]
      },
      serp_feature_notes:
        "Use local French-course terms as the demand spine. The sector-specific layer still needs separate validation.",
      traffic_analytics_notes:
        "Incumbent visibility is present, but screenshots do not yet show a deep sector-specific keyword ecosystem."
    },
    collapsed_scores: {
      overall_confidence_band: "low",
      confidence_reason:
        "The general category has search evidence, but the sector-specific wedge remains only partially validated."
    }
  },
  L4_custom_corporate_language_programs: {
    demand_pull: {
      demand_evidence_score_1_5: 2,
      cac_reality_score_1_5: 2,
      channel_fit_score_1_5: 2,
      confidence_band: "low",
      derivation_basis:
        "Screenshots confirm local language-school demand and overlap incumbents, but corporate-program demand is not directly visible in the captured query set.",
      notes:
        "The screenshots support a live Luxembourg language-training market, not yet a clean corporate-program keyword layer. Use this as category support, not direct enterprise-demand proof."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR)",
      keyword_buckets: {
        head_terms: [
          "language courses luxembourg",
          "language school luxembourg",
          "french courses luxembourg",
          "luxembourgish course"
        ],
        commercial_modifiers: [
          "corporate language training luxembourg",
          "business language training luxembourg",
          "language courses luxembourg",
          "language school luxembourg"
        ],
        problem_intent: [
          "french lessons luxembourg",
          "language courses luxembourg",
          "workplace language training",
          "companies need language training"
        ],
        competitor_route: [
          "Prolingua tailor-made",
          "Inlingua company courses",
          "Berlitz Luxembourg",
          "LuxLanguages"
        ]
      },
      serp_feature_notes:
        "Observed demand is still better captured by service-category and local-school queries than by explicit corporate-program terms.",
      traffic_analytics_notes:
        "This category has visible local incumbents, but enterprise-specific search behavior remains weakly evidenced."
    },
    collapsed_scores: {
      overall_confidence_band: "low",
      confidence_reason:
        "Category demand is visible, but enterprise buyer-intent and CAC are still inferred rather than directly measured."
    }
  },
  A5_mifid_ii_compliance_training: {
    demand_pull: {
      demand_evidence_score_1_5: 3,
      cac_reality_score_1_5: 2,
      channel_fit_score_1_5: 1,
      confidence_band: "medium",
      derivation_basis:
        "Screenshots confirm a live Luxembourg corporate-training landscape with visible local incumbents and overlap competitors. Product-specific keyword economics are still incomplete.",
      notes:
        "Observed in screenshots: houseoftraining.lu ~7K organic traffic and pwc.lu ~699 LU keywords. Overlap tables add lifelong-learning.lu, infpc.lu, ifsb.lu, cc.lu, cnfpc.lu, attf.lu, and acams.org. This supports real category pull, but our owned distribution is still unproven."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR)",
      keyword_buckets: {
        head_terms: [
          "mifid training",
          "mifid certification",
          "cssf training",
          "investment advisory training luxembourg"
        ],
        commercial_modifiers: [
          "mifid training luxembourg",
          "cssf training",
          "compliance training luxembourg",
          "financial regulation training luxembourg"
        ],
        problem_intent: [
          "mifid compliance training",
          "cssf circular 17/670 training",
          "investment advisor competence training",
          "regulated financial firms training"
        ],
        competitor_route: [
          "House of Training MiFID",
          "PwC Luxembourg Academy",
          "lifelong-learning.lu",
          "infpc.lu",
          "attf.lu",
          "acams.org"
        ]
      },
      serp_feature_notes:
        "The strongest screenshot evidence here is incumbent-domain footprint and competitor overlap, not cleaned keyword exports.",
      traffic_analytics_notes:
        "Use houseoftraining.lu, pwc.lu, lifelong-learning.lu, infpc.lu, ifsb.lu, cc.lu, cnfpc.lu, attf.lu, and acams.org as the active watchlist around Luxembourg finance/compliance training."
    },
    collapsed_scores: {
      overall_confidence_band: "medium",
      confidence_reason:
        "Category pull is now partially evidenced by Luxembourg incumbent activity and overlap competitors, but owned channel fit and WTP remain open."
    }
  },
  A10_csrd_esg_compliance_training: {
    demand_pull: {
      demand_evidence_score_1_5: 2,
      cac_reality_score_1_5: 2,
      channel_fit_score_1_5: 1,
      confidence_band: "low",
      derivation_basis:
        "Screenshots confirm adjacent Luxembourg corporate-training incumbents and overlap actors, but not a dense CSRD-specific local keyword layer.",
      notes:
        "House of Training and PwC Luxembourg are visible local training incumbents. Overlap tables add lifelong-learning.lu, performances.fr, efe.fr, m2iformation.fr, and cegos.fr. This is meaningful adjacency, but not yet direct proof of CSRD-specific search demand."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR)",
      keyword_buckets: {
        head_terms: [
          "csrd training",
          "esg training luxembourg",
          "double materiality training",
          "esrs training"
        ],
        commercial_modifiers: [
          "csrd training luxembourg",
          "esg reporting training",
          "double materiality workshop",
          "sustainability reporting training"
        ],
        problem_intent: [
          "csrd compliance training",
          "esrs training",
          "double materiality training",
          "companies need csrd reporting support"
        ],
        competitor_route: [
          "House of Training CSRD",
          "PwC Luxembourg CSRD",
          "lifelong-learning.lu",
          "cegos.fr",
          "m2iformation.fr",
          "performances.fr"
        ]
      },
      serp_feature_notes:
        "This cluster currently reads as adjacency through incumbent corporate-training domains rather than a fully evidenced standalone search market.",
      traffic_analytics_notes:
        "Use House of Training and PwC Luxembourg as local anchors; use lifelong-learning.lu, performances.fr, efe.fr, m2iformation.fr, and cegos.fr as overlap watchlist domains."
    },
    collapsed_scores: {
      overall_confidence_band: "low",
      confidence_reason:
        "Adjacent training-market evidence exists, but CSRD-specific pull and owned distribution are still weakly evidenced."
    }
  },
  A4_ai_for_finance_compliance: {
    demand_pull: {
      demand_evidence_score_1_5: 2,
      cac_reality_score_1_5: 2,
      channel_fit_score_1_5: 1,
      confidence_band: "low",
      derivation_basis:
        "Screenshots confirm adjacent Luxembourg finance-training incumbents, but not a strong AI-for-finance keyword market in the captured set.",
      notes:
        "The screenshot set supports a real finance/compliance training landscape around House of Training and related overlap domains, but AI-for-finance demand is still extrapolated from adjacent category activity."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR)",
      keyword_buckets: {
        head_terms: [
          "ai literacy training",
          "ai act training",
          "ai governance training",
          "financial sector ai training"
        ],
        commercial_modifiers: [
          "ai act training luxembourg",
          "ai literacy training finance",
          "ai governance workshop",
          "financial sector ai training luxembourg"
        ],
        problem_intent: [
          "ai literacy compliance",
          "ai governance training",
          "financial institutions ai training",
          "ai act workshop"
        ],
        competitor_route: [
          "House of Training AI risk",
          "House of Training prompt engineering for finance",
          "House of Training AI driving licence",
          "lifelong-learning.lu",
          "cegos.fr"
        ]
      },
      serp_feature_notes:
        "Use adjacent finance-training incumbents as the demand anchor. Product-title keywords are still too weak.",
      traffic_analytics_notes:
        "Treat this as an adjacent corporate-training market with emerging AI positioning, not yet a fully evidenced local keyword category."
    },
    collapsed_scores: {
      overall_confidence_band: "low",
      confidence_reason:
        "Finance-training adjacency is evidenced, but AI-specific pull and owned channel fit remain unproven."
    }
  },
  C1_oet_prep_repriced: {
    demand_pull: {
      demand_evidence_score_1_5: 3,
      cac_reality_score_1_5: 1,
      channel_fit_score_1_5: 1,
      confidence_band: "medium",
      derivation_basis:
        "Screenshots confirm a strong global OET exam keyword ecosystem on oet.com, but they do not show owned distribution or Luxembourg-local traction.",
      notes:
        "Observed in screenshots: oet.com ranks heavily on oet, oet sample test, oet result, occupational english test sample, and oet practice test. This proves searchable exam demand exists, but most visible pull is branded and controlled by the official domain."
    },
    semrush_snapshot: {
      database: "US",
      language: "EN",
      keyword_buckets: {
        head_terms: [
          "oet",
          "oet preparation",
          "oet practice test",
          "oet sample test"
        ],
        commercial_modifiers: [
          "oet preparation course",
          "oet prep",
          "oet practice test",
          "oet sample test"
        ],
        problem_intent: [
          "oet result",
          "occupational english test sample",
          "oet exam sample test",
          "oet test practice"
        ],
        competitor_route: [
          "oet.com",
          "oet sample tests",
          "oet results and scoring",
          "official oet preparation"
        ]
      },
      serp_feature_notes:
        "The captured OET market is strong but branded. The official domain owns the clearest traffic-bearing queries.",
      traffic_analytics_notes:
        "Use OET screenshots to validate keyword structure and exam demand, not to infer easy CAC or local Luxembourg pull."
    },
    collapsed_scores: {
      overall_confidence_band: "medium",
      confidence_reason:
        "Global exam demand is clearly evidenced, but owned channel fit, local pull, and WTP are still incomplete."
    }
  },
  L6_oet_nursing_preparation: {
    demand_pull: {
      demand_evidence_score_1_5: 3,
      cac_reality_score_1_5: 1,
      channel_fit_score_1_5: 1,
      confidence_band: "medium",
      derivation_basis:
        "Screenshots confirm strong adjacent OET demand and exam-intent queries, but not a clear nursing-specific owned channel.",
      notes:
        "The visible OET keyword set is exam-heavy and dominated by the official site. Nursing-specific framing remains plausible, but the screenshot evidence mainly validates the broader OET ecosystem."
    },
    semrush_snapshot: {
      database: "US",
      language: "EN",
      keyword_buckets: {
        head_terms: [
          "oet",
          "oet practice test",
          "oet sample test",
          "oet nursing"
        ],
        commercial_modifiers: [
          "oet preparation course",
          "oet prep",
          "oet nursing",
          "oet practice test"
        ],
        problem_intent: [
          "oet sample test",
          "oet result",
          "occupational english test sample",
          "oet test practice"
        ],
        competitor_route: [
          "oet.com",
          "oet sample tests",
          "official oet preparation"
        ]
      },
      serp_feature_notes:
        "Use OET screenshots to mine exam-intent terms first. Nursing-specific long-tail still needs a cleaner dedicated pass.",
      traffic_analytics_notes:
        "The official OET domain currently appears to own the best traffic-bearing query family."
    },
    collapsed_scores: {
      overall_confidence_band: "medium",
      confidence_reason:
        "Broader OET demand is evidenced, but nursing-specific pull, local pull, and owned distribution remain partial."
    }
  },
  L7_oet_medical_preparation_doctors: {
    demand_pull: {
      demand_evidence_score_1_5: 3,
      cac_reality_score_1_5: 1,
      channel_fit_score_1_5: 1,
      confidence_band: "medium",
      derivation_basis:
        "Screenshots confirm strong adjacent OET demand and exam-intent queries, but not a clear doctor-specific owned channel.",
      notes:
        "The screenshot set validates the OET exam ecosystem rather than a doctor-specific keyword niche. That is still useful for framing and keyword expansion, but not enough to claim easy acquisition."
    },
    semrush_snapshot: {
      database: "US",
      language: "EN",
      keyword_buckets: {
        head_terms: [
          "oet",
          "oet practice test",
          "oet sample test",
          "occupational english test sample"
        ],
        commercial_modifiers: [
          "oet preparation course",
          "oet prep",
          "oet medicine",
          "oet sample test"
        ],
        problem_intent: [
          "oet result",
          "oet exam sample test",
          "oet test practice",
          "occupational english test sample"
        ],
        competitor_route: [
          "oet.com",
          "oet sample tests",
          "official oet preparation"
        ]
      },
      serp_feature_notes:
        "The official OET domain dominates the visible query family. Doctor-specific demand still needs a dedicated search pass.",
      traffic_analytics_notes:
        "Treat the current screenshot evidence as broad exam-demand proof, not a direct doctor-segment proof."
    },
    collapsed_scores: {
      overall_confidence_band: "medium",
      confidence_reason:
        "Broader OET demand is evidenced, but doctor-specific pull and owned channel fit remain partial."
    }
  },
  B1_german_for_nurses_b1_b2_pflege_sprint: {
    demand_pull: {
      demand_evidence_score_1_5: 2,
      cac_reality_score_1_5: 2,
      channel_fit_score_1_5: 1,
      confidence_band: "low",
      derivation_basis:
        "Screenshots confirm a large German exam ecosystem, especially around telc and Goethe, but not a clean nursing-specific or Luxembourg-specific demand layer.",
      notes:
        "telc.net and goethe.de show strong exam demand and many German certification long-tails. That validates the broader exam-prep market but not yet the narrower nurse-specific commercial motion."
    },
    semrush_snapshot: {
      database: "DE",
      language: "DE",
      keyword_buckets: {
        head_terms: [
          "telc b1 prufung",
          "telc b2 prufung",
          "b2 telc prufung",
          "goethe deutsch b2"
        ],
        commercial_modifiers: [
          "telc b1 prufung",
          "telc b2 prufung",
          "telc b2 probeprufung",
          "deutsch pflege b2"
        ],
        problem_intent: [
          "b1 prufung",
          "prufung b2 telc",
          "telc zertifikat",
          "deutsch fur pflege"
        ],
        competitor_route: [
          "telc.net",
          "goethe.de",
          "triple win programme"
        ]
      },
      serp_feature_notes:
        "The captured demand is strongest on exam-brand and exam-level terms. Nursing-specific long-tail should be collected in a dedicated Germany pass.",
      traffic_analytics_notes:
        "Use telc/goethe screenshots for keyword family design and route language, not as direct proof that the nurse-specific offer already has clean pull."
    },
    collapsed_scores: {
      overall_confidence_band: "low",
      confidence_reason:
        "The broad German exam market is evidenced, but the nurse-specific wedge still lacks direct demand and channel proof."
    }
  }
};

for (const [slug, patch] of Object.entries(updates)) {
  const filePath = path.join(RUN_DIR, slug, "commercial-validation.json");
  const doc = await readJson(filePath);

  if (patch.demand_pull) {
    doc.demand_pull = {
      ...doc.demand_pull,
      ...patch.demand_pull
    };
  }

  if (patch.semrush_snapshot) {
    doc.semrush_snapshot = {
      ...doc.semrush_snapshot,
      ...patch.semrush_snapshot,
      keyword_buckets: {
        ...doc.semrush_snapshot.keyword_buckets,
        ...patch.semrush_snapshot.keyword_buckets
      }
    };
  }

  if (patch.portfolio_tags) {
    doc.portfolio_tags = {
      ...doc.portfolio_tags,
      ...patch.portfolio_tags
    };
  }

  doc.collapsed_scores = {
    ...doc.collapsed_scores,
    demand_pull_composite: averageAvailable([
      doc.demand_pull?.demand_evidence_score_1_5,
      doc.demand_pull?.wtp_score_1_5,
      doc.demand_pull?.cac_reality_score_1_5,
      doc.demand_pull?.retention_structure_score_1_5,
      doc.demand_pull?.macro_trajectory_score_1_5,
      doc.demand_pull?.channel_fit_score_1_5
    ]),
    ...(patch.collapsed_scores || {})
  };

  await writeJson(filePath, doc);
}
