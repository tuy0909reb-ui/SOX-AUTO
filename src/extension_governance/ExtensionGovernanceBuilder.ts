/**
 * ASA-ARCH-35.0 - Extension Governance Builder (Draft 0.3)
 *
 * Establishes the immutable Extension Governance Layer.
 * Does NOT mutate Frozen Core or create runtime / execution adapters.
 *
 * Performs structural governance validation only.
 */

import { ExtensionGovernanceLayer } from "./ExtensionGovernanceLayer";
import type {
    ExtensionAuthorityLevel,
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionDomainKind,
    ExtensionGovernanceLayerMetadata,
    ExtensionId,
    ExtensionRegressionBoundary,
} from "./ExtensionGovernanceTypes";

const FORBIDDEN_AUTHORITY = "ADMINISTRATOR";
const REQUIRED_CORE_VERSION = "ASA-CORE-34.0";
const EXTENSION_ID_PATTERN = /^ASA-[A-Z][A-Z0-9-]*$/;

/**
 * Structural builder that establishes the Extension Governance Layer.
 *
 * Temporary builder fields exist only during establishment of a single layer.
 * No global mutable state, shared instance registry, DI container, or side effects.
 */
export class ExtensionGovernanceBuilder {
    private governanceLayerId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private boundaryContract: ExtensionBoundaryContract | undefined;
    private extensionDescriptors: ExtensionDescriptor[] = [];
    private compatibilityMatrix: ExtensionCompatibilityMatrixEntry[] = [];
    private regressionBoundary: ExtensionRegressionBoundary | undefined;

    withGovernanceLayerId(governanceLayerId: string): this {
        this.governanceLayerId = governanceLayerId;
        return this;
    }

    withArchitectureVersion(architectureVersion: string): this {
        this.architectureVersion = architectureVersion;
        return this;
    }

    withStructuralVersion(structuralVersion: string): this {
        this.structuralVersion = structuralVersion;
        return this;
    }

    withSchemaVersion(schemaVersion: string): this {
        this.schemaVersion = schemaVersion;
        return this;
    }

    withCreationTimestamp(creationTimestamp: string): this {
        this.creationTimestamp = creationTimestamp;
        return this;
    }

    withProducerIdentity(producerIdentity: string): this {
        this.producerIdentity = producerIdentity;
        return this;
    }

    withExtensionBoundaryContract(
        boundaryContract: ExtensionBoundaryContract
    ): this {
        this.boundaryContract = { ...boundaryContract };
        return this;
    }

    withExtensionDescriptors(
        extensionDescriptors: ReadonlyArray<ExtensionDescriptor>
    ): this {
        this.extensionDescriptors = extensionDescriptors.map((d) => ({
            ...d,
            compatibility: {
                ...d.compatibility,
                compatibleExtensionIds: [
                    ...d.compatibility.compatibleExtensionIds,
                ],
            },
            dependency: [...d.dependency],
        }));
        return this;
    }

    withCompatibilityMatrix(
        compatibilityMatrix: ReadonlyArray<ExtensionCompatibilityMatrixEntry>
    ): this {
        this.compatibilityMatrix = compatibilityMatrix.map((e) => ({ ...e }));
        return this;
    }

    withRegressionBoundary(
        regressionBoundary: ExtensionRegressionBoundary
    ): this {
        this.regressionBoundary = { ...regressionBoundary };
        return this;
    }

