import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

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

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});