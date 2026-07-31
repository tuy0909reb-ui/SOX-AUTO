import { AsaConnectLayer } from "../../../src/extensions/asa_connect/AsaConnectLayer";
import { baseConnectValidator } from "./connectFixtures";

describe("ASA-ARCH-37.0 — AsaConnectLayer", () => {
    test("layer holds boundary contracts without execution authority", () => {
        const layer = baseConnectValidator().establish();
        expect(layer).toBeInstanceOf(AsaConnectLayer);
        expect(layer.securityBoundary.holdsExecutionAuthority).toBe(false);
        expect(layer.securityBoundary.holdsDecisionAuthority).toBe(false);
        expect(layer.securityBoundary.holdsPolicyAuthority).toBe(false);
        expect(layer.capabilitySeparation.connectorIsNotCapability).toBe(true);
        expect(
            layer.capabilitySeparation.forbidsConnectorCapabilityOwnership
        ).toBe(true);
        expect(layer.authentication.forbidsSecretToCoreContract).toBe(true);
        expect(layer.authentication.forbidsSecretToExtensionOutput).toBe(true);
        expect(layer.secretProtection.isNotSecretOwnership).toBe(true);
        expect(layer.requestGuard.authorityMode).toBe(
            "OBSERVATION_VALIDATION_ONLY"
        );
        expect(layer.outboundBoundary.forbidsCoreDirectExternalAccess).toBe(
            true
        );
    });

    test("external data trust and transformation contracts", () => {
        const layer = baseConnectValidator().establish();
        expect(layer.externalData.treatsExternalDataAsUntrusted).toBe(true);
        expect(layer.externalData.validationBeforeTrust).toBe(true);
        expect(layer.transformation.responsibility).toBe("DATA_CONVERSION");
        expect(layer.transformation.forbidsBusinessDecision).toBe(true);
        expect(layer.router.isNotDecisionLayer).toBe(true);
        expect(layer.errorContract.classifications).toEqual(
            expect.arrayContaining([
                "TRANSIENT_ERROR",
                "PERMANENT_ERROR",
                "SECURITY_ERROR",
                "VALIDATION_ERROR",
            ])
        );
        expect(layer.connectors).toHaveLength(4);
    });
});
