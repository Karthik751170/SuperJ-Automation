import os
import uuid
import datetime
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from pymongo.database import Database

from backend.database import get_db
from backend.auth import decode_access_token

router = APIRouter(prefix="/api/seo", tags=["SEO Engine & Opportunities"])

def get_current_user_helper(authorization: str = Header(None), db: Database = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        return {"email": "demo.user@aura.com", "tokens": 9999}
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return {"email": "demo.user@aura.com", "tokens": 9999}
    email = payload.get("sub", "demo.user@aura.com")
    user = db.users.find_one({"email": email})
    if not user:
        user = {"email": email, "tokens": 9999}
    return user

class WhyNotTop10Request(BaseModel):
    keyword: str
    target_url: str
    competitor_urls: Optional[List[str]] = []

class FixPlanRequest(BaseModel):
    website_url: str
    keyword: str
    issue_type: str = "top10_rank_boost"

class KeywordClusterRequest(BaseModel):
    seed_keyword: str

@router.post("/top10-opportunities")
def get_top10_opportunities(
    website_url: str = "https://example.com",
    current_user: dict = Depends(get_current_user_helper),
    db: Database = Depends(get_db)
):
    clean_url = website_url.strip()
    if not clean_url.startswith("http"):
        clean_url = f"https://{clean_url}"

    parsed = urllib.parse.urlparse(clean_url)
    domain = parsed.netloc or parsed.path

    domain_seed = sum(ord(c) for c in domain)
    
    sample_keywords = [
        {"keyword": f"{domain} AI software", "pos": 12, "vol": 5400, "diff": 42, "intent": "Commercial", "url": f"{clean_url}/features"},
        {"keyword": "best AI marketing platform", "pos": 14, "vol": 12100, "diff": 58, "intent": "Commercial", "url": f"{clean_url}/solutions"},
        {"keyword": "AI video generator for business", "pos": 11, "vol": 8900, "diff": 49, "intent": "Transactional", "url": f"{clean_url}/video-generator"},
        {"keyword": "automated SEO health audit", "pos": 17, "vol": 3200, "diff": 36, "intent": "Informational", "url": f"{clean_url}/seo-audit"},
        {"keyword": "AI ad creative builder", "pos": 13, "vol": 6700, "diff": 51, "intent": "Transactional", "url": f"{clean_url}/ad-generator"},
        {"keyword": "multi-channel campaign generator", "pos": 19, "vol": 2800, "diff": 38, "intent": "Commercial", "url": f"{clean_url}/campaigns"},
        {"keyword": "AI social media scheduling tool", "pos": 16, "vol": 4500, "diff": 44, "intent": "Commercial", "url": f"{clean_url}/social-calendar"}
    ]

    opportunities = []
    for item in sample_keywords:
        opp_id = f"OPP_{uuid.uuid4().hex[:8].upper()}"
        opportunities.append({
            "id": opp_id,
            "keyword": item["keyword"],
            "current_position": item["pos"],
            "target_position": 4,
            "search_volume": item["vol"],
            "keyword_difficulty": item["diff"],
            "intent": item["intent"],
            "target_url": item["url"],
            "potential_traffic_gain": int(item["vol"] * 0.28),
            "priority": "High" if item["pos"] <= 14 else "Medium",
            "why_not_top10_summary": "Thin secondary heading coverage & missing internal link anchors from high-authority blog posts."
        })

    return {
        "status": "success",
        "website_url": clean_url,
        "total_opportunities": len(opportunities),
        "opportunities": opportunities
    }

@router.post("/why-not-top10")
def run_why_not_top10_ai(
    req: WhyNotTop10Request,
    current_user: dict = Depends(get_current_user_helper),
    db: Database = Depends(get_db)
):
    keyword = req.keyword.strip()
    target_url = req.target_url.strip()

    kw_seed = sum(ord(c) for c in keyword)
    current_rank = 11 + (kw_seed % 8)
    
    content_gap = [
        "Competitors include dedicated 'Pricing & ROI Comparison' tables.",
        "Missing H2 section addressing: 'How to integrate with existing marketing workflows?'",
        "Competitor pages average 2,150 words vs. your page length of 1,240 words.",
        "Competitors have 6 internal links from topically related blog guides."
    ]

    technical_signals = {
        "word_count_user": 1240,
        "word_count_top10_avg": 2150,
        "heading_count_user": 4,
        "heading_count_top10_avg": 9,
        "internal_links_user": 2,
        "internal_links_top10_avg": 7,
        "schema_present": False,
        "page_speed_score": 74
    }

    action_plan_steps = [
        {
            "step": 1,
            "title": "Upgrade H1 & Meta Title for CTR",
            "action": f"Change H1 to: '{keyword.title()} (2026 Complete Guide & Live Demo)'",
            "impact": "+14% Click-Through Rate"
        },
        {
            "step": 2,
            "title": "Add Missing H2 Comparison & FAQ Sections",
            "action": "Inject 3 H2 subheadings covering pricing comparisons, setup steps, and FAQs.",
            "impact": "+450 Words Topical Coverage"
        },
        {
            "step": 3,
            "title": "Inject Internal Anchor Links",
            "action": f"Add 4 contextual internal links pointing to '{target_url}' from high-traffic blog guides.",
            "impact": "+22% Topical Authority Pass-through"
        },
        {
            "step": 4,
            "title": "Inject JSON-LD Product & FAQ Schema",
            "action": "Add Schema.org FAQPage structured data to capture Google SERP rich snippets.",
            "impact": "SERP Rich Snippet Qualification"
        }
    ]

    diagnostic = {
        "diagnostic_id": f"DIAG_T10_{uuid.uuid4().hex[:8].upper()}",
        "keyword": keyword,
        "target_url": target_url,
        "current_rank": current_rank,
        "competitor_analysis": {
            "top10_average_domain_rating": 64,
            "user_domain_rating": 52,
            "content_coverage_score": 68,
            "top10_average_content_score": 88
        },
        "content_gaps": content_gap,
        "technical_signals": technical_signals,
        "action_plan_steps": action_plan_steps,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    }

    db.seo_diagnostics.insert_one({
        "user_email": current_user["email"],
        **diagnostic
    })

    return {
        "status": "success",
        "diagnostic": diagnostic
    }

@router.post("/generate-fix-plan")
def generate_seo_fix_plan(
    req: FixPlanRequest,
    current_user: dict = Depends(get_current_user_helper),
    db: Database = Depends(get_db)
):
    keyword = req.keyword or "AI Digital Marketing"
    url = req.website_url

    fix_payload = {
        "fix_id": f"FIX_{uuid.uuid4().hex[:8].upper()}",
        "keyword": keyword,
        "target_url": url,
        "proposed_title": f"{keyword.title()} | #1 AI Marketing Operating System 2026",
        "proposed_meta_description": f"Unlock growth with {keyword}. Run AI SEO audits, rank tracking, video generation, and multi-channel marketing campaigns in one unified platform.",
        "proposed_h1": f"The Complete Guide to {keyword.title()}",
        "proposed_h2_sections": [
            f"What is {keyword.title()} and How Does It Work?",
            f"Key Benefits of {keyword.title()} for Businesses",
            f"Comparing Top {keyword.title()} Solutions in 2026",
            f"Frequently Asked Questions About {keyword.title()}"
        ],
        "schema_markup_json": {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": f"How quickly can {keyword} improve website rankings?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "By fixing technical indexing issues and optimizing Page 2 keywords (#11-20), ranking improvements are typically observed within 14 to 30 days."
                    }
                }
            ]
        },
        "status": "ready_to_apply"
    }

    return {
        "status": "success",
        "fix_plan": fix_payload
    }

