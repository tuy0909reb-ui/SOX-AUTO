import { AsaOpsLayer } from "../../../src/extensions/asa_ops/AsaOpsLayer";
import { baseOpsValidator } from "./opsFixtures";

describe("ASA-ARCH-36.0 — AsaOpsLayer", () => {
    test("layer holds Observability contracts without execution authority", () => {
        const layer = baseOpsValidator().establish();
        expect(layer).toBeInstanceOf(AsaOpsLayer);
        expect(layer.securityBoundary.holdsExecutionAuthority).toBe(false);
        expect(layer.securityBoundary.holdsPolicyAuthority).toBe(false);
        expect(layer.securityBoundary.accessMode).toBe("READ_ONLY_FIRST");
        expect(layer.health.forbidsExecutionPermissionChange).toBe(true);
        expect(layer.executionTrace.forbidsExecutionControl).toBe(true);
        expect(layer.reporting.forbidsRuntimeStateMutation).toBe(true);
        expect(layer.audit.immutableRecord).toBe(true);
        expect(layer.logging.recordShape.immutableRecord).toBe(true);
        expect(layer.observation.observationOnly).toBe(true);
    });

    test("interaction requires Boundary Contract path", () => {
        const layer = baseOpsValidator().establish();
        expect(layer.interactionContract.requiresBoundaryContract).toBe(true);
        expect(layer.interactionContract.forbidsCoreInternalMutation).toBe(
            true
        );
        expect(
            layer.interactionContract.forbidsDirectExtensionInternalAccess
        ).toBe(true);
        expect(layer.interactionContract.permitsAiAuditRequest).toBe(true);
        expect(layer.interactionContract.permitsConnectEventNotification).toBe(
            true
        );
        expect(layer.interactionContract.permitsSelfObservation).toBe(true);
    });
});
