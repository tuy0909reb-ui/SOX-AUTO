/**
 * ASA-ARCH-43.0 - Validation Rule Engine (Draft 0.7)
 *
 * Load / Execute / Generate Rule Result. No Decision Authority.
 */

import {
    evaluateValidationRules,
    freezeValidationRuleSet,
    type RuleEngineEvaluation,
    type RuleEvaluationRequest,
    type ValidationRuleSet,
} from "./ValidationRules";

export interface ValidationRuleEngineRole {
    readonly roleId: "VALIDATION_RULE_ENGINE";
    readonly loadsRuleDefinition: true;
    readonly executesValidationRule: true;
    readonly generatesRuleResult: true;
    readonly noDecisionAuthority: true;
}

export function freezeValidationRuleEngineRole(): ValidationRuleEngineRole {
    return Object.freeze({
        roleId: "VALIDATION_RULE_ENGINE" as const,
        loadsRuleDefinition: true as const,
        executesValidationRule: true as const,
        generatesRuleResult: true as const,
        noDecisionAuthority: true as const,
    });
}

export function loadValidationRuleSet(): ValidationRuleSet {
    return freezeValidationRuleSet();
}

export function executeValidationRules(
    request: RuleEvaluationRequest
): RuleEngineEvaluation {
    return evaluateValidationRules(request);
}
