function requestLogger(req, res, next) {
  const startTime = process.hrtime.bigint();
  const timestamp = new Date().toISOString();

  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    console.log(
      `${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(2)} ms`
    );
  });

  next();
}

module.exports = requestLogger;