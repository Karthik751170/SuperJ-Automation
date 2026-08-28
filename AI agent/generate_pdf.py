import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, KeepTogether
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "AURA MARKETING AI OS — CODEBASE & ARCHITECTURAL REVIEW")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — PREPARED FOR CLAUDE REVIEW")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        
        self.restoreState()

def build_pdf(pdf_filename):
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=64
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0D9488"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0F766E"),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        leftIndent=15,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F8FAFC"),
        borderColor=colors.HexColor("#E2E8F0"),
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=8
    )

    story = []

    # Title Banner
    story.append(Paragraph("AURA MARKETING AI OPERATING SYSTEM", title_style))
    story.append(Paragraph("Complete Codebase Architectural Review & Master Blueprint (Version 1.0)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0D9488"), spaceAfter=12))

    # Metadata Box
    meta_data = [
        [Paragraph("<b>Target Audience:</b> Claude / Technical Reviewer", body_style), Paragraph("<b>Tech Stack:</b> Next.js 19, FastAPI, MongoDB, Razorpay", body_style)],
        [Paragraph("<b>Author:</b> Antigravity Engineering Lead", body_style), Paragraph("<b>Date:</b> August 2026", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary & Core Vision", h1_style))
    story.append(Paragraph(
        "Aura Marketing is an <b>AI-powered Digital Marketing Operating System</b> engineered to resolve tool fragmentation. "
        "It unifies SEO research, website auditing, competitor intelligence, AI copywriting, video synthesis, multi-channel ad campaigns, and social scheduling into an outcome-driven loop:",
        body_style
    ))
    story.append(Paragraph("<b>DISCOVER (SEO) → ANALYZE (Doctor) → DIAGNOSE (Top 10) → RECOMMEND → CREATE (Copy/Video) → PUBLISH → MEASURE</b>", h2_style))
    story.append(Paragraph("<b>Core Positioning:</b> <i>'Your AI marketing team is working on your business.'</i>", body_style))
    story.append(Spacer(1, 10))

    # 2. File System Inventory
    story.append(Paragraph("2. Complete Project File Inventory", h1_style))
    inventory_code = """AI agent/
├── backend/
│   ├── main.py             # Core FastAPI App (Auth, Wallet, Image Edit, Audit, Analytics)
│   ├── marketing_doctor.py  # AI Marketing Doctor Diagnostic Brain & Live HTTP Inspection
│   ├── seo_engine.py        # Top 10 Opportunity Engine, 'Why Not Top 10?', SEO Fix Plans
│   ├── campaigns.py         # Multi-Channel Campaign Builder, Ad Creatives, Social Calendar
│   ├── generator.py         # AI Video Generative Engine & Keyart Synthesizer
│   ├── database.py          # MongoDB Driver & InMemoryDatabase Fallback
│   └── auth.py              # JWT Token Authentication & Password Hashing
└── src/app/
    ├── marketing/page.tsx   # AI Marketing OS Main UI (Glassmorphism + Bento Grid)
    ├── dashboard/page.tsx   # AI Video Studio Dashboard & Render Console
    └── wallet/page.tsx      # Token Store & Razorpay Payment Integration"""
    story.append(Paragraph(inventory_code.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style))
    story.append(Spacer(1, 10))

    # 3. Backend Architecture
    story.append(Paragraph("3. Detailed Backend Architecture & Endpoints", h1_style))
    
    story.append(Paragraph("3.1 Core Engine (backend/main.py)", h2_style))
    story.append(Paragraph("Entry point for FastAPI, handling CORS, JWT auth, Razorpay wallet transactions, AI image editing, web auditing, and competitor scraping.", body_style))
    story.append(Paragraph("• <b>Auth & Wallet:</b> <code>POST /api/auth/register</code>, <code>POST /api/wallet/verify-payment</code>", bullet_style))
    story.append(Paragraph("• <b>AI Image Suite:</b> <code>POST /api/image/ai/edit</code> (Remove BG, Cleanup, Outpaint via Clipdrop/Stability AI)", bullet_style))
    story.append(Paragraph("• <b>Auditing:</b> <code>POST /api/webaudit/lighthouse</code> & <code>POST /api/competitor/analyze</code>", bullet_style))

    story.append(Paragraph("3.2 AI Marketing Doctor Brain (backend/marketing_doctor.py)", h2_style))
    story.append(Paragraph("Runs live HTTP requests to target URLs measuring response latency (ms), SSL status, HTTP status codes, title tags, H1 headers, and meta descriptions. Computes 6-category scores (SEO, Content, Social, Ads, Conversions, AI Search).", body_style))

    story.append(Paragraph("3.3 Top 10 Opportunity Engine (backend/seo_engine.py)", h2_style))
    story.append(Paragraph("Identifies keywords trapped in positions #11–20 (Page 2). Executes <code>POST /api/seo/why-not-top10</code> comparing target URLs against Top 10 SERP competitors on word count, H2/H3 density, and internal links.", body_style))

    story.append(Paragraph("3.4 Multi-Channel Campaigns (backend/campaigns.py)", h2_style))
    story.append(Paragraph("Orchestrates campaigns under unique <code>CAMP_XXXX</code> IDs. Generates Google/Meta/LinkedIn ads, 5-day social media calendars, and 3-step email sequences.", body_style))

    story.append(Spacer(1, 10))

    # 4. Frontend Design System
    story.append(Paragraph("4. Frontend UI/UX Architecture (src/app/marketing/page.tsx)", h1_style))
    story.append(Paragraph("Built with a <b>Glassmorphism + Bento Grid</b> design system:", body_style))
    story.append(Paragraph("• <b>Visual Theme:</b> #030712 deep space dark background, translucent <code>backdrop-blur-xl</code> glass cards.", bullet_style))
    story.append(Paragraph("• <b>Single Accent Color:</b> #10b981 (Emerald) reserved for primary CTAs and key KPI metrics.", bullet_style))
    story.append(Paragraph("• <b>⌘K Command Bar:</b> Global AI search modal supporting natural language queries.", bullet_style))
    story.append(Paragraph("• <b>Bento Grid Rows:</b> Doctor Hero Scan (span 8) + Health Gauge (span 4), 6 Compact Outcome KPIs, AI Video Preview (span 7) + AI Chat Assistant (span 5), Organic Traffic Trend Chart (span 8) + Priority AI Actions (span 4).", bullet_style))

    story.append(Spacer(1, 10))

    # 5. Industry Negatives Solved Table
    story.append(Paragraph("5. Digital Marketing Industry Negatives Solved", h1_style))
    
    table_data = [
        [Paragraph("<b>Industry Negative</b>", h2_style), Paragraph("<b>Aura Marketing Solution</b>", h2_style)],
        [Paragraph("<b>Rising CAC & Lower ROAS</b>", body_style), Paragraph("Top 10 Opportunity Engine captures quick-win Page 2 organic traffic without ad spend.", body_style)],
        [Paragraph("<b>Algorithm Volatility</b>", body_style), Paragraph("Live HTTP inspection monitors server latency, indexing headers & Core Web Vitals continuously.", body_style)],
        [Paragraph("<b>Attribution Blindness</b>", body_style), Paragraph("Unified <code>CAMP_XXXX</code> tracking container combines first-party server telemetry and lead matching.", body_style)],
        [Paragraph("<b>Page 2 Traps (#11–20)</b>", body_style), Paragraph("AI SERP Diagnostic benchmarks page word count, headings & links against Top 10 competitors.", body_style)],
        [Paragraph("<b>Tool Fragmentation</b>", body_style), Paragraph("Unifies SEO, auditing, copywriting, video generation, social scheduling, and analytics into 1 platform.", body_style)]
    ]
    
    neg_table = Table(table_data, colWidths=[180, 324])
    neg_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(neg_table)
    story.append(Spacer(1, 12))

    # 6. Prompts for Claude Review
    story.append(Paragraph("6. Prompts for Technical Review by Claude", h1_style))
    story.append(Paragraph("1. <b>Architecture & Modular Design:</b> Evaluate separation of concerns between <code>marketing_doctor.py</code>, <code>seo_engine.py</code>, <code>campaigns.py</code>, and <code>main.py</code>.", bullet_style))
    story.append(Paragraph("2. <b>Live HTTP Scan Reliability:</b> Is <code>httpx</code> with 6s timeout and fallback regex parsing optimal for real-time site scans?", bullet_style))
    story.append(Paragraph("3. <b>First-Party Attribution Model:</b> How can we expand the <code>CAMP_XXXX</code> model to support multi-touch attribution (First Touch, Last Touch, W-Shaped)?", bullet_style))
    story.append(Paragraph("4. <b>Frontend Performance:</b> What React 19 / Next.js optimizations would you recommend for state management in <code>marketing/page.tsx</code>?", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF_BUILT: {pdf_filename}")

if __name__ == '__main__':
    target_pdf = "/Users/karthiku/Desktop/Devops learning/Appium agent/AI agent/public/Aura_Marketing_Full_Codebase_Architecture_Review.pdf"
    artifact_pdf = "/Users/karthiku/.gemini/antigravity/brain/d38bdb16-ce40-46d1-8443-730b9bb87824/Aura_Marketing_Full_Codebase_Architecture_Review.pdf"
    build_pdf(target_pdf)
    build_pdf(artifact_pdf)
