/**
 * ASA-ARCH-37.0 - Data Transformation Contract (Draft 0.3)
 *
 * Data conversion only — External Format → ASA Compatible Format.
 * No business / policy / execution decisions.
 */

/**
 * Data Transformation Contract.
 */
export interface DataTransformationContract {
    readonly transformationId: string;
    readonly responsibility: "DATA_CONVERSION";
    readonly pipeline: ReadonlyArray<
        | "EXTERNAL_FORMAT"
        | "TRANSFORMATION"
        | "OUTPUT_VALIDATION"
        | "ASA_COMPATIBLE_FORMAT"
    >;
    readonly forbidsBusinessDecision: true;
    readonly forbidsPolicyDecision: true;
    readonly forbidsExecutionDecision: true;
}

export function freezeDataTransformationContract(
    contract: DataTransformationContract
): DataTransformationContract {
    return Object.freeze({
        ...contract,
        pipeline: Object.freeze([...contract.pipeline]),
    });
}
