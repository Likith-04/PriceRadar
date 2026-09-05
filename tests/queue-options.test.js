import { describe, it, expect } from "vitest";
import { getRedisConnectionOptions } from "../lib/queue/connection";

describe("Redis & Queue Configuration", () => {
  it("should configure proper BullMQ options with maxRetriesPerRequest: null", () => {
    const opts = getRedisConnectionOptions();
    expect(opts.maxRetriesPerRequest).toBe(null);
    expect(opts.enableReadyCheck).toBe(false);
  });

  it("should handle custom REDIS_URL with TLS", () => {
    const originalUrl = process.env.REDIS_URL;
    process.env.REDIS_URL = "rediss://default:secret@sample.upstash.io:6379";

    const opts = getRedisConnectionOptions();
    expect(opts.url).toBe("rediss://default:secret@sample.upstash.io:6379");
    expect(opts.tls).toBeDefined();

    if (originalUrl) {
      process.env.REDIS_URL = originalUrl;
    } else {
      delete process.env.REDIS_URL;
    }
  });
});
