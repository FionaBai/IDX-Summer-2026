const express = require("express");
const request = require("supertest");

jest.mock("../../config/db", () => ({
  query: jest.fn(),
}));

const pool = require("../../config/db");
const propertyRoutes = require("../propertyRoutes");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use("/api/properties", propertyRoutes);

  return app;
}

describe("property routes", () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  describe("GET /api/properties", () => {
    test("returns property results successfully", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 2 }],
        ])
        .mockResolvedValueOnce([
          [
            {
              id: 1,
              L_ListingID: "ABC123",
              L_City: "Napa",
            },
            {
              id: 2,
              L_ListingID: "ABC124",
              L_City: "Napa",
            },
          ],
        ]);

      const response = await request(app)
        .get("/api/properties")
        .expect(200);

      expect(response.body.total).toBe(2);
      expect(response.body.limit).toBe(20);
      expect(response.body.offset).toBe(0);
      expect(response.body.results).toHaveLength(2);

      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test("supports pagination", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 100 }],
        ])
        .mockResolvedValueOnce([
          [{ L_ListingID: "PAGE2" }],
        ]);

      const response = await request(app)
        .get("/api/properties?limit=10&offset=10")
        .expect(200);

      expect(response.body.limit).toBe(10);
      expect(response.body.offset).toBe(10);

      const dataCall =
        pool.query.mock.calls[1];

      expect(dataCall[1]).toEqual([
        10,
        10,
      ]);
    });

    test("filters by city", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 1 }],
        ])
        .mockResolvedValueOnce([
          [{ L_City: "Napa" }],
        ]);

      await request(app)
        .get("/api/properties?city=Napa")
        .expect(200);

      const countSql =
        pool.query.mock.calls[0][0];

      const countValues =
        pool.query.mock.calls[0][1];

      expect(countSql).toContain("L_City");
      expect(countValues).toContain("Napa");
    });

    test("filters by zipcode", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 1 }],
        ])
        .mockResolvedValueOnce([
          [{ L_Zip: "94558" }],
        ]);

      await request(app)
        .get("/api/properties?zipcode=94558")
        .expect(200);

      expect(
        pool.query.mock.calls[0][0]
      ).toContain("L_Zip");

      expect(
        pool.query.mock.calls[0][1]
      ).toContain("94558");
    });

    test("filters by minimum price", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 1 }],
        ])
        .mockResolvedValueOnce([
          [{ L_SystemPrice: 500000 }],
        ]);

      await request(app)
        .get("/api/properties?minPrice=300000")
        .expect(200);

      expect(
        pool.query.mock.calls[0][0]
      ).toContain("L_SystemPrice >= ?");

      expect(
        pool.query.mock.calls[0][1]
      ).toContain(300000);
    });

    test("filters by maximum price", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 1 }],
        ])
        .mockResolvedValueOnce([
          [{ L_SystemPrice: 500000 }],
        ]);

      await request(app)
        .get("/api/properties?maxPrice=800000")
        .expect(200);

      expect(
        pool.query.mock.calls[0][0]
      ).toContain("L_SystemPrice <= ?");

      expect(
        pool.query.mock.calls[0][1]
      ).toContain(800000);
    });

    test("filters by beds", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 1 }],
        ])
        .mockResolvedValueOnce([
          [{ L_Keyword2: 3 }],
        ]);

      await request(app)
        .get("/api/properties?beds=3")
        .expect(200);

      expect(
        pool.query.mock.calls[0][0]
      ).toContain("L_Keyword2 >= ?");

      expect(
        pool.query.mock.calls[0][1]
      ).toContain(3);
    });

    test("filters by baths", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 1 }],
        ])
        .mockResolvedValueOnce([
          [{ LM_Dec_3: 2 }],
        ]);

      await request(app)
        .get("/api/properties?baths=2")
        .expect(200);

      expect(
        pool.query.mock.calls[0][0]
      ).toContain("LM_Dec_3 >= ?");

      expect(
        pool.query.mock.calls[0][1]
      ).toContain(2);
    });

    test("supports multiple filters together", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 1 }],
        ])
        .mockResolvedValueOnce([
          [{ L_ListingID: "ABC123" }],
        ]);

      await request(app)
        .get(
          "/api/properties?city=Napa&minPrice=300000&maxPrice=800000&beds=3&baths=2"
        )
        .expect(200);

      const sql =
        pool.query.mock.calls[0][0];

      const values =
        pool.query.mock.calls[0][1];

      expect(sql).toContain("L_City");
      expect(sql).toContain(
        "L_SystemPrice >= ?"
      );
      expect(sql).toContain(
        "L_SystemPrice <= ?"
      );
      expect(sql).toContain(
        "L_Keyword2 >= ?"
      );
      expect(sql).toContain(
        "LM_Dec_3 >= ?"
      );

      expect(values).toEqual([
        "Napa",
        300000,
        800000,
        3,
        2,
      ]);
    });

    test("rejects invalid limit", async () => {
      const response = await request(app)
        .get("/api/properties?limit=0")
        .expect(400);

      expect(response.body.error).toMatch(
        /limit must be/i
      );

      expect(pool.query).not.toHaveBeenCalled();
    });

    test("rejects invalid offset", async () => {
      await request(app)
        .get("/api/properties?offset=-1")
        .expect(400);

      expect(pool.query).not.toHaveBeenCalled();
    });

    test("rejects minPrice greater than maxPrice", async () => {
      const response = await request(app)
        .get(
          "/api/properties?minPrice=900000&maxPrice=500000"
        )
        .expect(400);

      expect(response.body.error).toMatch(
        /minPrice cannot be greater/i
      );
    });

    test("rejects invalid sortBy", async () => {
      await request(app)
        .get(
          "/api/properties?sortBy=invalid"
        )
        .expect(400);
    });

    test("sorts by price", async () => {
      pool.query
        .mockResolvedValueOnce([
          [{ total: 1 }],
        ])
        .mockResolvedValueOnce([
          [{ L_SystemPrice: 300000 }],
        ]);

      await request(app)
        .get(
          "/api/properties?sortBy=price&sortOrder=DESC"
        )
        .expect(200);

      const sql =
        pool.query.mock.calls[1][0];

      expect(sql).toContain(
        "ORDER BY L_SystemPrice DESC"
      );
    });

    test("returns 500 if database query fails", async () => {
      pool.query.mockRejectedValueOnce(
        new Error("database unavailable")
      );

      const response = await request(app)
        .get("/api/properties")
        .expect(500);

      expect(response.body.error).toBe(
        "Internal server error"
      );
    });
  });

  describe("GET /api/properties/:id", () => {
    test("returns property by listing ID", async () => {
      const property = {
        L_ListingID: "ABC123",
        L_City: "Napa",
      };

      pool.query.mockResolvedValueOnce([
        [property],
      ]);

      const response = await request(app)
        .get("/api/properties/ABC123")
        .expect(200);

      expect(response.body).toEqual(
        property
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "WHERE L_ListingID = ?"
        ),
        ["ABC123"]
      );
    });

    test("returns 404 for unknown listing ID", async () => {
      pool.query.mockResolvedValueOnce([
        [],
      ]);

      const response = await request(app)
        .get("/api/properties/UNKNOWN")
        .expect(404);

      expect(response.body.error).toMatch(
        /was not found/i
      );
    });

    test("returns 400 for malformed listing ID", async () => {
      await request(app)
        .get("/api/properties/bad$id")
        .expect(400);

      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe(
    "GET /api/properties/:id/openhouses",
    () => {
      test("returns open houses", async () => {
        pool.query
          .mockResolvedValueOnce([
            [{ L_ListingID: "ABC123" }],
          ])
          .mockResolvedValueOnce([
            [
              {
                L_ListingID: "ABC123",
                OpenHouseDate: "2026-08-30",
              },
            ],
          ]);

        const response =
          await request(app)
            .get(
              "/api/properties/ABC123/openhouses"
            )
            .expect(200);

        expect(response.body).toHaveLength(1);
      });

      test("returns empty array when property has no open houses", async () => {
        pool.query
          .mockResolvedValueOnce([
            [{ L_ListingID: "ABC123" }],
          ])
          .mockResolvedValueOnce([
            [],
          ]);

        const response =
          await request(app)
            .get(
              "/api/properties/ABC123/openhouses"
            )
            .expect(200);

        expect(response.body).toEqual([]);
      });

      test("returns 404 when property does not exist", async () => {
        pool.query.mockResolvedValueOnce([
          [],
        ]);

        await request(app)
          .get(
            "/api/properties/UNKNOWN/openhouses"
          )
          .expect(404);

        expect(pool.query).toHaveBeenCalledTimes(
          1
        );
      });

      test("returns 400 for malformed listing ID", async () => {
        await request(app)
          .get(
            "/api/properties/bad$id/openhouses"
          )
          .expect(400);

        expect(
          pool.query
        ).not.toHaveBeenCalled();
      });
    }
  );
});