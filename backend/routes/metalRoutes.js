import express from "express";
import { getMetalPrices } from "../controllers/metalController.js";

const router = express.Router();

router.get("/", getMetalPrices);

export default router;
