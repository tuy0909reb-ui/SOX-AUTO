/**
 * ASA-ARCH-36.0 - ASA-OPS Audit Layer (Draft 0.4)
 *
 * Declarative Operational Accountability Record contract.
 * Audit records are immutable; not an audit engine.
 */

/**
 * Audit record field requirements (Who / What / When / Why + result).
 */
export interface OpsAuditRecordFields {
    readonly decisionAuthority: true;
    readonly decisionSource: true;
    readonly who: true;
    readonly what: true;
    readonly when: true;
    readonly why: true;
    readonly executionResult: true;
}

/**
 * Audit Layer Contract.
 */
export interface OpsAuditContract {
    readonly auditId: string;
    readonly responsibility: "OPERATIONAL_ACCOUNTABILITY_RECORD";
    readonly purpose: "REPRODUCE_STATE";
    readonly immutableRecord: true;
    readonly requiredFields: OpsAuditRecordFields;
}

export function freezeOpsAuditContract(
    contract: OpsAuditContract
): OpsAuditContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze({ ...contract.requiredFields }),
    });
}
