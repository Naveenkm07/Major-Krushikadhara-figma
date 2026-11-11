import { Router } from "express"
import { getWeatherForecast } from "../controllers/weather.controller.js"

const router = Router()

// GET /api/weather/forecast?lat=12.52&lng=76.89&days=3
router.get("/forecast", getWeatherForecast)

export default router

