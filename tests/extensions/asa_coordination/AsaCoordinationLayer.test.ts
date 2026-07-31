import { baseCoordinationValidator } from "./coordinationFixtures";

describe("ASA-ARCH-40.0 — AsaCoordinationLayer", () => {
    test("exposes coordination operations and non-execution result model", () => {
        const layer = baseCoordinationValidator().establish();
        expect(layer.coordinationContract.operations).toEqual(
            expect.arrayContaining([
                "coordinate",
                "resolveContractReference",
                "orderInteraction",
                "compose",
                "aggregate",
                "report",
            ])
        );
        expect(layer.coordinationContract.forbidsExecute).toBe(true);
        expect(layer.resultContract.allowedStatuses).toEqual(
            expect.arrayContaining([
                "STRUCTURED",
                "PARTIAL",
                "INCOMPLETE",
                "UNKNOWN",
            ])
        );
        expect(
            layer.resultContract.structuredDoesNotMeanExecutionCompleted
        ).toBe(true);
        expect(layer.confidenceContract.confidenceIsNotAuthority).toBe(true);
        expect(layer.providerRole.isNotExecutionProvider).toBe(true);
    });

    test("enforces coordination / AI / validation / memory boundaries", () => {
        const layer = baseCoordinationValidator().establish();
        expect(layer.planContract.planIsNotExecutionPlan).toBe(true);
        expect(layer.outputBoundary.forbidsExecutionCommand).toBe(true);
        expect(layer.aiBoundary.forbidsBecomeAiAuthority).toBe(true);
        expect(layer.validationBoundary.integrationIsReadOnly).toBe(true);
        expect(
            layer.validationBoundary.validationResultIsNotCoordinationControl
        ).toBe(true);
        expect(layer.memoryContract.memoryIsNotCoreState).toBe(true);
        expect(layer.memoryContract.ownershipExplicitlyDeclared).toBe(true);
        expect(layer.memoryContract.retentionDoesNotCreateAuthority).toBe(true);
        expect(
            layer.selfCoordinationRestriction.forbidsApproveOwnAuthority
        ).toBe(true);
        expect(
            layer.humanAuthorityBoundary.coordinatorCannotBecomeDecisionAuthority
        ).toBe(true);
        expect(
            layer.participationBoundary
                .referencesOpsConnectAiValidationViaDeclaredContractsOnly
        ).toBe(true);
    });

    test("lifecycle and registration surfaces are structural", () => {
        const layer = baseCoordinationValidator().establish();
        expect(layer.lifecycleContract.allowedStates).toEqual([
            "Created",
            "Initialized",
            "Active",
            "Failed",
            "Suspended",
            "Reinitialized",
            "Terminated",
        ]);
        expect(layer.coordinatorRegistration.authorityMustBeCoordinator).toBe(
            true
        );
        expect(
            layer.coordinatorRegistration.registrationDoesNotGrantOperationalAuthority
        ).toBe(true);
        expect(layer.coordinatorDiscovery.returnsMetadataReferencesOnly).toBe(
            true
        );
        expect(layer.coordinatorSelection.producesRecommendationOnly).toBe(true);
        expect(layer.fallbackStrategy.manualModePreservesHumanAuthority).toBe(
            true
        );
        expect(layer.determinismPolicy.requiredMetadata).toEqual(
            expect.arrayContaining([
                "coordinatorVersion",
                "contractVersion",
                "participantVersion",
                "interactionVersion",
                "contractResolutionVersion",
                "orderingRuleVersion",
                "environmentVersion",
                "configurationVersion",
                "timestamp",
            ])
        );
        expect(layer.securityContract.forbidsForgeCoordinationContext).toBe(
            true
        );
    });
});
