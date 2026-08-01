/**
 * ASA-ARCH-46.0 — type-only interfaces
 */

import type { EvolutionRegistryRecord } from "../models";
import type { EvolutionIdentifier } from "../types";

export interface EvolutionValidationInspectionResult {
    readonly inspectionKind: "EvolutionValidationInspectionResult";
    readonly passed: boolean;
    readonly findings: readonly string[];
    readonly isInspectionOnly: true;
    readonly doesNotDecide: true;
    readonly doesNotGrantAuthority: true;
    readonly doesNotMutateRegistry: true;
}

export interface EvolutionRegistryReader {
    readonly role: "EvolutionRegistryReader";
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivate: true;
    getRecord(evolutionId: EvolutionIdentifier): EvolutionRegistryRecord | null;
    listRecords(): readonly EvolutionRegistryRecord[];
    hasRecord(evolutionId: EvolutionIdentifier): boolean;
}

export interface EvolutionRegistryWriter {
    readonly role: "EvolutionRegistryWriter";
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivate: true;
    storeRecord(record: EvolutionRegistryRecord): EvolutionRegistryRecord;
    replaceRecord(
        evolutionId: EvolutionIdentifier,
        record: EvolutionRegistryRecord
    ): EvolutionRegistryRecord;
}

export interface EvolutionValidator {
    readonly role: "EvolutionValidator";
    readonly isInspectionOnly: true;
    readonly doesNotDecide: true;
    readonly doesNotGrantAuthority: true;
}
