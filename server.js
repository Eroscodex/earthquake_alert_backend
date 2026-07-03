import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import axios from "axios";
import https from "https";

const app = express();

app.use(cors());

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // ⚠️ Development/testing only
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PH Earthquake Alert API is running",
  });
});

app.get("/api/phivolcs", async (req, res) => {
  try {
    const { data: html } = await axios.get(
      "https://earthquake.phivolcs.dost.gov.ph/EQLatest-Monthly/EQLatest.html",
      {
        httpsAgent,
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html",
        },
      }
    );

    const $ = cheerio.load(html);
    const quakes = [];

    $("table tr").each((_, row) => {
      const cells = $(row)
        .find("td")
        .map((_, td) => $(td).text().replace(/\s+/g, " ").trim())
        .get();

      if (cells.length >= 6) {
        const lat = parseFloat(cells[1]);
        const lng = parseFloat(cells[2]);
        const depth = parseFloat(cells[3]);
        const mag = parseFloat(cells[4]);

        if (
          !Number.isNaN(lat) &&
          !Number.isNaN(lng) &&
          !Number.isNaN(depth) &&
          !Number.isNaN(mag)
        ) {
          quakes.push({
            id: `${cells[0]}-${cells[5]}-${mag}`,
            dateTime: cells[0],
            latitude: lat,
            longitude: lng,
            depthKm: depth,
            magnitude: mag,
            location: cells[5],
          });
        }
      }
    });

    res.json({
      success: true,
      total: quakes.length,
      data: quakes,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
      cause: err.cause?.message || null,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});