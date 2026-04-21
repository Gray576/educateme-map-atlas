#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const RUN_DIR = path.join(ROOT, "research-runs/2026-04-18-all-24");

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

const updates = {
  L1_sproochtest_preparation: {
    semrush_snapshot: {
      keyword_buckets: {
        problem_intent: [
          "sproochentest examples",
          "comment reussir a sproochentest",
          "remboursement sproochentest",
          "inscription sproochentest",
          "sproochentest dates"
        ],
        competitor_route: [
          "INLL sproochentest",
          "Prolingua sproochentest",
          "LuxLanguages sproochentest",
          "LuxLessons sproochentest",
          "moienasbl.lu",
          "cfih.lu",
          "unipop.lu"
        ]
      },
      traffic_analytics_notes:
        "The Luxembourgish market now reads as at least three lanes: official route / nationality, community-integration, and adult-education discovery. New watchlist nodes from the latest screenshot pass: moienasbl.lu, cfih.lu, unipop.lu, infpc.lu, lifelong-learning.lu."
    }
  },
  A9_integration_bundle_sproochtest: {
    semrush_snapshot: {
      keyword_buckets: {
        problem_intent: [
          "sproochentest examples",
          "comment reussir a sproochentest",
          "remboursement sproochentest",
          "inscription sproochentest",
          "cours du soir luxembourg"
        ],
        competitor_route: [
          "INLL sproochentest route",
          "Prolingua sproochentest",
          "LuxLanguages sproochentest",
          "moienasbl.lu",
          "cfih.lu",
          "infpc.lu",
          "lifelong-learning.lu"
        ]
      },
      traffic_analytics_notes:
        "Beyond exam-prep, screenshots point to a discovery/onboarding lane via infpc.lu, lifelong-learning.lu, moienasbl.lu, and unipop.lu. This supports treating A9 as route-plus-integration, not only prep."
    }
  },
  L5_luxembourgish_for_business: {
    semrush_snapshot: {
      keyword_buckets: {
        head_terms: [
          "cours luxembourgeois",
          "apprendre le luxembourgeois",
          "luxembourgish online course",
          "learn luxembourgish online"
        ],
        commercial_modifiers: [
          "cours luxembourgeois luxembourg",
          "cours du soir luxembourg",
          "formation continue luxembourg",
          "luxembourgish course luxembourg"
        ],
        competitor_route: [
          "INLL luxembourgish",
          "Prolingua luxembourgish",
          "Inlingua luxembourgish",
          "Moien ASBL",
          "CFIH",
          "Unipop"
        ]
      },
      traffic_analytics_notes:
        "The latest screenshot pass shows adjacent Luxembourgish demand in FR/LB as well as EN. Treat this as a multilingual integration-learning market, not just a business niche in English."
    },
    demand_pull: {
      notes:
        "Local Luxembourgish demand is visible across EN, FR, and LB screenshots. Most observable queries are still exam, integration, or general learning intent rather than explicit business intent, but the adjacent market is broader than the first pass suggested."
    }
  },
  A6_expat_onboarding_luxembourg_ready: {
    demand_pull: {
      demand_evidence_score_1_5: 2,
      cac_reality_score_1_5: 2,
      channel_fit_score_1_5: 2,
      confidence_band: "low",
      derivation_basis:
        "The latest screenshots add adult-education and integration-discovery platforms in Luxembourg, but they still show adjacency more than direct expat-onboarding demand.",
      notes:
        "New nodes from the latest pass: infpc.lu, lifelong-learning.lu, moienasbl.lu, and unipop.lu. These suggest a real integration/discovery lane around evening courses, continuing education, and Luxembourgish onboarding. The offer still needs direct employer demand proof, but the surrounding market is broader and more structured than the earlier pass showed."
    },
    semrush_snapshot: {
      database: "LU",
      language: "mixed (EN/FR/DE/LB)",
      keyword_buckets: {
        head_terms: [
          "cours du soir luxembourg",
          "formation continue luxembourg",
          "learn luxembourgish online",
          "luxembourgish online course"
        ],
        commercial_modifiers: [
          "continuing education luxembourg",
          "weiterbildung luxemburg",
          "cours du soir luxembourg",
          "luxembourg integration language"
        ],
        problem_intent: [
          "service de la formation des adultes",
          "formation professionnelle luxembourg",
          "cours luxembourgeois en ligne",
          "cours intensifs luxembourgeois"
        ],
        competitor_route: [
          "infpc.lu",
          "lifelong-learning.lu",
          "moienasbl.lu",
          "unipop.lu",
          "INLL",
          "Prolingua"
        ]
      },
      serp_feature_notes:
        "This category is better read through multilingual discovery and integration keywords than through the product title.",
      traffic_analytics_notes:
        "The strongest new signal is not a direct competitor but a structured discovery layer: INFPC, lifelong-learning.lu, Unipop, and community actors such as Moien ASBL."
    },
    collapsed_scores: {
      demand_pull_composite: 2.25,
      overall_confidence_band: "low",
      confidence_reason:
        "The surrounding Luxembourg integration/discovery market is now partially evidenced, but direct employer-paid onboarding pull remains unproven."
    }
  },
  L3_french_for_work_business: {
    semrush_snapshot: {
      keyword_buckets: {
        head_terms: [
          "cours francais luxembourg",
          "cours de francais au luxembourg",
          "french courses luxembourg",
          "cours du soir luxembourg"
        ],
        problem_intent: [
          "cours de francais au luxembourg",
          "cours du soir luxembourg",
          "formation continue luxembourg",
          "french classes luxembourg"
        ],
        competitor_route: [
          "Prolingua",
          "Inlingua Luxembourg",
          "Berlitz Luxembourg",
          "Institut Français Luxembourg",
          "lifelong-learning.lu",
          "infpc.lu"
        ]
      },
      traffic_analytics_notes:
        "The local French lane is now clearly multilingual and institutional. Institut Français Luxembourg and lifelong-learning-style discovery should sit beside classic private-school competitors."
    },
    demand_pull: {
      notes:
        "LU screenshots show French demand not only on private school domains but also through institutional and continuing-education routes such as Institut Français Luxembourg and lifelong-learning-style discovery. This remains category evidence, not yet direct employer-paid proof."
    }
  },
  A7_professional_french_sector_specific: {
    semrush_snapshot: {
      keyword_buckets: {
        head_terms: [
          "cours francais luxembourg",
          "cours de francais au luxembourg",
          "french courses luxembourg",
          "cours du soir luxembourg"
        ],
        problem_intent: [
          "cours de francais au luxembourg",
          "cours du soir luxembourg",
          "french classes luxembourg",
          "formation continue luxembourg"
        ],
        competitor_route: [
          "Prolingua",
          "Inlingua Luxembourg",
          "Allingua corporate training",
          "Institut Français Luxembourg",
          "lifelong-learning.lu"
        ]
      },
      traffic_analytics_notes:
        "The French local market has more institutional gravity than the first pass suggested. Institut Français Luxembourg and continuing-education phrasing should be part of this lane."
    },
    demand_pull: {
      notes:
        "Local French-course demand is visible on incumbent and institutional domains. The sector-specific wedge is still narrower than what the screenshot set directly proves, but the broader French lane is stronger and more local than the first pass suggested."
    }
  },
  A5_mifid_ii_compliance_training: {
    semrush_snapshot: {
      keyword_buckets: {
        problem_intent: [
          "mifid compliance training",
          "cssf circular 17/670 training",
          "formation compliance luxembourg",
          "compliance officer formation"
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
      traffic_analytics_notes:
        "The new pass suggests buyer language may sit partly outside legal anchors: formation compliance luxembourg, compliance officer formation, and related role-language queries are worth tracking alongside MiFID-specific terms."
    }
  },
  A10_csrd_esg_compliance_training: {
    semrush_snapshot: {
      keyword_buckets: {
        problem_intent: [
          "csrd compliance training",
          "esrs training",
          "double materiality training",
          "formation compliance luxembourg"
        ]
      },
      traffic_analytics_notes:
        "The latest pass adds buyer-language compliance phrasing that may be more locally useful than only CSRD-specific legal anchors."
    }
  },
  A4_ai_for_finance_compliance: {
    semrush_snapshot: {
      keyword_buckets: {
        problem_intent: [
          "ai literacy compliance",
          "ai governance training",
          "financial institutions ai training",
          "formation compliance luxembourg"
        ]
      },
      traffic_analytics_notes:
        "Keep AI-specific anchors, but add local compliance buyer language to avoid relying only on law names or AI-title phrases."
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

  if (patch.collapsed_scores) {
    doc.collapsed_scores = {
      ...doc.collapsed_scores,
      ...patch.collapsed_scores
    };
  }

  await writeJson(filePath, doc);
}
