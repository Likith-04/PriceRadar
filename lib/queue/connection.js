import IORedis from "ioredis";

/**
 * Returns connection options object for BullMQ Queue / Worker
 */
export function getRedisConnectionOptions() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    const isTls = redisUrl.startsWith("rediss://");
    return {
      url: redisUrl,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
    };
  }

  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const isTls = process.env.REDIS_TLS === "true";

  return {
    host,
    port,
    password,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
  };
}

let redisClient = null;

/**
 * Singleton IORedis instance for custom rate-limiting or locks if needed
 */
export function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      redisClient = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        ...(redisUrl.startsWith("rediss://") ? { tls: { rejectUnauthorized: false } } : {}),
      });
    } else {
      const options = getRedisConnectionOptions();
      redisClient = new IORedis(options);
    }

    redisClient.on("error", (err) => {
      console.error("[Redis Error]:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("[Redis] Connected successfully.");
    });
  }

  return redisClient;
}
