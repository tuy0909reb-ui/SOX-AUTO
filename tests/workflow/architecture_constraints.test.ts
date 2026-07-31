import * as fs from "fs";
import * as path from "path";

const WF = path.resolve(__dirname, "../../src/workflow");
const ORCH = path.resolve(__dirname, "../../src/orchestration");
const RUNTIME = path.resolve(__dirname, "../../src/runtime_execution");

function listTs(dir: string): string[] {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));
}

function importsOf(filePath: string): string[] {
    const body = fs.readFileSync(filePath, "utf8");
    return [...body.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
}

describe("ASA-ARCH-21.1 / 21.2 / 21.3 architecture constraints", () => {
    test("required workflow modules exist (21.0 + 21.1 + 21.2 + 21.3 Ch1–Ch17)", () => {
        const files = listTs(WF).sort();
        expect(files).toEqual(
            expect.arrayContaining([
                "Workflow.ts",
                "WorkflowDefinition.ts",
                "WorkflowMetadata.ts",
                "WorkflowState.ts",
                "ExecutionPolicy.ts",
                "WorkflowBuilder.ts",
                "WorkflowBuildError.ts",
                "StepDefinition.ts",
                "PipelineDefinition.ts",
                "PipelineInvariants.ts",
                "StructuralElement.ts",
                "PipelinePublicContract.ts",
                "ExpansionRules.ts",
                "ValidationContracts.ts",
                "FailureContracts.ts",
                "CompositionPrinciples.ts",
                "CompositionBoundary.ts",
                "CompositionModel.ts",
                "CompositionContract.ts",
                "CompositionInvariants.ts",
                "CompositionConstraints.ts",
                "CompositionValidation.ts",
                "CompositionLifecycle.ts",
                "CompositionEvolution.ts",
                "CompositionIntegration.ts",
                "CompositionBoundaryContract.ts",
                "PipelineCompositionContract.ts",
                "PipelineExecutionBoundaryContract.ts",
                "PipelineExecutionContract.ts",
                "ExecutionDefinitionContract.ts",
                "ExecutionGraphContract.ts",
                "ExecutionGraphConstructionBoundaryContract.ts",
                "NodeFactory.ts",
                "EdgeFactory.ts",
                "index.ts",
            ])
        );
    });

    test("workflow may depend on orchestration types; reverse forbidden", () => {
        for (const file of listTs(WF)) {
            for (const spec of importsOf(path.join(WF, file))) {
                if (spec.includes("orchestration")) {
                    expect(spec.startsWith("../orchestration")).toBe(true);
                }
                expect(spec.includes("Scheduler")).toBe(false);
                expect(spec.includes("EnginePool")).toBe(false);
                expect(spec.includes("DispatchStrategy")).toBe(false);
            }
        }
        for (const file of listTs(ORCH)) {
            const body = fs.readFileSync(path.join(ORCH, file), "utf8");
            expect(body.includes("../workflow") || body.includes("/workflow/")).toBe(false);
        }
    });

    test("Runtime Execution Layer file set unchanged", () => {
        expect(listTs(RUNTIME).sort()).toEqual([
            "Adapter.ts",
            "ExecutionContext.ts",
            "ExecutionEngine.ts",
            "ExecutionLayerInput.ts",
            "index.ts",
            "types.ts",
        ]);
    });

    test("WorkflowBuilder / PipelineInvariants sources contain no execution/schedule/dispatch control APIs", () => {
        for (const file of listTs(WF)) {
            const body = fs.readFileSync(path.join(WF, file), "utf8");
            expect(body).not.toMatch(/class\s+Scheduler|class\s+EnginePool/);
            expect(body).not.toMatch(/assignEngine|dispatchNode\s*\(/);
            expect(body).not.toMatch(/class\s+ConcurrencyPolicy|class\s+DispatchStrategy/);
        }
    });

    test("PipelineInvariants Chapter 1 adds no expander/validator/builder algorithms", () => {
        const body = fs.readFileSync(path.join(WF, "PipelineInvariants.ts"), "utf8");
        expect(body).toMatch(/Architectural constraints only/);
        expect(body).not.toMatch(/\bclass\s+Pipeline(Expander|Validator|Builder|Parser|Compiler)\b/);
    });

    test("Pipeline Public Contract Chapter 2 adds no expander/validator/runtime algorithms", () => {
        for (const name of ["PipelinePublicContract.ts", "StructuralElement.ts"]) {
            const body = fs.readFileSync(path.join(WF, name), "utf8");
            expect(body).not.toMatch(
                /\bclass\s+Pipeline(Expander|Validator|Builder|Parser|Compiler)\b/
            );
            expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
            expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        }
    });

    test("Expansion Rules Chapter 3 adds no expansion engine or graph construction", () => {
        const body = fs.readFileSync(path.join(WF, "ExpansionRules.ts"), "utf8");
        expect(body).toMatch(/Declarative architectural expansion rule registry only/);
        expect(body).not.toMatch(
            /\bclass\s+(ExpansionEngine|ExpansionComponent|PipelineExpander|WorkflowCompiler)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(expand|detectCycle|buildGraph)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
    });

    test("Validation Chapter 4 adds no validation engine or cycle detection implementation", () => {
        const body = fs.readFileSync(path.join(WF, "ValidationContracts.ts"), "utf8");
        expect(body).toMatch(
            /Declarative architectural validation contract registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(ValidationEngine|ValidationExecutor|PipelineValidator)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(validate|detectCycle|expand|buildGraph)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
    });

    test("Failure Contract Chapter 5 adds no handling, recovery, or runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "FailureContracts.ts"), "utf8");
        expect(body).toMatch(
            /Declarative architectural failure contract registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(FailureHandler|Exception|ErrorCode|RecoveryEngine)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(handleFailure|recover|retry|throwError)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Principles Chapter 1 adds no composition / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionPrinciples.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition principle registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExpansionEngine)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(compose|expand|validate|schedule)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Boundary Chapter 2 adds no composition / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionBoundary.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition boundary registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExpansionEngine)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(compose|expand|validate|schedule)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Model Chapter 3 adds no composition / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionModel.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition model registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExpansionEngine)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(compose|expand|validate|schedule)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Contract Chapter 4 adds no composition / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionContract.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition contract registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExpansionEngine)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(compose|expand|validate|schedule)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Invariants Chapter 5 adds no composition / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionInvariants.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition invariant registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExpansionEngine)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(compose|expand|validate|schedule)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Constraints Chapter 6 adds no composition / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionConstraints.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition constraint registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExpansionEngine)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(compose|expand|validate|schedule)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Validation Chapter 7 adds no validation algorithms / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionValidation.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition validation contract registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExpansionEngine|ValidationEngine|CompositionValidator)\b/
        );
        expect(body).not.toMatch(/\bfunction\s+(compose|expand|validate|schedule)\b/);
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Lifecycle Chapter 8 adds no transition / automation / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionLifecycle.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition lifecycle registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|LifecycleEngine|StateMachine|LifecycleAutomator|TransitionExecutor)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|transition|advanceLifecycle|automate)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Evolution Chapter 9 adds no evolution / migration / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionEvolution.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition evolution registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|EvolutionEngine|MigrationEngine|EvolutionExecutor)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|evolve|migrate|applyEvolution)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Integration Chapter 10 adds no integration execution / runtime behavior", () => {
        const body = fs.readFileSync(path.join(WF, "CompositionIntegration.ts"), "utf8");
        expect(body).toMatch(
            /Declarative structural composition integration registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|IntegrationEngine|AssemblyEngine|CompositionIntegrator)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|integrate|mutate|assemble)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Composition Boundary Contract Chapter 11 adds no enforcement / runtime behavior", () => {
        const body = fs.readFileSync(
            path.join(WF, "CompositionBoundaryContract.ts"),
            "utf8"
        );
        expect(body).toMatch(
            /Declarative structural composition boundary contract registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|BoundaryEnforcer|OwnershipTransfer|BoundaryMutator)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|enforceBoundary|transferOwnership|modifyBoundary)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Pipeline Composition Contract Chapter 12 adds no runtime binding / ExecutionGraph", () => {
        const body = fs.readFileSync(
            path.join(WF, "PipelineCompositionContract.ts"),
            "utf8"
        );
        expect(body).toMatch(
            /Declarative structural Pipeline composition contract registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|PipelineComposer|ExecutionGraphBuilder|CompositionBinder)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|bindComposition|buildExecutionGraph)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Pipeline Execution Boundary Contract Chapter 13 adds no runtime / scheduling / dispatch", () => {
        const body = fs.readFileSync(
            path.join(WF, "PipelineExecutionBoundaryContract.ts"),
            "utf8"
        );
        expect(body).toMatch(
            /Declarative structural Pipeline execution boundary contract registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|dispatch|bindRuntime|buildExecutionGraph|manageState)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Pipeline Execution Contract Chapter 14 adds no runtime / ExecutionGraph / engine selection", () => {
        const body = fs.readFileSync(
            path.join(WF, "PipelineExecutionContract.ts"),
            "utf8"
        );
        expect(body).toMatch(
            /Declarative structural Pipeline execution contract registry and type model only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler|Dispatcher)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|dispatch|bindRuntime|buildExecutionGraph|manageState|selectEngine)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Execution Definition Contract Chapter 15 adds no graph / transformation / runtime", () => {
        const body = fs.readFileSync(
            path.join(WF, "ExecutionDefinitionContract.ts"),
            "utf8"
        );
        expect(body).toMatch(
            /Declarative structural Execution Definition contract registry and type model only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler|Dispatcher|DefinitionTransformer)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|dispatch|bindRuntime|buildExecutionGraph|transformDefinition|constructGraph|traverseGraph)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Execution Graph Contract Chapter 16 adds no construction / validation / traversal", () => {
        const body = fs.readFileSync(
            path.join(WF, "ExecutionGraphContract.ts"),
            "utf8"
        );
        expect(body).toMatch(
            /Declarative structural Execution Graph contract registry and type model only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler|Dispatcher|GraphValidator|GraphTransformer)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|dispatch|bindRuntime|buildExecutionGraph|constructGraph|traverseGraph|topologicalSort|detectCycle|transformDefinition|generateGraph|repairGraph)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Execution Graph Construction Boundary Chapter 17 adds no builder / factory / construction", () => {
        const body = fs.readFileSync(
            path.join(WF, "ExecutionGraphConstructionBoundaryContract.ts"),
            "utf8"
        );
        expect(body).toMatch(
            /Declarative structural Execution Graph Construction Boundary contract registry and type model only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CompositionEngine|ExecutionEngine|ExecutionGraphBuilder|RuntimeBinder|Scheduler|Dispatcher|GraphBuilder|GraphFactory|GraphCompiler|GraphGenerator)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|dispatch|bindRuntime|buildExecutionGraph|constructGraph|transformGraph|generateGraph|createBuilder|createFactory)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/runtime_execution/);
        expect(body).not.toMatch(/from\s+["']\.\/WorkflowBuilder/);
    });

    test("Construction Contract Chapter 18 lives under contracts/ with declarative lookup only", () => {
        const contractsRoot = path.join(__dirname, "../../src/contracts");
        const constructionSrc = path.join(
            contractsRoot,
            "construction/ConstructionContract.ts"
        );
        const registrySrc = path.join(
            contractsRoot,
            "registry/ContractRegistry.ts"
        );
        expect(fs.existsSync(constructionSrc)).toBe(true);
        expect(fs.existsSync(registrySrc)).toBe(true);
        const body = fs.readFileSync(constructionSrc, "utf8");
        const registryBody = fs.readFileSync(registrySrc, "utf8");
        expect(body).toMatch(
            /Declarative Construction Contract type model and CCC registry only/
        );
        expect(registryBody).toMatch(/declarative lookup only/);
        expect(body).not.toMatch(
            /\bclass\s+(Builder|Factory|Compiler|Generator|Transformer|Scheduler|Dispatcher|RuntimeGraph)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|dispatch|bindRuntime|constructGraph|createBuilder|createFactory|transform|compile|generate)\b/
        );
        expect(registryBody).not.toMatch(
            /\bfunction\s+(instantiate|execute|validate|transform|construct)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
    });

    test("Construction Definition Chapter 19 is declarative-only under contracts/", () => {
        const definitionSrc = path.join(
            __dirname,
            "../../src/contracts/construction/ConstructionDefinition.ts"
        );
        expect(fs.existsSync(definitionSrc)).toBe(true);
        const body = fs.readFileSync(definitionSrc, "utf8");
        expect(body).toMatch(
            /Declarative Construction Definition type model and CDD registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(Builder|Factory|Compiler|Generator|Transformer|Scheduler|Dispatcher|RuntimeGraph|ConstructionPipeline)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(compose|expand|validate|schedule|dispatch|bindRuntime|construct|createBuilder|createFactory|transform|compile|generate|resolveDependencies|instantiate)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
    });

    test("Construction Registry Chapter 20 is declarative-only under contracts/", () => {
        const registrySrc = path.join(
            __dirname,
            "../../src/contracts/construction/ConstructionRegistry.ts"
        );
        expect(fs.existsSync(registrySrc)).toBe(true);
        const body = fs.readFileSync(registrySrc, "utf8");
        expect(body).toMatch(
            /Declarative Construction Registry type model and CRG registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(RegistryService|RegistryLoader|RegistryResolver|Builder|Factory|Compiler|Generator|Transformer|Scheduler|Dispatcher|RuntimeGraph|ConstructionPipeline)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(register|unregister|resolve|load|lookupDefinition|compose|expand|validate|schedule|dispatch|bindRuntime|construct|createBuilder|createFactory|transform|compile|generate|resolveDependencies|instantiate)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
    });

    test("Construction Catalog Chapter 21 is declarative-only under contracts/", () => {
        const catalogSrc = path.join(
            __dirname,
            "../../src/contracts/construction/ConstructionCatalog.ts"
        );
        expect(fs.existsSync(catalogSrc)).toBe(true);
        const body = fs.readFileSync(catalogSrc, "utf8");
        expect(body).toMatch(
            /Declarative Construction Catalog type model and CCA registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(CatalogService|CatalogLoader|CatalogResolver|RegistryService|RegistryLoader|Builder|Factory|Compiler|Generator|Scheduler|Dispatcher|RuntimeGraph|ConstructionPipeline)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(register|unregister|resolve|load|lookupDefinition|discover|compose|expand|validate|schedule|dispatch|bindRuntime|construct|createBuilder|createFactory|transform|compile|generate|resolveDependencies|instantiate|planConstruction)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
    });

    test("Construction Discovery Chapter 22 is declarative-only under contracts/", () => {
        const discoverySrc = path.join(
            __dirname,
            "../../src/contracts/construction/ConstructionDiscovery.ts"
        );
        expect(fs.existsSync(discoverySrc)).toBe(true);
        const body = fs.readFileSync(discoverySrc, "utf8");
        expect(body).toMatch(
            /Declarative Construction Discovery type model and CDD registry only/
        );
        expect(body).not.toMatch(
            /\bclass\s+(DiscoveryService|DiscoveryLoader|DiscoveryResolver|CatalogService|CatalogLoader|RegistryService|Builder|Factory|Compiler|Generator|Scheduler|Dispatcher|RuntimeGraph|ConstructionPipeline)\b/
        );
        expect(body).not.toMatch(
            /\bfunction\s+(register|unregister|resolve|load|lookupDefinition|discover|discoverCatalog|compose|expand|validate|schedule|dispatch|bindRuntime|construct|createBuilder|createFactory|transform|compile|generate|resolveDependencies|instantiate|planConstruction)\b/
        );
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/orchestration/);
        expect(body).not.toMatch(/from\s+["']\.\.\/\.\.\/runtime_execution/);
    });

    test("orchestration and runtime_execution packages remain present (extension only under workflow)", () => {
        expect(fs.existsSync(path.join(ORCH, "Orchestrator.ts"))).toBe(true);
        expect(fs.existsSync(path.join(ORCH, "Scheduler.ts"))).toBe(true);
        expect(fs.existsSync(path.join(RUNTIME, "ExecutionEngine.ts"))).toBe(true);
    });
});
