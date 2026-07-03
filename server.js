import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("PH Earthquake Alert Backend is Running");
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
      throw new Error(`PHIVOLCS returned ${response.status}`);
    }

    const html = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
      cause: err.cause?.message ?? null,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});