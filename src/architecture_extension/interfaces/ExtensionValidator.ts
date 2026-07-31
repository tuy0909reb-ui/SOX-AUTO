/**
 * ASA-ARCH-45.0 — ExtensionValidator
 * Structural inspection shape only. Does not decide, authorize, or mutate.
 */

import type { ExtensionBoundary } from "../models";
import type { ExtensionIdentity } from "../models";
import type { ExtensionIdentifier } from "../types";
import type { ExtensionRegistryReader } from "./ExtensionRegistryReader";
import type { ExtensionRegistryHistoryReader } from "./ExtensionRegistryHistoryReader";

/**
 * Inspection outcome — not an authority decision.
 */
export interface ExtensionValidationInspectionResult {
    readonly inspectionKind: "ExtensionValidationInspectionResult";
    readonly passed: boolean;
    readonly findings: readonly string[];
    readonly isInspectionOnly: true;
    readonly doesNotDecide: true;
    readonly doesNotGrantAuthority: true;
    readonly doesNotMutateRegistry: true;
}

export interface ExtensionValidator {
    readonly interfaceId: "ExtensionValidator";
    readonly readOnly: true;
    readonly dependsOnRegistryInterfacesOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivateExtension: true;
    readonly doesNotMutateRegistry: true;
    readonly doesNotDecide: true;

    inspectIdentity(
        identity: ExtensionIdentity
    ): ExtensionValidationInspectionResult;

    inspectBoundary(
        boundary: ExtensionBoundary
    ): ExtensionValidationInspectionResult;

    inspectRegistryIntegrity(
        extensionId: ExtensionIdentifier,
        reader: ExtensionRegistryReader,
        historyReader: ExtensionRegistryHistoryReader
    ): ExtensionValidationInspectionResult;
}
