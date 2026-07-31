/**
 * ASA-ARCH-35.0 - Extension Governance Layer model (Draft 0.3)
 *
 * Immutable declarative governance layer.
 *
 * Establishes Extension Boundary Contract and domain governance declarations
 * after Frozen ASA Core (ARCH-34.0). Does NOT mutate Core.
 *
 * SHALL NOT contain planning, selection, discovery, resolution,
 * scheduling, or runtime semantics.
 */

import {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionGovernanceLayerIdentity,
    ExtensionGovernanceLayerMetadata,
    ExtensionGovernanceLayerProps,
    ExtensionRegressionBoundary,
} from "./ExtensionGovernanceTypes";

/**
 * Immutable Extension Governance Layer.
 * All fields are readonly; instances are Object.freeze'd at establishment.
 */
export class ExtensionGovernanceLayer
    implements ExtensionGovernanceLayerProps
{
    readonly identity: ExtensionGovernanceLayerIdentity;
    readonly metadata: ExtensionGovernanceLayerMetadata;
    readonly extensionBoundaryContract: ExtensionBoundaryContract;
    readonly extensionDescriptors: ReadonlyArray<ExtensionDescriptor>;
    readonly compatibilityMatrix: ReadonlyArray<ExtensionCompatibilityMatrixEntry>;
    readonly regressionBoundary: ExtensionRegressionBoundary;

    /**
     * Package-internal constructor.
     * Prefer ExtensionGovernanceBuilder.establish().
     */
    constructor(init: ExtensionGovernanceLayerProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.extensionBoundaryContract = Object.freeze({
            ...init.extensionBoundaryContract,
            permittedOperationIds: Object.freeze([
                ...init.extensionBoundaryContract.permittedOperationIds,
            ]),
        });
        this.extensionDescriptors = Object.freeze(
            init.extensionDescriptors.map((d) =>
                Object.freeze({
                    ...d,
                    compatibility: Object.freeze({
                        ...d.compatibility,
                        compatibleExtensionIds: Object.freeze([
                            ...d.compatibility.compatibleExtensionIds,
                        ]),
                    }),
                    dependency: Object.freeze([...d.dependency]),
                })
            )
        );
        this.compatibilityMatrix = Object.freeze(
            init.compatibilityMatrix.map((e) => Object.freeze({ ...e }))
        );
        this.regressionBoundary = Object.freeze({
            ...init.regressionBoundary,
        });
        Object.freeze(this);
    }
}
