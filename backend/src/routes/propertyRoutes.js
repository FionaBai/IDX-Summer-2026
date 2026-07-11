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

function validateListingId(rawId) {
  if (typeof rawId !== "string") {
    return {
      valid: false,
      message: "Listing ID must be a string",
    };
  }

  const id = rawId.trim();

  if (id.length === 0) {
    return {
      valid: false,
      message: "Listing ID cannot be empty",
    };
  }

  if (id.length > 255) {
    return {
      valid: false,
      message: "Listing ID cannot exceed 255 characters",
    };
  }

  // Allows common listing-ID characters while rejecting malformed input.
  if (!/^[A-Za-z0-9._-]+$/.test(id)) {
    return {
      valid: false,
      message:
        "Listing ID may contain only letters, numbers, periods, underscores, and hyphens",
    };
  }

  return {
    valid: true,
    value: id,
  };
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


router.get("/:id/openhouses", async (req, res) => {
  const validation = validateListingId(req.params.id);

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.message,
    });
  }

  const listingId = validation.value;

  try {
    // First verify that the property exists.
    const [propertyRows] = await pool.query(
      `
        SELECT L_ListingID
        FROM rets_property
        WHERE L_ListingID = ?
        LIMIT 1
      `,
      [listingId]
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({
        error: `Property with listing ID "${listingId}" was not found`,
      });
    }

    const [openHouseRows] = await pool.query(
      `
        SELECT *
        FROM rets_openhouse
        WHERE L_ListingID = ?
        ORDER BY OpenHouseDate ASC, OH_StartTime ASC
      `,
      [listingId]
    );

    return res.status(200).json(openHouseRows);
  } catch (error) {
    console.error(
      `Failed to retrieve open houses for listing ${listingId}:`,
      error
    );

    return res.status(500).json({
      error: "Unable to retrieve open houses due to a server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  const validation = validateListingId(req.params.id);

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.message,
    });
  }

  const listingId = validation.value;

  try {
    const [rows] = await pool.query(
      `
        SELECT *
        FROM rets_property
        WHERE L_ListingID = ?
        LIMIT 1
      `,
      [listingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: `Property with listing ID "${listingId}" was not found`,
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(`Failed to retrieve property ${listingId}:`, error);

    return res.status(500).json({
      error: "Unable to retrieve the property due to a server error",
    });
  }
});

module.exports = router;