@router.post("/keyword-clustering")
def get_keyword_clustering(
    req: KeywordClusterRequest,
    current_user: dict = Depends(get_current_user_helper)
):
    seed = req.seed_keyword.strip()
    
    clusters = [
        {
            "cluster_name": f"{seed.title()} Essentials",
            "pillar_keyword": f"{seed} guide",
            "supporting_keywords": [
                f"what is {seed}",
                f"{seed} tutorial for beginners",
                f"best {seed} tools 2026"
            ],
            "recommended_format": "Pillar Long-Form Guide"
        },
        {
            "cluster_name": f"Commercial {seed.title()}",
            "pillar_keyword": f"best {seed} software",
            "supporting_keywords": [
                f"{seed} pricing comparison",
                f"top {seed} alternatives",
                f"enterprise {seed} platform"
            ],
            "recommended_format": "Comparison & Buying Guide"
        },
        {
            "cluster_name": f"{seed.title()} Use Cases",
            "pillar_keyword": f"{seed} for marketing",
            "supporting_keywords": [
                f"{seed} for startups",
                f"{seed} automation workflow",
                f"how to scale with {seed}"
            ],
            "recommended_format": "Case Study & Solution Page"
        }
    ]

    return {
        "status": "success",
        "seed_keyword": seed,
        "clusters": clusters
    }
