/**
 * ASA-ARCH-45.0 — ProhibitedCapabilityValidation
 * Detects prohibited runtime / decision / authority-capability tokens.
 * Detection list only — does not implement those capabilities.
 */

import type { ExtensionValidationInspectionResult } from "../interfaces";
import type { LifecycleDeclarationState } from "../types";
import { LIFECYCLE_DECLARATION_STATES } from "../types";
import { freezeInspectionResult } from "./inspectionResult";

/** Tokens that must never appear as Extension capabilities / states. */
export const PROHIBITED_CAPABILITY_TOKENS: readonly string[] = Object.freeze([
    "ACTIVE",
    "ENABLE",
    "ACTIVATE",
    "EXECUTE",
    "RUN",
    "DECIDE",
    "GRANT_AUTHORITY",
]);

export function detectProhibitedCapabilityTokens(
    text: string
): ExtensionValidationInspectionResult {
    const upper = text.toUpperCase();
    const findings: string[] = [];
    for (const token of PROHIBITED_CAPABILITY_TOKENS) {
        const pattern = new RegExp(`\\b${token}\\b`);
        if (pattern.test(upper)) {
            findings.push(`Prohibited capability token detected: ${token}`);
        }
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateLifecycleDeclarationStateAbsenceOfRuntime(
    state: LifecycleDeclarationState
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!LIFECYCLE_DECLARATION_STATES.includes(state)) {
        findings.push(`Unknown lifecycle declaration state: ${state}`);
    }
    const tokenScan = detectProhibitedCapabilityTokens(String(state));
    findings.push(...tokenScan.findings);
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateRuntimeCapabilityAbsence(flags: {
    readonly doesNotActivateExtension?: boolean;
    readonly doesNotExecuteExtension?: boolean;
    readonly forbidsRuntimeExecutionLogic?: boolean;
    readonly forbidsActivate?: boolean;
    readonly forbidsEnable?: boolean;
    readonly forbidsActiveState?: boolean;
}): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (flags.doesNotActivateExtension === false) {
        findings.push("Activation capability must be absent");
    }
    if (flags.doesNotExecuteExtension === false) {
        findings.push("Execution capability must be absent");
    }
    if (flags.forbidsRuntimeExecutionLogic === false) {
        findings.push("Runtime execution logic must be forbidden");
    }
    if (flags.forbidsActivate === false || flags.forbidsEnable === false) {
        findings.push("Activate/Enable must remain forbidden");
    }
    if (flags.forbidsActiveState === false) {
        findings.push("ACTIVE state must remain forbidden");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateDecisionCapabilityAbsence(flags: {
    readonly forbidsDecisionLogic?: boolean;
    readonly doesNotDecide?: boolean;
    readonly isInspectionOnly?: boolean;
}): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (flags.forbidsDecisionLogic === false) {
        findings.push("Decision logic must be forbidden");
    }
    if (flags.doesNotDecide === false) {
        findings.push("Decision capability must be absent");
    }
    if (flags.isInspectionOnly === false) {
        findings.push("Validation outcomes must remain inspection-only");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
