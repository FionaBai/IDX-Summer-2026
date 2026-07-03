require("dotenv").config();

const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/properties", propertyRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});