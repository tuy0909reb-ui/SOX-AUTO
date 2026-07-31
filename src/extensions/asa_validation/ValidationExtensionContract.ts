/**
 * ASA-ARCH-39.0 - ASA-VALIDATION Extension Contract (Draft 0.4)
 *
 * Declarative metadata / authority / compatibility surface for
 * the Extension Validation & Assurance Layer.
 *
 * Authority is fixed to VALIDATOR (introduced by this Extension;
 * not a mutation of frozen ExtensionAuthorityLevel).
 * Validation ≠ Authority; Certification ≠ Execution; Detection ≠ Correction.
 * SHALL NOT contain validation engines or autonomous remediation.
 */

import type { ExtensionFrameworkLifecycleState } from "../../extension_development_framework/ExtensionDevelopmentFrameworkTypes";

/** Fixed Extension Identifier for ASA-VALIDATION. */
export type AsaValidationExtensionId = "ASA-VALIDATION";

/** Architecture domain label. */
export type AsaValidationDomainLabel = "Assurance";

/**
 * Local framework-domain label for this Extension.
 * Distinct from frozen ExtensionDomainKind (OPS | AI | CONNECT).
 */
export type AsaValidationFrameworkDomain = "VALIDATION";

/**
 * VALIDATOR authority introduced by ASA-ARCH-39.0.
 * Not extracted from frozen ExtensionAuthorityLevel.
 */
export type ValidationAuthorityLevel = "VALIDATOR";

/**
 * ASA-VALIDATION Extension Metadata Contract.
 * Authority is structurally fixed to VALIDATOR.
 */
export interface ValidationExtensionContract {
    readonly id: AsaValidationExtensionId;
    readonly version: string;
    readonly domain: AsaValidationDomainLabel;
    readonly frameworkDomain: AsaValidationFrameworkDomain;
    readonly authority: ValidationAuthorityLevel;
    readonly lifecycle: ExtensionFrameworkLifecycleState;
    readonly compatibility: ReadonlyArray<string>;
    readonly description: string;
    readonly governanceOwner: string;
    readonly validationIsNotAuthority: true;
    readonly detectionIsNotCorrection: true;
    readonly reportIsNotDecision: true;
    readonly assessmentIsNotApproval: true;
    readonly certificationIsNotExecution: true;
    readonly verificationIsNotMutation: true;
    readonly certifyIsNotAuthorize: true;
    readonly recommendationIsNotCorrection: true;
    readonly forbidsExecute: true;
    readonly forbidsCoreMutation: true;
    readonly forbidsFrameworkMutation: true;
    readonly forbidsGovernanceMutation: true;
    readonly forbidsExtensionContractMutation: true;
    readonly forbidsPolicyChange: true;
    readonly forbidsGrantAuthority: true;
    readonly forbidsAutomaticCorrection: true;
    readonly forbidsApproveOwnViolation: true;
    readonly forbidsBypassValidation: true;
    readonly forbidsAuthorityEscalation: true;
    readonly permitsObserve: true;
    readonly permitsInspect: true;
    readonly permitsValidate: true;
    readonly permitsCompare: true;
    readonly permitsAnalyze: true;
    readonly permitsGenerateReport: true;
    readonly permitsGenerateFinding: true;
    readonly permitsGenerateAssuranceCertificationResult: true;
    readonly permitsRequestReview: true;
}

export function freezeValidationExtensionContract(
    contract: ValidationExtensionContract
): ValidationExtensionContract {
    return Object.freeze({
        ...contract,
        compatibility: Object.freeze([...contract.compatibility]),
    });
}
