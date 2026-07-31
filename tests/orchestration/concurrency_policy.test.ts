import { ConcurrencyPolicy } from "../../src/orchestration/ConcurrencyPolicy";
import { ScheduledNodeQueue } from "../../src/orchestration/ScheduledNodeQueue";

describe("ConcurrencyPolicy", () => {
    const policy = new ConcurrencyPolicy();

    test("limits without reordering", () => {
        expect(policy.apply(["a", "b", "c", "d"], 2)).toEqual(["a", "b"]);
    });

    test("unlimited passes through", () => {
        expect(policy.apply(["a", "b"], Number.POSITIVE_INFINITY)).toEqual(["a", "b"]);
    });

    test("applyToQueue does not mutate original queue", () => {
        const q = ScheduledNodeQueue.from(["a", "b", "c"]);
        const limited = policy.applyToQueue(q, 1);
        expect(q.toArray()).toEqual(["a", "b", "c"]);
        expect(limited.toArray()).toEqual(["a"]);
    });
});
