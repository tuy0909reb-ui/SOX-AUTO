/**
 * ASA Minimum Runtime v0.1.3
 * Assisted Loop Narrow: Design Registration Assist + Draft + Confirm → RecordCommitAPI
 *
 * Not an Architecture chapter. No decision / trading / AI authority.
 */

export * from "./models";
export * from "./hash";
export * from "./storage";
export * from "./history";
export * from "./verify";
export * from "./commit";
export * from "./templates";
export * from "./assist";
export * from "./cli";

export const ASA_MINIMUM_RUNTIME = Object.freeze({
    packageId: "asa_minimum_runtime",
    title: "ASA Minimum Runtime",
    version: "0.1.3",
    phase: "0.1.3-assisted-loop-narrow",
    recordContractVersion: "1.0",
    hashAlgorithm: "sha256",
    storageFormat: "json",
    historyFormat: "jsonl",
    supportsTemplates: true,
    supportsMetadata: true,
    supportsRecordCommitAPI: true,
    supportsHistoryAwareVerify: true,
    supportsAssistedLoopNarrow: true,
    supportsDesignRegistrationAssist: true,
    defaultDataRoot: "data/asa_minimum_runtime",
    classification: "Minimum Runtime Support",
    architectureAuthority: "NONE",
    decisionAuthority: "NONE",
    tradingAuthority: "NONE",
});
