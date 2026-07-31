/**
 * ASA-ARCH-39.0 - Assurance Evidence Contract (Draft 0.4)
 *
 * Evidence is referenced and traceable. Validator cannot fabricate evidence.
 */

/** Required AssuranceEvidence fields. */
export type AssuranceEvidenceField =
    | "source"
    | "reference"
    | "timestamp"
    | "integrityHash"
    | "verificationMethod";

/**
 * Assurance Evidence Contract — schema + integrity rules.
 */
export interface AssuranceEvidenceContract {
    readonly evidenceContractId: string;
    readonly requiredFields: ReadonlyArray<AssuranceEvidenceField>;
    readonly evidenceMustRemainTraceable: true;
    readonly forbidsFabricationByValidator: true;
    readonly evidenceOriginMustBePreserved: true;
    readonly mayTransformRepresentationOnly: true;
    readonly forbidsAlterEvidenceOrigin: true;
}

export function freezeAssuranceEvidenceContract(
    contract: AssuranceEvidenceContract
): AssuranceEvidenceContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}
