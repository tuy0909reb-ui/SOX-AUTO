/**
 * ASA-ARCH-50.0 — ArchitectureCoverage
 */

export interface ArchitectureCoverage {
    readonly kind: "ArchitectureCoverage";
    readonly requiredLayers: readonly string[];
    readonly completedLayers: readonly string[];
    readonly missingLayers: readonly string[];
    readonly coverageComplete: boolean;
    readonly immutable: true;
}

export function freezeArchitectureCoverage(input: {
    requiredLayers: readonly string[];
    completedLayers: readonly string[];
}): ArchitectureCoverage {
    const required = Object.freeze(
        [...input.requiredLayers].map((s) => s.trim()).filter(Boolean).sort()
    );
    const completed = Object.freeze(
        [...input.completedLayers].map((s) => s.trim()).filter(Boolean).sort()
    );
    const completedSet = new Set(completed);
    const missing = Object.freeze(
        required.filter((layer) => !completedSet.has(layer))
    );
    return Object.freeze({
        kind: "ArchitectureCoverage",
        requiredLayers: required,
        completedLayers: completed,
        missingLayers: missing,
        coverageComplete: missing.length === 0,
        immutable: true,
    });
}
