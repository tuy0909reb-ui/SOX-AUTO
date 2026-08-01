/**
 * ASA-ARCH-47.0 — EvolutionRequest（analyzer input）
 */

import type { EvolutionRequestIdentity } from "../types";

export interface EvolutionRequest {
    readonly kind: "EvolutionRequest";
    readonly requestId: EvolutionRequestIdentity;
    readonly purpose: string;
    readonly proposedScope: readonly string[];
    readonly immutable: true;
    readonly doesNotApprove: true;
}

export function freezeEvolutionRequest(input: {
    requestId: EvolutionRequestIdentity;
    purpose: string;
    proposedScope: readonly string[];
}): EvolutionRequest {
    return Object.freeze({
        kind: "EvolutionRequest",
        requestId: input.requestId,
        purpose: input.purpose.trim(),
        proposedScope: Object.freeze([...input.proposedScope]),
        immutable: true,
        doesNotApprove: true,
    });
}
