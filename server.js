import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("PH Earthquake Alert API is running");
});

app.get("/api/phivolcs", async (req, res) => {
  try {
    const response = await fetch(
      "https://earthquake.phivolcs.dost.gov.ph/EQLatest-Monthly/EQLatest.html",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    const $ = cheerio.load(html);

    const quakes = [];

    $("table tr").each((i, row) => {
      const cells = $(row)
        .find("td")
        .map((_, td) => $(td).text().trim())
        .get();

      if (cells.length >= 6) {
        quakes.push({
          dateTime: cells[0],
          latitude: Number(cells[1]),
          longitude: Number(cells[2]),
          depthKm: Number(cells[3]),
          magnitude: Number(cells[4]),
          location: cells[5],
        });
      }
    });

    res.json(quakes);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});