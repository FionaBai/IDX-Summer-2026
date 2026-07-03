const express = require("express");
const pool = require("../config/db");

const router = express.Router();

const COLUMN_MAP = {
  city: "L_City",
  zipcode: "L_Zip",
  price: "L_SystemPrice",
  beds: "L_Keyword2",
  baths: "LM_Dec_3",
};

function parsePositiveInt(value, fieldName, max = null) {
  if (value === undefined) return undefined;

  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }

  if (max !== null && num > max) {
    throw new Error(`${fieldName} must be less than or equal to ${max}`);
  }

  return num;
}

function parseNonNegativeInt(value, fieldName) {
  if (value === undefined) return undefined;

  const num = Number(value);

  if (!Number.isInteger(num) || num < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }

  return num;
}

router.get("/", async (req, res) => {
  try {
    const {
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds,
      baths,
    } = req.query;

    const limit = parsePositiveInt(req.query.limit ?? "20", "limit", 100);
    const offset = parseNonNegativeInt(req.query.offset ?? "0", "offset");

    const parsedMinPrice = parseNonNegativeInt(minPrice, "minPrice");
    const parsedMaxPrice = parseNonNegativeInt(maxPrice, "maxPrice");
    const parsedBeds = parsePositiveInt(beds, "beds");
    const parsedBaths = parsePositiveInt(baths, "baths");

    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice > parsedMaxPrice
    ) {
      return res.status(400).json({
        error: "minPrice cannot be greater than maxPrice",
      });
    }

    const conditions = [];
    const values = [];

    if (city !== undefined) {
      conditions.push(`LOWER(TRIM(${COLUMN_MAP.city})) = LOWER(TRIM(?))`);
      values.push(city);
    }

    if (zipcode !== undefined) {
      conditions.push(`${COLUMN_MAP.zipcode} = ?`);
      values.push(zipcode);
    }

    if (parsedMinPrice !== undefined) {
      conditions.push(`${COLUMN_MAP.price} >= ?`);
      values.push(parsedMinPrice);
    }

    if (parsedMaxPrice !== undefined) {
      conditions.push(`${COLUMN_MAP.price} <= ?`);
      values.push(parsedMaxPrice);
    }

    if (parsedBeds !== undefined) {
      conditions.push(`${COLUMN_MAP.beds} >= ?`);
      values.push(parsedBeds);
    }

    if (parsedBaths !== undefined) {
      conditions.push(`${COLUMN_MAP.baths} >= ?`);
      values.push(parsedBaths);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `
      SELECT COUNT(*) AS total
      FROM rets_property
      ${whereClause}
    `;

    const dataSql = `
      SELECT *
      FROM rets_property
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    const [countRows] = await pool.query(countSql, values);
    const [propertyRows] = await pool.query(dataSql, [
      ...values,
      limit,
      offset,
    ]);

    res.json({
      total: countRows[0].total,
      limit,
      offset,
      results: propertyRows,
    });
  } catch (error) {
    if (
      error.message.includes("must be") ||
      error.message.includes("cannot be")
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Property search failed:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;