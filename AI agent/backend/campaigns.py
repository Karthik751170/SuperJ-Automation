import os
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from pymongo.database import Database

from backend.database import get_db
from backend.auth import decode_access_token

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns, Ads & Marketing Automation"])

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

class CreateCampaignRequest(BaseModel):
    name: str
    objective: str = "leads"  # awareness, traffic, leads, sales
    channels: Optional[List[str]] = ["google_ads", "meta_ads", "linkedin", "email"]
    budget: float = 1000.0
    target_audience: str = "Small business owners & digital marketers"
    product_name: str = "AI Marketing Operating System"

class AdCreativeRequest(BaseModel):
    product_name: str
    target_audience: str
    platform: str = "google_ads"  # google_ads, meta_ads, linkedin_ads

class SocialCalendarRequest(BaseModel):
    brand_name: str
    industry: str = "technology"

class EmailSequenceRequest(BaseModel):
    product_name: str
    sequence_type: str = "welcome"  # welcome, promo, cart_abandonment

@router.post("/create")
def create_campaign(
    req: CreateCampaignRequest,
    current_user: dict = Depends(get_current_user_helper),
    db: Database = Depends(get_db)
):
    campaign_id = f"CAMP_{uuid.uuid4().hex[:8].upper()}"
    
    channel_allocations = {}
    per_channel = req.budget / max(1, len(req.channels or []))
    for ch in (req.channels or ["google_ads", "meta_ads"]):
        channel_allocations[ch] = round(per_channel, 2)

    campaign_data = {
        "campaign_id": campaign_id,
        "user_email": current_user["email"],
        "name": req.name,
        "objective": req.objective,
        "budget": req.budget,
        "channels": req.channels,
        "channel_allocations": channel_allocations,
        "target_audience": req.target_audience,
        "product_name": req.product_name,
        "status": "active",
        "created_at": datetime.datetime.utcnow().isoformat() + "Z",
        "metrics": {
            "impressions": 14200,
            "clicks": 680,
            "ctr": "4.79%",
            "conversions": 42,
            "cost_per_lead": round(req.budget / 42, 2),
            "roas": "3.8x"
        }
    }

    db.campaigns.insert_one(campaign_data)
    campaign_data["_id"] = str(campaign_data.get("_id", ""))

    return {
        "status": "success",
        "campaign": campaign_data
    }

@router.get("/list")
def list_campaigns(
    current_user: dict = Depends(get_current_user_helper),
    db: Database = Depends(get_db)
):
    campaigns = list(db.campaigns.find({"user_email": current_user["email"]}).sort("created_at", -1))
    for c in campaigns:
        c["_id"] = str(c["_id"])
    
    if not campaigns:
        default_campaign = {
            "campaign_id": "CAMP_DEFAULT_01",
            "name": "Q3 Lead Acceleration Campaign",
            "objective": "leads",
            "budget": 2500.0,
            "channels": ["google_ads", "meta_ads", "linkedin"],
            "status": "active",
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
            "metrics": {
                "impressions": 28400,
                "clicks": 1420,
                "ctr": "5.0%",
                "conversions": 94,
                "cost_per_lead": 26.59,
                "roas": "4.2x"
            }
        }
        campaigns = [default_campaign]

    return {
        "status": "success",
        "campaigns": campaigns
    }

@router.post("/ads/generate-creatives")
def generate_ad_creatives(
    req: AdCreativeRequest,
    current_user: dict = Depends(get_current_user_helper)
):
    p_name = req.product_name.strip()
    platform = req.platform.lower()

    creatives = [
        {
            "id": "ad_1",
            "platform": platform,
            "headline": f"Stop Guessing Marketing — Try {p_name}",
            "primary_text": f"Analyze, optimize, publish, and scale your digital marketing with {p_name}. Get automated SEO fixes, AI video ads, and rank tracking.",
            "cta": "Start Free Trial",
            "ai_image_prompt": f"Professional futuristic digital marketing dashboard analyzing {p_name}, high quality 3d rendering, glowing cyan accents",
            "recommended_budget": "$25/day"
        },
        {
            "id": "ad_2",
            "platform": platform,
            "headline": f"Rank #1 on Google with {p_name}",
            "primary_text": f"Discover keywords trapped on Page 2 and automatically generate Top-10 rank boost fixes for {req.target_audience}.",
            "cta": "Analyze My Website",
            "ai_image_prompt": f"Minimalist sleek workspace showcasing SEO health 98/100 and growth charts for {p_name}, photorealistic 8k",
            "recommended_budget": "$35/day"
        },
        {
            "id": "ad_3",
            "platform": platform,
            "headline": f"1-Click AI Video & Campaign Studio",
            "primary_text": f"Generate 30+ second HD promo videos, social captions, and Google Ads in seconds with {p_name}.",
            "cta": "Generate AI Video",
            "ai_image_prompt": f"Cinematic AI video studio interface generating HD video timeline for {p_name}, 8k ultra detailed",
            "recommended_budget": "$40/day"
        }
    ]

    return {
        "status": "success",
        "platform": platform,
        "product_name": p_name,
        "creatives": creatives
    }

