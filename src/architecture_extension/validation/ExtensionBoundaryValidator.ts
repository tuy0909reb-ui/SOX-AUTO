/**
 * ASA-ARCH-45.0 — ExtensionBoundaryValidator
 * Implements ExtensionValidator. Read-only / deterministic / no mutation.
 */

import type {
    ExtensionRegistryHistoryReader,
    ExtensionRegistryReader,
    ExtensionValidationInspectionResult,
    ExtensionValidator,
} from "../interfaces";
import type { ExtensionBoundary, ExtensionIdentity } from "../models";
import type { ExtensionIdentifier } from "../types";
import { validateBoundaryModel } from "./BoundaryValidation";
import { validateIdentityModel } from "./IdentityValidation";
import {
    validateDeterministicLookup,
    validateRegistryIsolation,
    validateRegistryRecordIntegrity,
} from "./RegistryValidation";
import { mergeInspectionResults } from "./inspectionResult";
import {
    validateDecisionCapabilityAbsence,
    validateRuntimeCapabilityAbsence,
} from "./ProhibitedCapabilityValidation";

export class ExtensionBoundaryValidator implements ExtensionValidator {
    readonly interfaceId = "ExtensionValidator" as const;
    readonly readOnly = true as const;
    readonly dependsOnRegistryInterfacesOnly = true as const;
    readonly doesNotOwnAuthority = true as const;
    readonly doesNotActivateExtension = true as const;
    readonly doesNotMutateRegistry = true as const;
    readonly doesNotDecide = true as const;

    inspectIdentity(
        identity: ExtensionIdentity
    ): ExtensionValidationInspectionResult {
        return mergeInspectionResults([
            validateIdentityModel(identity),
            validateRuntimeCapabilityAbsence({
                doesNotActivateExtension: true,
            }),
            validateDecisionCapabilityAbsence({
                doesNotDecide: true,
                isInspectionOnly: true,
            }),
        ]);
    }

    inspectBoundary(
        boundary: ExtensionBoundary
    ): ExtensionValidationInspectionResult {
        return mergeInspectionResults([
            validateBoundaryModel(boundary),
            validateRuntimeCapabilityAbsence({
                forbidsRuntimeExecutionLogic:
                    boundary.forbidsRuntimeExecutionLogic,
                doesNotActivateExtension: true,
            }),
            validateDecisionCapabilityAbsence({
                forbidsDecisionLogic: boundary.forbidsDecisionLogic,
                doesNotDecide: true,
                isInspectionOnly: true,
            }),
        ]);
    }

    inspectRegistryIntegrity(
        extensionId: ExtensionIdentifier,
        reader: ExtensionRegistryReader,
        historyReader: ExtensionRegistryHistoryReader
    ): ExtensionValidationInspectionResult {
        return mergeInspectionResults([
            validateRegistryIsolation(reader),
            validateRegistryRecordIntegrity(
                extensionId,
                reader,
                historyReader
            ),
            validateDeterministicLookup(reader),
            validateRuntimeCapabilityAbsence({
                doesNotActivateExtension: reader.doesNotActivateExtension,
                doesNotExecuteExtension: true,
            }),
            validateDecisionCapabilityAbsence({
                doesNotDecide: true,
                isInspectionOnly: true,
            }),
        ]);
    }
}
