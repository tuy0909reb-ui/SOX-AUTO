/**
 * ASA-ARCH-21.3 Contract Registry — declarative lookup only.
 *
 * Registers Chapter 18–22 construction contracts and prior frozen chapter metadata.
 *
 * SHALL NOT:
 * - instantiate contracts
 * - execute construction
 * - perform validation
 * - perform transformation
 */

import {
    CONSTRUCTION_CONTRACT_PRINCIPLE_IDS,
    ConstructionContractPrincipleId,
    getConstructionContractPrinciple,
} from "../construction/ConstructionContract";
import {
    CONSTRUCTION_DEFINITION_PRINCIPLE_IDS,
    ConstructionDefinitionPrincipleId,
    getConstructionDefinitionPrinciple,
} from "../construction/ConstructionDefinition";
import {
    CONSTRUCTION_REGISTRY_PRINCIPLE_IDS,
    ConstructionRegistryPrincipleId,
    getConstructionRegistryPrinciple,
} from "../construction/ConstructionRegistry";
import {
    CONSTRUCTION_CATALOG_PRINCIPLE_IDS,
    ConstructionCatalogPrincipleId,
    getConstructionCatalogPrinciple,
} from "../construction/ConstructionCatalog";
import {
    CONSTRUCTION_DISCOVERY_PRINCIPLE_IDS,
    ConstructionDiscoveryPrincipleId,
    getConstructionDiscoveryPrinciple,
} from "../construction/ConstructionDiscovery";

export type RegisteredContractChapterId =
    | "ASA-ARCH-21.3-CH11"
    | "ASA-ARCH-21.3-CH12"
    | "ASA-ARCH-21.3-CH13"
    | "ASA-ARCH-21.3-CH14"
    | "ASA-ARCH-21.3-CH15"
    | "ASA-ARCH-21.3-CH16"
    | "ASA-ARCH-21.3-CH17"
    | "ASA-ARCH-21.3-CH18"
    | "ASA-ARCH-21.3-CH19"
    | "ASA-ARCH-21.3-CH20"
    | "ASA-ARCH-21.3-CH21"
    | "ASA-ARCH-21.3-CH22";

export interface ContractRegistryEntry {
    readonly chapterId: RegisteredContractChapterId;
    readonly contractName: string;
    readonly version: string;
    readonly coverage: readonly string[];
    readonly sourcePath: string;
}

