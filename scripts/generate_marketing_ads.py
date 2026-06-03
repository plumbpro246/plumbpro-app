"""Generate marketing ad images for PlumbPro using Gemini Nano Banana.
Outputs 4 images for Facebook, TikTok, Pinterest, and NextDoor."""
import asyncio
import os
import base64
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")

api_key = os.getenv("EMERGENT_LLM_KEY")
assert api_key, "EMERGENT_LLM_KEY missing"

OUTPUT_DIR = "/app/generated_ads"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Brand reference for consistency across all ads
BRAND = (
    "PlumbPro Field Companion app. Brand colors: deep navy blue (#003366) and bright safety orange (#FF5F00). "
    "Bold, uppercase, industrial sans-serif typography. Professional plumber aesthetic. "
    "Subject is a confident, professional male plumber in his 30s-40s wearing a navy work shirt, jeans, "
    "tool belt, and safety glasses on his cap. Clean realistic photography style, NOT cartoon. "
    "Modern smartphone visible showing a plumbing app dashboard with orange/navy UI."
)

ADS = [
    {
        "name": "facebook_hero_1200x630",
        "prompt": (
            "Create a horizontal 1200x630 Facebook ad banner for PlumbPro. "
            "Composition: Left side shows a professional plumber holding up a smartphone "
            "displaying the PlumbPro app dashboard with bright orange and navy UI elements visible "
            "(safety talk card, calculator, code book). "
            "Right side shows large bold uppercase text: 'THE FIELD COMPANION PLUMBERS ACTUALLY USE' "
            "in white on a deep navy gradient background. "
            "Below that in smaller bright orange text: '30 DAYS FREE - plumbpro-app.vercel.app'. "
            "Subtle plumbing tools (pipe wrench, fittings) silhouettes in background. "
            "Industrial, professional, NOT cartoon. High contrast. Photorealistic. "
            f"Brand reference: {BRAND}"
        ),
    },
    {
        "name": "tiktok_vertical_1080x1920",
        "prompt": (
            "Create a vertical 1080x1920 TikTok ad image for PlumbPro. "
            "Mobile-first vertical composition. Top third: A young plumber (30s) looking surprised and "
            "pointing at his smartphone with a bright facial expression like he just discovered something. "
            "Middle: The smartphone fills the center, screen clearly showing PlumbPro app's plumbing code "
            "lookup with orange and navy UI. Bottom third: Massive bold uppercase text 'BRO WHY DID NOBODY "
            "TELL ME ABOUT THIS APP?!' in white with bright orange highlights. Below that: 'PLUMBPRO - FREE 30 DAYS' "
            "in vibrant orange. Energetic, Gen Z social media aesthetic. Bright colors. Eye-catching. Vertical 9:16 format. "
            f"Brand reference: {BRAND}"
        ),
    },
    {
        "name": "pinterest_cheatsheet_1000x1500",
        "prompt": (
            "Create a vertical 1000x1500 Pinterest infographic 'cheat sheet' image. "
            "Saveable infographic style with white background. "
            "Title at top in bold uppercase navy text: 'PLUMBER'S DAILY CHEAT SHEET'. "
            "Below: a clean table-style layout with 3 columns: Nominal Pipe Size, OD, ID. "
            "Show rows for: 1/2 inch, 3/4 inch, 1 inch, 1-1/2 inch, 2 inch, 3 inch, 4 inch with realistic measurements. "
            "Use bright orange (#FF5F00) for column headers and navy text for data. "
            "Bottom: a screenshot mockup of the PlumbPro app on a phone with text 'GET THE FULL REFERENCE BOOK FREE' "
            "and the website 'plumbpro-app.vercel.app'. "
            "Add small pipe/wrench icons. Professional trade publication look. Save-worthy. "
            f"Brand reference: {BRAND}"
        ),
    },
    {
        "name": "nextdoor_banner_1200x630",
        "prompt": (
            "Create a horizontal 1200x630 NextDoor neighborhood-app banner for PlumbPro. "
            "Warm, trustworthy, local-community vibe (not aggressive sales). "
            "Left: A friendly, smiling plumber in a clean navy work shirt with a 'PlumbPro Certified' patch "
            "shaking hands with a homeowner outside a nice suburban house. Daylight, residential setting. "
            "Right: Bold uppercase text: 'HIRE A PLUMBPRO CERTIFIED PLUMBER' in navy. "
            "Subtext below in smaller orange text: 'Itemized estimates. Current code knowledge. Trusted by neighbors.' "
            "Bottom right corner: 'plumbpro-app.vercel.app'. "
            "Photorealistic. Warm lighting. Community-focused. NOT cartoon. "
            f"Brand reference: {BRAND}"
        ),
    },
]


async def generate(ad):
    print(f"Generating {ad['name']}...")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"plumbpro-ad-{ad['name']}",
        system_message="You are an expert marketing graphic designer creating professional ad imagery."
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
    msg = UserMessage(text=ad["prompt"])
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"  ⚠️  No image returned for {ad['name']}. Text: {text[:200]}")
        return None
    out_path = os.path.join(OUTPUT_DIR, f"{ad['name']}.png")
    image_bytes = base64.b64decode(images[0]["data"])
    with open(out_path, "wb") as f:
        f.write(image_bytes)
    print(f"  ✅ Saved: {out_path} ({len(image_bytes)} bytes)")
    return out_path


async def main():
    tasks = [generate(a) for a in ADS]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    print("\n=== Summary ===")
    for ad, r in zip(ADS, results):
        if isinstance(r, Exception):
            print(f"  ❌ {ad['name']}: {r}")
        elif r:
            print(f"  ✅ {ad['name']}: {r}")
        else:
            print(f"  ⚠️  {ad['name']}: no output")


if __name__ == "__main__":
    asyncio.run(main())
