/**
 * ASA-ARCH-45.0 — ExtensionLifecycleDeclarationModel
 * Immutable declaration-state model. Not runtime execution state.
 */

import type { ExtensionLifecycleDeclarationContract } from "../contracts";
import {
    LIFECYCLE_DECLARATION_STATES,
    LifecycleDeclarationState,
} from "../types";

export interface ExtensionLifecycleDeclarationModel {
    readonly representsContract: "ExtensionLifecycleDeclarationContract";
    readonly declarationState: LifecycleDeclarationState;
    readonly allowedStates: readonly LifecycleDeclarationState[];
    readonly lifecycleAuthority: "HUMAN_ARCHITECT";
    readonly isDeclarationDataOnly: true;
    readonly isNotRuntimeState: true;
    readonly forbidsActiveState: true;
    readonly forbidsActivate: true;
    readonly forbidsEnable: true;
    readonly forbidsRuntimeTransition: true;
    readonly immutable: true;
}

export function freezeExtensionLifecycleDeclarationModel(input: {
    declarationState: LifecycleDeclarationState;
}): ExtensionLifecycleDeclarationModel {
    if (!LIFECYCLE_DECLARATION_STATES.includes(input.declarationState)) {
        throw new Error(
            `Invalid LifecycleDeclarationState: ${input.declarationState}`
        );
    }
    return Object.freeze({
        representsContract: "ExtensionLifecycleDeclarationContract",
        declarationState: input.declarationState,
        allowedStates: LIFECYCLE_DECLARATION_STATES,
        lifecycleAuthority: "HUMAN_ARCHITECT",
        isDeclarationDataOnly: true,
        isNotRuntimeState: true,
        forbidsActiveState: true,
        forbidsActivate: true,
        forbidsEnable: true,
        forbidsRuntimeTransition: true,
        immutable: true,
    });
}

export function lifecycleDeclarationModelFromContract(
    contract: ExtensionLifecycleDeclarationContract,
    declarationState: LifecycleDeclarationState
): ExtensionLifecycleDeclarationModel {
    if (!contract.states.includes(declarationState)) {
        throw new Error(
            "declarationState must be within ExtensionLifecycleDeclarationContract states"
        );
    }
    return freezeExtensionLifecycleDeclarationModel({ declarationState });
}