    /**
     * Establishes the immutable Extension Governance Layer after structural validation.
     */
    establish(): ExtensionGovernanceLayer {
        const governanceLayerId = this.requireNonEmpty(
            this.governanceLayerId,
            "governanceLayerId"
        );
        const architectureVersion = this.requireNonEmpty(
            this.architectureVersion,
            "architectureVersion"
        );
        const structuralVersion = this.requireNonEmpty(
            this.structuralVersion,
            "structuralVersion"
        );
        const schemaVersion = this.requireNonEmpty(
            this.schemaVersion,
            "schemaVersion"
        );

        if (!this.boundaryContract) {
            throw new Error(
                "ExtensionGovernance establishment failed: Extension Boundary Contract is required"
            );
        }

        const contract = this.boundaryContract;
        this.requireNonEmpty(contract.contractId, "boundaryContract.contractId");
        this.requireNonEmpty(
            contract.coreVersion,
            "boundaryContract.coreVersion"
        );
        this.requireNonEmpty(
            contract.architectureVersion,
            "boundaryContract.architectureVersion"
        );
        this.requireNonEmpty(
            contract.structuralVersion,
            "boundaryContract.structuralVersion"
        );

        if (contract.coreVersion !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ExtensionGovernance establishment failed: Extension Boundary Contract must preserve ASA-CORE-34.0"
            );
        }

        if (contract.isolation !== true) {
            throw new Error(
                "ExtensionGovernance establishment failed: Extension Boundary Contract isolation is required"
            );
        }

        if (contract.forbidsDirectCoreMutation !== true) {
            throw new Error(
                "ExtensionGovernance establishment failed: forbidsDirectCoreMutation must be true"
            );
        }

        if (contract.forbidsAdministratorAuthority !== true) {
            throw new Error(
                "ExtensionGovernance establishment failed: forbidsAdministratorAuthority must be true"
            );
        }

        if (
            !contract.permittedOperationIds ||
            contract.permittedOperationIds.length === 0
        ) {
            throw new Error(
                "ExtensionGovernance establishment failed: permittedOperationIds are required"
            );
        }

        for (let i = 0; i < contract.permittedOperationIds.length; i++) {
            this.requireNonEmpty(
                contract.permittedOperationIds[i],
                `boundaryContract.permittedOperationIds[${i}]`
            );
        }

        if (this.extensionDescriptors.length === 0) {
            throw new Error(
                "ExtensionGovernance establishment failed: at least one Extension Descriptor is required"
            );
        }

        const seenIds = new Set<string>();
        for (let i = 0; i < this.extensionDescriptors.length; i++) {
            this.validateDescriptor(this.extensionDescriptors[i], i, seenIds);
        }

        if (this.compatibilityMatrix.length === 0) {
            throw new Error(
                "ExtensionGovernance establishment failed: Compatibility Matrix is required"
            );
        }

        for (let i = 0; i < this.compatibilityMatrix.length; i++) {
            const entry = this.compatibilityMatrix[i];
            this.requireNonEmpty(
                entry.coreVersion,
                `compatibilityMatrix[${i}].coreVersion`
            );
            this.requireNonEmpty(
                entry.extensionId,
                `compatibilityMatrix[${i}].extensionId`
            );
            this.requireNonEmpty(
                entry.extensionVersionRange,
                `compatibilityMatrix[${i}].extensionVersionRange`
            );
            this.requireNonEmpty(
                entry.contractVersion,
                `compatibilityMatrix[${i}].contractVersion`
            );
            if (entry.coreVersion !== REQUIRED_CORE_VERSION) {
                throw new Error(
                    "ExtensionGovernance establishment failed: Compatibility Matrix must target ASA-CORE-34.0"
                );
            }
            if (!EXTENSION_ID_PATTERN.test(entry.extensionId)) {
                throw new Error(
                    "ExtensionGovernance establishment failed: invalid Extension Identifier Contract"
                );
            }
        }

        if (!this.regressionBoundary) {
            throw new Error(
                "ExtensionGovernance establishment failed: Regression Boundary is required"
            );
        }

        const regression = this.regressionBoundary;
        if (
            regression.coreRegressionRequired !== true ||
            regression.extensionRegressionRequired !== true ||
            regression.integrationRegressionRequired !== true ||
            regression.isolationRegressionRequired !== true
        ) {
            throw new Error(
                "ExtensionGovernance establishment failed: all Regression Boundary flags must be true"
            );
        }

        const metadata: ExtensionGovernanceLayerMetadata = Object.freeze({
            architectureVersion,
            schemaVersion,
            governanceStatus: "established" as const,
            corePreservationRequired: true as const,
            ...(this.creationTimestamp !== undefined
                ? { creationTimestamp: this.creationTimestamp }
                : {}),
            ...(this.producerIdentity !== undefined
                ? { producerIdentity: this.producerIdentity }
                : {}),
        });

