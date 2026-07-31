/**
 * ASA-ARCH-45.0 — ExtensionLifecycleDeclarationContract
 * Lifecycle declaration reference only — not runtime execution state.
 */

import {
    LIFECYCLE_DECLARATION_STATES,
    LifecycleDeclarationState,
} from "../types";

export type LifecycleDeclarationAuthority = "HUMAN_ARCHITECT";

export interface ExtensionLifecycleDeclarationContract {
    readonly contractId: "ExtensionLifecycleDeclarationContract";
    readonly states: readonly LifecycleDeclarationState[];
    readonly lifecycleAuthority: LifecycleDeclarationAuthority;
    readonly isDeclarationDataOnly: true;
    readonly isNotRuntimeState: true;
    readonly forbidsActiveState: true;
    readonly forbidsActivate: true;
    readonly forbidsEnable: true;
    readonly forbidsRuntimeTransition: true;
}

export function freezeExtensionLifecycleDeclarationContract(): ExtensionLifecycleDeclarationContract {
    return Object.freeze({
        contractId: "ExtensionLifecycleDeclarationContract",
        states: LIFECYCLE_DECLARATION_STATES,
        lifecycleAuthority: "HUMAN_ARCHITECT",
        isDeclarationDataOnly: true,
        isNotRuntimeState: true,
        forbidsActiveState: true,
        forbidsActivate: true,
        forbidsEnable: true,
        forbidsRuntimeTransition: true,
    });
}
