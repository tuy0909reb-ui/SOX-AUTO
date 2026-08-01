/**
 * ASA-ARCH-46.0 — ProhibitedCapabilityValidation
 */

import type { EvolutionValidationInspectionResult } from "../interfaces";
import { freezeInspectionResult } from "./inspectionResult";

const PROHIBITED_TOKENS = Object.freeze([
    "ACTIVE",
    "ENABLE",
    "ACTIVATE",
    "EXECUTE",
    "RUN",
    "DECIDE",
    "GRANT_AUTHORITY",
] as const);

export function inspectProhibitedCapabilities(
    surface: Record<string, unknown>
): EvolutionValidationInspectionResult {
    const findings: string[] = [];
    const serialized = JSON.stringify(surface).toUpperCase();
    for (const token of PROHIBITED_TOKENS) {
        if (serialized.includes(`"${token}"`) || serialized.includes(`:${token}`)) {
            findings.push(`prohibited capability token present: ${token}`);
        }
    }
    if (surface.hasRuntimeIntegration === true) {
        findings.push("hasRuntimeIntegration must not be true");
    }
    if (surface.hasDecisionCapability === true) {
        findings.push("hasDecisionCapability must not be true");
    }
    if (surface.hasAuthorityOwnership === true) {
        findings.push("hasAuthorityOwnership must not be true");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export { PROHIBITED_TOKENS };
