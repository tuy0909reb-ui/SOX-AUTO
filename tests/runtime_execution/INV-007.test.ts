import * as fs from "fs";
import * as path from "path";

/**
 * INV-007 循環依存は禁止される
 * Mapping: Section 1 Overview
 */
describe("INV-007", () => {
    test("INV-007", () => {
        const runtimeExecutionDir = path.resolve(__dirname, "../../src/runtime_execution");
        const files = fs.readdirSync(runtimeExecutionDir).filter((name) => name.endsWith(".ts"));
        const importPattern = /from\s+["']([^"']+)["']/g;

        const graph = new Map<string, string[]>();
        for (const file of files) {
            const body = fs.readFileSync(path.join(runtimeExecutionDir, file), "utf8");
            const deps: string[] = [];
            for (const match of body.matchAll(importPattern)) {
                const specifier = match[1];
                if (!specifier.startsWith(".")) {
                    continue;
                }
                const resolved = path.normalize(path.join(runtimeExecutionDir, specifier));
                const depFile = path.basename(resolved.endsWith(".ts") ? resolved : `${resolved}.ts`);
                if (files.includes(depFile)) {
                    deps.push(depFile);
                }
            }
            graph.set(file, deps);
        }

        const visiting = new Set<string>();
        const visited = new Set<string>();
        const cycles: string[] = [];

        const visit = (node: string, stack: string[]): void => {
            if (visiting.has(node)) {
                cycles.push([...stack, node].join(" -> "));
                return;
            }
            if (visited.has(node)) {
                return;
            }
            visiting.add(node);
            for (const dep of graph.get(node) ?? []) {
                visit(dep, [...stack, node]);
            }
            visiting.delete(node);
            visited.add(node);
        };

        for (const file of files) {
            visit(file, []);
        }

        expect(cycles).toEqual([]);
    });
});