@router.post("/social/calendar")
def generate_social_calendar(
    req: SocialCalendarRequest,
    current_user: dict = Depends(get_current_user_helper)
):
    b_name = req.brand_name.strip()
    
    calendar_days = [
        {
            "day": "Monday",
            "platform": "Instagram Reel / TikTok",
            "post_type": "Video Short",
            "topic": f"3 Essential SEO Hacks Every Startup Needs ({b_name})",
            "caption": f"Are your target keywords stuck on Page 2? 🚀 Here is how {b_name} moves rankings into the Top 10 in 14 days! #SEO #Marketing #DigitalMarketing #AI",
            "recommended_time": "09:00 AM",
            "status": "scheduled"
        },
        {
            "day": "Tuesday",
            "platform": "LinkedIn Article",
            "post_type": "Thought Leadership",
            "topic": f"Why AI Search & GEO (Generative Engine Optimization) is Replacing Traditional Search",
            "caption": f"Search engines are evolving into AI answers. Here is how {b_name} prepares your brand for ChatGPT & Perplexity citations. Read more below 👇 #AI #Strategy #Tech",
            "recommended_time": "11:30 AM",
            "status": "scheduled"
        },
        {
            "day": "Wednesday",
            "platform": "YouTube Short / Reels",
            "post_type": "Product Showcase",
            "topic": "Watch AI Generate a 30-Second HD Promo Video Live",
            "caption": "No video editing skills required! Type your prompt and let AI compile multi-style video streams. Try it today! 🎬✨ #AIVideo #VideoMarketing",
            "recommended_time": "02:00 PM",
            "status": "scheduled"
        },
        {
            "day": "Thursday",
            "platform": "X (Twitter) Thread",
            "post_type": "Educational Thread",
            "topic": f"10 Mistakes Most Marketers Make with Page-2 Keywords (Thread by {b_name})",
            "caption": "1/7 Keywords ranking #11-20 are your biggest quick-win revenue opportunities. Here is the exact audit framework we use... 🧵",
            "recommended_time": "04:15 PM",
            "status": "scheduled"
        },
        {
            "day": "Friday",
            "platform": "Facebook & Instagram Post",
            "post_type": "Customer Case Study",
            "topic": "How Company X Grew Organic Traffic by 240% in 30 Days",
            "caption": f"See how automated SEO fix plans and campaign orchestration transformed Company X's growth trajectory with {b_name}. 🔥",
            "recommended_time": "06:00 PM",
            "status": "scheduled"
        }
    ]

    return {
        "status": "success",
        "brand_name": b_name,
        "calendar": calendar_days
    }

@router.post("/email/generate-sequence")
def generate_email_sequence(
    req: EmailSequenceRequest,
    current_user: dict = Depends(get_current_user_helper)
):
    p_name = req.product_name.strip()
    seq_type = req.sequence_type.lower()

    if seq_type == "welcome":
        sequence = [
            {
                "step": 1,
                "timing": "Immediately after signup",
                "subject": f"Welcome to {p_name} — Your AI Marketing OS is Ready!",
                "body": f"Hi there,\n\nWelcome to {p_name}! You now have access to an AI Marketing Operating System designed to analyze, create, optimize, and publish your marketing activities from one workspace.\n\nTo get started, run your first AI Marketing Doctor scan: Enter your website URL and get instant SEO scores, Page 2 ranking opportunities, and AI fixes.\n\nBest,\nThe {p_name} Team"
            },
            {
                "step": 2,
                "timing": "Day 2",
                "subject": f"Discover your Top 10 Ranking Opportunities with {p_name}",
                "body": f"Did you know keywords ranking between #11–20 represent your biggest traffic growth opportunities?\n\n{p_name} automatically identifies these Page 2 keywords and tells you exactly why you aren't in the Top 10 yet.\n\nClick below to view your Page 2 opportunities."
            },
            {
                "step": 3,
                "timing": "Day 4",
                "subject": "Generate 30-Second AI Promo Videos in 1 Click 🎬",
                "body": f"Need high-converting video ads or reels for social media? {p_name} includes an AI Video Studio that generates HD video streams, keyart posters, and voice captions instantly.\n\nCreate your first video now."
            }
        ]
    else:
        sequence = [
            {
                "step": 1,
                "timing": "Day 1",
                "subject": f"Special Offer: Scale Your Business with {p_name}",
                "body": f"Unlock unlimited AI website audits, rank tracking, and AI video compilation with {p_name}. Upgrade your plan today and receive 500 bonus credits!"
            }
        ]

    return {
        "status": "success",
        "product_name": p_name,
        "sequence_type": seq_type,
        "emails": sequence
    }