const ENTRIES: readonly ContractRegistryEntry[] = Object.freeze([
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH11",
        contractName: "Composition Boundary Contract",
        version: "0.2",
        coverage: Object.freeze([
            "CBC-1",
            "CBC-2",
            "CBC-3",
            "CBC-4",
            "CBC-5",
            "CBC-6",
            "CBC-7",
            "CBC-8",
            "CBC-9",
            "CBC-10",
        ]),
        sourcePath: "src/workflow/CompositionBoundaryContract.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH12",
        contractName: "Pipeline Composition Contract",
        version: "0.2",
        coverage: Object.freeze([
            "PCC-1",
            "PCC-2",
            "PCC-3",
            "PCC-4",
            "PCC-5",
            "PCC-6",
            "PCC-7",
            "PCC-8",
            "PCC-9",
            "PCC-10",
        ]),
        sourcePath: "src/workflow/PipelineCompositionContract.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH13",
        contractName: "Pipeline Execution Boundary Contract",
        version: "0.2",
        coverage: Object.freeze([
            "PEB-1",
            "PEB-2",
            "PEB-3",
            "PEB-4",
            "PEB-5",
            "PEB-6",
            "PEB-7",
            "PEB-8",
            "PEB-9",
            "PEB-10",
        ]),
        sourcePath: "src/workflow/PipelineExecutionBoundaryContract.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH14",
        contractName: "Pipeline Execution Contract",
        version: "0.2",
        coverage: Object.freeze([
            "PEC-1",
            "PEC-2",
            "PEC-3",
            "PEC-4",
            "PEC-5",
            "PEC-6",
            "PEC-7",
            "PEC-8",
            "PEC-9",
            "PEC-10",
            "PEC-11",
        ]),
        sourcePath: "src/workflow/PipelineExecutionContract.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH15",
        contractName: "Execution Definition Contract",
        version: "0.3",
        coverage: Object.freeze([
            "EDC-1",
            "EDC-2",
            "EDC-3",
            "EDC-4",
            "EDC-5",
            "EDC-6",
            "EDC-7",
            "EDC-8",
            "EDC-9",
            "EDC-10",
            "EDC-11",
            "EDC-12",
        ]),
        sourcePath: "src/workflow/ExecutionDefinitionContract.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH16",
        contractName: "Execution Graph Contract",
        version: "0.3",
        coverage: Object.freeze([
            "EGC-1",
            "EGC-2",
            "EGC-3",
            "EGC-4",
            "EGC-5",
            "EGC-6",
            "EGC-7",
            "EGC-8",
            "EGC-9",
            "EGC-10",
            "EGC-11",
            "EGC-12",
        ]),
        sourcePath: "src/workflow/ExecutionGraphContract.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH17",
        contractName: "Execution Graph Construction Boundary",
        version: "0.5",
        coverage: Object.freeze([
            "CBC-1",
            "CBC-2",
            "CBC-3",
            "CBC-4",
            "CBC-5",
            "CBC-6",
            "CBC-7",
            "CBC-8",
            "CBC-9",
            "CBC-10",
            "CBC-11",
            "CBC-12",
        ]),
        sourcePath: "src/workflow/ExecutionGraphConstructionBoundaryContract.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH18",
        contractName: "Construction Contract",
        version: "0.3",
        coverage: Object.freeze([...CONSTRUCTION_CONTRACT_PRINCIPLE_IDS]),
        sourcePath: "src/contracts/construction/ConstructionContract.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH19",
        contractName: "Construction Definition",
        version: "1.1",
        coverage: Object.freeze([...CONSTRUCTION_DEFINITION_PRINCIPLE_IDS]),
        sourcePath: "src/contracts/construction/ConstructionDefinition.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH20",
        contractName: "Construction Registry",
        version: "1.0",
        coverage: Object.freeze([...CONSTRUCTION_REGISTRY_PRINCIPLE_IDS]),
        sourcePath: "src/contracts/construction/ConstructionRegistry.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH21",
        contractName: "Construction Catalog",
        version: "0.5",
        coverage: Object.freeze([...CONSTRUCTION_CATALOG_PRINCIPLE_IDS]),
        sourcePath: "src/contracts/construction/ConstructionCatalog.ts",
    }),
    Object.freeze({
        chapterId: "ASA-ARCH-21.3-CH22",
        contractName: "Construction Discovery",
        version: "0.7",
        coverage: Object.freeze([...CONSTRUCTION_DISCOVERY_PRINCIPLE_IDS]),
        sourcePath: "src/contracts/construction/ConstructionDiscovery.ts",
    }),
]);

/** Frozen declarative contract registry (lookup metadata only). */
export const CONTRACT_REGISTRY: readonly ContractRegistryEntry[] = ENTRIES;

export const CONTRACT_REGISTRY_CHAPTER_IDS: readonly RegisteredContractChapterId[] =
    Object.freeze(ENTRIES.map((e) => e.chapterId));

/** Lookup registry entry by chapter id — no instantiation / validation / transformation. */
export function lookupContract(
    chapterId: RegisteredContractChapterId
): ContractRegistryEntry {
    const found = ENTRIES.find((e) => e.chapterId === chapterId);
    if (!found) {
        throw new Error(`Unknown RegisteredContractChapterId: ${chapterId}`);
    }
    return found;
}

/** Lookup Chapter 18 CCC principle — registry facade over declarative principles only. */
export function lookupConstructionContractPrinciple(
    id: ConstructionContractPrincipleId
) {
    return getConstructionContractPrinciple(id);
}

/** Lookup Chapter 19 CDD principle — registry facade over declarative principles only. */
export function lookupConstructionDefinitionPrinciple(
    id: ConstructionDefinitionPrincipleId
) {
    return getConstructionDefinitionPrinciple(id);
}

/** Lookup Chapter 20 CRG principle — registry facade over declarative principles only. */
export function lookupConstructionRegistryPrinciple(
    id: ConstructionRegistryPrincipleId
) {
    return getConstructionRegistryPrinciple(id);
}

/** Lookup Chapter 21 CCA principle — registry facade over declarative principles only. */
export function lookupConstructionCatalogPrinciple(
    id: ConstructionCatalogPrincipleId
) {
    return getConstructionCatalogPrinciple(id);
}

/** Lookup Chapter 22 Construction Discovery CDD principle — principle-catalog only. */
export function lookupConstructionDiscoveryPrinciple(
    id: ConstructionDiscoveryPrincipleId
) {
    return getConstructionDiscoveryPrinciple(id);
}
