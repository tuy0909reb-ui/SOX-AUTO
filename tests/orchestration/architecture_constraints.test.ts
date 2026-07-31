import * as fs from "fs";
import * as path from "path";

const ORCH_DIR = path.resolve(__dirname, "../../src/orchestration");
const RUNTIME_EXEC_DIR = path.resolve(__dirname, "../../src/runtime_execution");

function listTs(dir: string): string[] {
    return fs.readdirSync(dir).filter((n) => n.endsWith(".ts"));
}

function importsOf(filePath: string): string[] {
    const body = fs.readFileSync(filePath, "utf8");
    return [...body.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
}

describe("20.9.1 / 20.9.2 architecture constraints", () => {
    test("internal component dependency graph is acyclic", () => {
        const components = [
            "Dispatcher.ts",
            "DispatchStrategy.ts",
            "ExecutionCoordinator.ts",
            "EnginePool.ts",
            "EngineRegistry.ts",
            "ResultCollector.ts",
            "ErrorPolicy.ts",
            "LifecycleController.ts",
        ];

        const edges: Record<string, string[]> = {};
        for (const file of components) {
            const specifiers = importsOf(path.join(ORCH_DIR, file));
            edges[file] = specifiers
                .filter((s) => s.startsWith("./"))
                .map((s) => {
                    const base = path.basename(s);
                    return base.endsWith(".ts") ? base : `${base}.ts`;
                })
                .filter((s) => components.includes(s));
        }

        const visiting = new Set<string>();
        const visited = new Set<string>();
        const visit = (node: string): void => {
            if (visiting.has(node)) {
                throw new Error(`Cycle detected at ${node}`);
            }
            if (visited.has(node)) return;
            visiting.add(node);
            for (const next of edges[node] ?? []) {
                visit(next);
            }
            visiting.delete(node);
            visited.add(node);
        };
        for (const c of components) {
            visit(c);
        }
        expect(visited.size).toBe(components.length);
    });

    test("orchestration may depend on runtime_execution; reverse forbidden", () => {
        for (const file of listTs(ORCH_DIR)) {
            const specifiers = importsOf(path.join(ORCH_DIR, file));
            for (const s of specifiers) {
                if (s.includes("runtime_execution")) {
                    expect(s.includes("../runtime_execution")).toBe(true);
                }
            }
        }
        for (const file of listTs(RUNTIME_EXEC_DIR)) {
            const body = fs.readFileSync(path.join(RUNTIME_EXEC_DIR, file), "utf8");
            expect(body.includes("orchestration")).toBe(false);
        }
    });

    test("Frozen Runtime Execution Layer sources unchanged by orchestration addition", () => {
        const required = [
            "types.ts",
            "ExecutionLayerInput.ts",
            "ExecutionContext.ts",
            "ExecutionEngine.ts",
            "Adapter.ts",
            "index.ts",
        ];
        const files = listTs(RUNTIME_EXEC_DIR);
        expect(files.sort()).toEqual(required.sort());
    });

    test("orchestration sources do not import Workflow/Pipeline/Observability", () => {
        for (const file of listTs(ORCH_DIR)) {
            const lower = file.toLowerCase();
            expect(lower).not.toMatch(/workflow|pipeline|observability/);
            const body = fs.readFileSync(path.join(ORCH_DIR, file), "utf8").toLowerCase();
            expect(body).not.toMatch(/class\s+workflow|class\s+pipeline/);
        }
    });
});