        return new ExtensionGovernanceLayer({
            identity: Object.freeze({
                governanceLayerId,
                coreVersion: REQUIRED_CORE_VERSION,
                architectureVersion,
                structuralVersion,
            }),
            metadata,
            extensionBoundaryContract: contract,
            extensionDescriptors: this.extensionDescriptors,
            compatibilityMatrix: this.compatibilityMatrix,
            regressionBoundary: regression,
        });
    }

    private validateDescriptor(
        descriptor: ExtensionDescriptor,
        index: number,
        seenIds: Set<string>
    ): void {
        this.requireNonEmpty(descriptor.id, `extensionDescriptors[${index}].id`);
        if (!EXTENSION_ID_PATTERN.test(descriptor.id)) {
            throw new Error(
                "ExtensionGovernance establishment failed: invalid Extension Identifier Contract"
            );
        }
        if (seenIds.has(descriptor.id)) {
            throw new Error(
                "ExtensionGovernance establishment failed: duplicate Extension Identifier"
            );
        }
        seenIds.add(descriptor.id);

        this.requireNonEmpty(
            descriptor.version,
            `extensionDescriptors[${index}].version`
        );
        this.requireNonEmpty(
            descriptor.contract,
            `extensionDescriptors[${index}].contract`
        );
        this.requireDomain(
            descriptor.domain,
            `extensionDescriptors[${index}].domain`
        );
        this.requireAuthority(
            descriptor.authority,
            `extensionDescriptors[${index}].authority`
        );

        if (descriptor.isolation !== true) {
            throw new Error(
                "ExtensionGovernance establishment failed: Extension isolation must be true"
            );
        }

        if (
            (descriptor.authority as string) === FORBIDDEN_AUTHORITY
        ) {
            throw new Error(
                "ExtensionGovernance establishment failed: ADMINISTRATOR authority is forbidden"
            );
        }

        // AI Restriction Contract: ASA-AI must not hold EXECUTOR authority.
        if (descriptor.id === "ASA-AI" && descriptor.authority === "EXECUTOR") {
            throw new Error(
                "ExtensionGovernance establishment failed: AI Authority Restriction — ASA-AI must not hold EXECUTOR"
            );
        }

        if (descriptor.compatibility.coreVersion !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ExtensionGovernance establishment failed: Extension compatibility must preserve ASA-CORE-34.0"
            );
        }

        this.requireNonEmpty(
            descriptor.compatibility.contractVersion,
            `extensionDescriptors[${index}].compatibility.contractVersion`
        );

        if (!descriptor.lifecycle) {
            throw new Error(
                `ExtensionGovernance establishment failed: extensionDescriptors[${index}].lifecycle is required`
            );
        }
    }

    private requireDomain(
        domain: ExtensionDomainKind | undefined,
        field: string
    ): void {
        if (
            domain !== "OPS" &&
            domain !== "AI" &&
            domain !== "CONNECT"
        ) {
            throw new Error(
                `ExtensionGovernance establishment failed: ${field} must be OPS | AI | CONNECT`
            );
        }
    }

    private requireAuthority(
        authority: ExtensionAuthorityLevel | undefined,
        field: string
    ): void {
        if (
            authority !== "OBSERVER" &&
            authority !== "ADVISOR" &&
            authority !== "REQUESTER" &&
            authority !== "EXECUTOR"
        ) {
            throw new Error(
                `ExtensionGovernance establishment failed: ${field} must be OBSERVER | ADVISOR | REQUESTER | EXECUTOR`
            );
        }
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ExtensionGovernance establishment failed: ${field} is required`
            );
        }
        return value;
    }
}

/** Helper for tests / callers constructing ASA-{DOMAIN} identifiers. */
export function formatExtensionId(domain: ExtensionDomainKind): ExtensionId {
    return `ASA-${domain}`;
}
