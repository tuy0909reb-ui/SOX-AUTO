import { ScheduledNodeQueue } from "../../src/orchestration/ScheduledNodeQueue";

describe("ScheduledNodeQueue", () => {
    test("immutable ordered read-only deterministic", () => {
        const q = ScheduledNodeQueue.from(["a", "b", "c"]);
        expect(q.toArray()).toEqual(["a", "b", "c"]);
        expect(Object.isFrozen(q)).toBe(true);
        expect(Object.isFrozen(q.toArray())).toBe(true);
        expect(() => {
            (q.toArray() as string[]).push("d");
        }).toThrow();
    });

    test("duplicate node rejection", () => {
        expect(() => ScheduledNodeQueue.from(["a", "b", "a"])).toThrow(/Duplicate NodeID/);
    });

    test("deterministic iteration", () => {
        const q1 = ScheduledNodeQueue.from(["x", "y"]);
        const q2 = ScheduledNodeQueue.from(["x", "y"]);
        expect([...q1]).toEqual([...q2]);
    });
});
