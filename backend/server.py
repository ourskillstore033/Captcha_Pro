from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, random, string, secrets, time
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime, timezone

# ================= INIT =================
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'captcha_db')]

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

app = FastAPI(title="Captcha Verifier Pro")
api_router = APIRouter(prefix="/api")

CAPTCHAS = {}
ADMIN_TOKENS = set()
CAPTCHA_TTL = 300

# ================= DATA =================
CORRECT_IMAGES = [
    "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
    "https://images.unsplash.com/photo-1618762044398-ec1e7e048bbd",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
    "https://images.unsplash.com/photo-14122621859313b34d52b",
]

INCORRECT_IMAGES = [
    "https://images.pexels.com/photos/244280/pexels-photo-244280.jpeg",
    "https://images.unsplash.com/photo-1611267254323-4db7b39c732c",
    "https://images.unsplash.com/photo-1615497001839-b0a0eac3274c",
    "https://images.pexels.com/photos/4750000/pexels-photo-4750000.jpeg",
]

PUZZLE_BASE_IMAGE = "https://images.unsplash.com/photo-1501854140801"

# ================= MODELS =================
class GenerateRequest(BaseModel):
    type: str

class VerifyRequest(BaseModel):
    captcha_id: str
    answer: Any

class AdminLoginRequest(BaseModel):
    password: str

# ================= HELPERS =================
def purge():
    now = time.time()
    for k in list(CAPTCHAS.keys()):
        if CAPTCHAS[k]['expires_at'] < now:
            del CAPTCHAS[k]

async def record(success):
    update = {"$inc": {"total": 1}}
    if success:
        update["$inc"]["success"] = 1
    await db.stats.update_one({"_id": "global"}, update, upsert=True)

def require_admin(auth):
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(401)
    token = auth.split()[1]
    if token not in ADMIN_TOKENS:
        raise HTTPException(401)

# ================= CAPTCHA GENERATORS =================
def gen_text():
    text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return {"challenge": {"text": text}, "answer": text}

def gen_math():
    a, b = random.randint(1,10), random.randint(1,10)
    return {"challenge": {"q": f"{a}+{b}"}, "answer": str(a+b)}

# ✅ FIXED IMAGE CAPTCHA
def gen_image():
    n_correct = random.choice([4, 5])

    correct = random.sample(CORRECT_IMAGES, k=min(n_correct, len(CORRECT_IMAGES)))

    n_incorrect = 9 - len(correct)

    if n_incorrect <= len(INCORRECT_IMAGES):
        incorrect = random.sample(INCORRECT_IMAGES, k=n_incorrect)
    else:
        incorrect = random.choices(INCORRECT_IMAGES, k=n_incorrect)

    items = (
        [{"url": u, "correct": True} for u in correct] +
        [{"url": u, "correct": False} for u in incorrect]
    )

    random.shuffle(items)

    return {
        "challenge": {
            "prompt": "Select all bicycle images",
            "images": [i["url"] for i in items]
        },
        "answer": [i for i,x in enumerate(items) if x["correct"]]
    }

def gen_slider():
    return {"challenge": {"text": "Slide to end"}, "answer": "done"}

def gen_puzzle():
    target = random.randint(100, 250)
    return {
        "challenge": {"target": target, "image": PUZZLE_BASE_IMAGE},
        "answer": target
    }

GENERATORS = {
    "text": gen_text,
    "math": gen_math,
    "image": gen_image,
    "slider": gen_slider,
    "puzzle": gen_puzzle
}

# ================= ROUTES =================
@api_router.post("/captcha/generate")
async def generate(req: GenerateRequest):
    if req.type not in GENERATORS:
        raise HTTPException(400)

    purge()
    cid = str(uuid.uuid4())

    data = GENERATORS[req.type]()

    CAPTCHAS[cid] = {
        "type": req.type,
        "answer": data["answer"],
        "expires_at": time.time() + CAPTCHA_TTL
    }

    return {"captcha_id": cid, **data}

@api_router.post("/verify")
async def verify(req: VerifyRequest):
    purge()

    rec = CAPTCHAS.get(req.captcha_id)
    if not rec:
        raise HTTPException(404)

    success = False

    if rec["type"] == "text":
        success = req.answer.upper() == rec["answer"]

    elif rec["type"] == "math":
        success = str(req.answer) == rec["answer"]

    elif rec["type"] == "image":
        success = sorted(req.answer) == sorted(rec["answer"])

    elif rec["type"] == "slider":
        success = req.answer == "done"

    elif rec["type"] == "puzzle":
        success = abs(float(req.answer) - rec["answer"]) < 8

    CAPTCHAS.pop(req.captcha_id, None)
    await record(success)

    return {"success": success}

# ================= ADMIN =================
@api_router.post("/admin/login")
async def login(req: AdminLoginRequest):
    if req.password != ADMIN_PASSWORD:
        raise HTTPException(401)

    token = secrets.token_urlsafe(16)
    ADMIN_TOKENS.add(token)

    return {"token": token}

@api_router.get("/admin/stats")
async def stats(auth: Optional[str] = Header(None)):
    require_admin(auth)
    data = await db.stats.find_one({"_id": "global"}) or {}
    return data

# ================= APP =================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()