import express, { type Request, type Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import mandiRoutes from "./routes/mandi.routes.js"
import cropStageRoutes from "./routes/cropStage.routes.js"
import weatherRoutes from "./routes/weather.routes.js"
import aiAdvisorRoutes from "./routes/aiAdvisor.routes.js"
import scanRoutes from "./routes/scan.routes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health Check Endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    service: "KrushikaDhara Core API",
    database: "Neon PostgreSQL",
    timestamp: new Date().toISOString(),
  })
})

// Feature Routes
app.use("/api/mandi", mandiRoutes)
app.use("/api/crop-stage", cropStageRoutes)
app.use("/api/weather", weatherRoutes)
app.use("/api/ai", aiAdvisorRoutes)
app.use("/api/scan", scanRoutes)

// Start Server
async function startServer() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 [KrushikaDhara Server] Running on http://localhost:${PORT}`)
  })
}

startServer()

export default app

