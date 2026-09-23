import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy Gemini SDK client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasLineSecret: Boolean(process.env.LINE_CHANNEL_SECRET),
  });
});

// AI Receipt Scan Endpoint
app.post("/api/scan-receipt", async (req, res) => {
  try {
    const { image, mimeType = "image/jpeg" } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image data" });
    }

    // Strip data URL header if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const ai = getGeminiClient();

    const prompt = `คุณคือผู้เชี่ยวชาญด้านการอ่านบิลใบเสร็จภาษาไทยและสากล
วิเคราะห์ภาพใบเสร็จหรือสลิปการโอนเงินนี้อย่างแม่นยำ แล้วดึงข้อมูลสำคัญ:
1. ชื่อร้านค้าหรือผู้รับเงิน (merchant)
2. วันที่ของใบเสร็จในรูปแบบ YYYY-MM-DD (date) หากไม่พบให้ใช้วันนี้
3. เวลาในรูปแบบ HH:mm (time) เช่น 14:30
4. ยอดเงินรวมสุทธิ (totalAmount) เป็นตัวเลขทศนิยม
5. หมวดหมู่ค่าใช้จ่าย (category) เลือกจาก: "อาหารและเครื่องดื่ม", "ช้อปปิ้ง", "ของใช้ในบ้าน", "การเดินทาง", "บันเทิง", "ค่าบริการ/บิล", "สุขภาพ", "อื่นๆ"
6. ช่องทางชำระเงิน (paymentMethod):
   - "credit_card" หากมีคำว่า บัตรเครดิต, Credit Card, VISA, Master, JCB หรือเลขบัตร ****
   - "cash" หากมีคำว่า เงินสด, Cash, เงินทอน
   - "transfer" หากเป็นการโอนเงิน, โอนบัญชีธนาคาร, สลิปโอนเงิน, สลิปพร้อมเพย์, สแกน QR PromptPay, QR Code แม่มณี, Mobile Banking (K PLUS, SCB EASY, Krungthai NEXT, ฯลฯ)
7. รายการสินค้าที่อ่านได้ (items)
8. บันทึกสรุปสั้นๆ (notes)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: {
              type: Type.STRING,
              description: "Name of the merchant or store",
            },
            date: {
              type: Type.STRING,
              description: "Date in YYYY-MM-DD format",
            },
            time: {
              type: Type.STRING,
              description: "Time in HH:mm format",
            },
            totalAmount: {
              type: Type.NUMBER,
              description: "Total expense amount as a positive number",
            },
            category: {
              type: Type.STRING,
              description: "Expense category in Thai",
            },
            paymentMethod: {
              type: Type.STRING,
              description: "Payment method: 'cash', 'credit_card', or 'transfer' (โอนเงิน/พร้อมเพย์)",
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                },
                required: ["name"],
              },
            },
            notes: {
              type: Type.STRING,
              description: "Brief summary note",
            },
          },
          required: ["merchant", "totalAmount", "category", "paymentMethod"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Receipt scanning failed:", error);
    return res.status(500).json({
      error: error?.message || "Failed to scan receipt with AI",
    });
  }
});

// LINE Webhook Endpoint (Receives real webhooks from LINE Platform)
app.post("/api/line/webhook", async (req, res) => {
  try {
    const events = req.body?.events || [];
    const channelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    for (const event of events) {
      const replyToken = event.replyToken;

      // Handle text messages
      if (event.type === "message" && event.message.type === "text" && replyToken && channelToken) {
        const text = (event.message.text || "").trim();
        let replyText = "สวัสดีครับ! ส่งภาพใบเสร็จหรือสลิปมาเพื่อบันทึกรายรับรายจ่ายอัตโนมัติได้เลยครับ 📸";

        if (text.includes("สรุป") || text.includes("ยอด") || text.includes("รายงาน")) {
          replyText = "📊 คุณสามารถดูแดชบอร์ดสรุปรายรับรายจ่าย กราฟวงกลม และรายงาน Google Sheets ได้ที่หน้าเว็บระบบหลักครับ";
        } else if (text.includes("งบ") || text.includes("budget")) {
          replyText = "💰 ตรวจสอบการใช้งบประมาณรายเดือนได้ทันทีบนระบบ หากใช้จ่ายเกินงบระบบจะแจ้งเตือนให้ทราบทันทีครับ";
        }

        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${channelToken}`,
          },
          body: JSON.stringify({
            replyToken,
            messages: [{ type: "text", text: replyText }],
          }),
        }).catch((e) => console.error("LINE reply error:", e));
      }
    }

    return res.status(200).json({ status: "ok", received: events.length });
  } catch (err: any) {
    console.error("LINE webhook error:", err);
    return res.status(200).json({ status: "error", message: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
