import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TransactionalOutboxProcessor, type OutboxRecord } from "./outboxProcessor";

function makeEvent(overrides: Partial<OutboxRecord> = {}): OutboxRecord {
  return {
    id: overrides.id ?? "evt-1",
    eventType: overrides.eventType ?? "student.payment_success",
    aggregateId: overrides.aggregateId ?? "pay-1",
    idempotencyKey: overrides.idempotencyKey ?? "student.payment_success:pay-1:1",
    eventPayload: overrides.eventPayload ?? { ok: true },
    occurredAt: overrides.occurredAt ?? "2026-11-27T10:00:00.000Z",
    processedAt: null,
    retryCount: 0,
    deliveryStatus: "pending",
    ...overrides,
  };
}

describe("Transactional Outbox Processor (Reliability, Retries, Idempotency & DLQ Replay)", () => {
  it("delivers pending events in chronological order and deduplicates identical idempotency keys", async () => {
    const processor = new TransactionalOutboxProcessor({ maxRetries: 3, baseBackoffMs: 1000 });
    const deliveredOrder: string[] = [];

    const events: OutboxRecord[] = [
      makeEvent({ id: "e2", idempotencyKey: "k2", occurredAt: "2026-11-27T10:02:00.000Z" }),
      makeEvent({ id: "e1", idempotencyKey: "k1", occurredAt: "2026-11-27T10:01:00.000Z" }),
      makeEvent({ id: "e1-dup", idempotencyKey: "k1", occurredAt: "2026-11-27T10:03:00.000Z" }),
    ];

    const summary = await processor.processBatch(events, (evt) => {
      deliveredOrder.push(evt.id);
    });

    assert.deepEqual(deliveredOrder, ["e1", "e2"]);
    assert.equal(summary.delivered, 2);
    assert.equal(summary.skippedDuplicate, 1);
    assert.equal(events.every((e) => e.deliveryStatus === "delivered"), true);
  });

  it("retries transient downstream failures with exponential backoff, dead-letters after maxRetries, and supports controlled DLQ replay", async () => {
    const processor = new TransactionalOutboxProcessor({ maxRetries: 3, baseBackoffMs: 1000 });
    const evt = makeEvent({ id: "flaky-1", idempotencyKey: "flaky-key-1" });
    const t0 = new Date("2026-11-27T12:00:00.000Z");

    // Attempt 1 fails -> backoff 1000ms
    const r1 = await processor.processBatch([evt], () => {
      throw new Error("Downstream webhook timeout");
    }, t0);
    assert.equal(r1.retried, 1);
    assert.equal(evt.deliveryStatus, "pending");
    assert.equal(evt.retryCount, 1);
    assert.equal(evt.nextAttemptAt, new Date(t0.getTime() + 1000).toISOString());

    // Processing before backoff elapses skips the event
    const rEarly = await processor.processBatch([evt], () => undefined, new Date(t0.getTime() + 500));
    assert.equal(rEarly.attempted, 0);

    // Attempt 2 fails -> backoff 2000ms
    const t1 = new Date(t0.getTime() + 1000);
    const r2 = await processor.processBatch([evt], () => {
      throw new Error("Still down");
    }, t1);
    assert.equal(r2.retried, 1);
    assert.equal(evt.retryCount, 2);
    assert.equal(evt.nextAttemptAt, new Date(t1.getTime() + 2000).toISOString());

    // Attempt 3 fails -> dead_letter!
    const t2 = new Date(t1.getTime() + 2000);
    const r3 = await processor.processBatch([evt], () => {
      throw new Error("Permanent outage");
    }, t2);
    assert.equal(r3.deadLettered, 1);
    assert.equal(evt.deliveryStatus, "dead_letter");

    // Operator replays DLQ once downstream recovers
    const requeued = processor.replayDeadLetters([evt]);
    assert.equal(requeued, 1);
    assert.equal(evt.deliveryStatus, "pending");
    assert.equal(evt.retryCount, 0);

    const r4 = await processor.processBatch([evt], () => undefined, new Date(t2.getTime() + 5000));
    assert.equal(r4.delivered, 1);
    assert.equal(evt.deliveryStatus, "delivered");
    assert.ok(evt.processedAt);
  });
});
