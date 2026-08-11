/**
 * ASA Minimum Runtime v0.1.1 — Record Templates
 * Recommended fields only. No decision / evidence evaluation.
 */

export type RecordTemplateId =
    | "architecture_record"
    | "implementation_record"
    | "verification_record"
    | "decision_record";

export interface RecordTemplate {
    readonly id: RecordTemplateId;
    readonly defaultType: string;
    readonly title: string;
    readonly requiredFields: readonly string[];
    readonly recommendedFields: readonly string[];
    readonly description: string;
}

export const RECORD_TEMPLATES: readonly RecordTemplate[] = Object.freeze([
    Object.freeze({
        id: "architecture_record",
        defaultType: "Architecture Record",
        title: "Architecture Record",
        requiredFields: Object.freeze(["title", "content", "evidence"]),
        recommendedFields: Object.freeze([
            "title",
            "content",
            "evidence",
            "tags",
            "source",
        ]),
        description:
            "Record architecture decisions, milestones, and frozen states.",
    }),
    Object.freeze({
        id: "implementation_record",
        defaultType: "Implementation Record",
        title: "Implementation Record",
        requiredFields: Object.freeze(["title", "content", "evidence"]),
        recommendedFields: Object.freeze([
            "title",
            "content",
            "evidence",
            "tags",
            "relatedRecords",
        ]),
        description: "Record implementation activities and phase outcomes.",
    }),
    Object.freeze({
        id: "verification_record",
        defaultType: "Verification Record",
        title: "Verification Record",
        requiredFields: Object.freeze(["title", "content", "evidence"]),
        recommendedFields: Object.freeze([
            "title",
            "content",
            "evidence",
            "tags",
            "source",
            "relatedRecords",
        ]),
        description:
            "Record verification results（target / method / criteria / result in content）.",
    }),
    Object.freeze({
        id: "decision_record",
        defaultType: "Decision Record",
        title: "Decision Record",
        requiredFields: Object.freeze(["title", "content", "evidence"]),
        recommendedFields: Object.freeze([
            "title",
            "content",
            "evidence",
            "tags",
            "relatedRecords",
        ]),
        description:
            "Record important human decisions（decision + rationale in content）.",
    }),
]);

export function listRecordTemplates(): readonly RecordTemplate[] {
    return RECORD_TEMPLATES;
}

export function getRecordTemplate(
    id: string
): RecordTemplate | undefined {
    return RECORD_TEMPLATES.find((t) => t.id === id);
}

export interface TemplateFieldValues {
    readonly title?: string;
    readonly content?: string;
    readonly evidence?: readonly string[];
}

/**
 * Returns missing required field names for the selected template.
 * Does not evaluate evidence quality.
 */
export function missingTemplateFields(
    template: RecordTemplate,
    values: TemplateFieldValues
): string[] {
    const missing: string[] = [];
    for (const field of template.requiredFields) {
        if (field === "title" && !values.title?.trim()) missing.push("title");
        if (field === "content" && !values.content?.trim()) {
            missing.push("content");
        }
        if (
            field === "evidence" &&
            (!values.evidence || values.evidence.length === 0)
        ) {
            missing.push("evidence");
        }
    }
    return missing;
}

export function formatTemplateGuidance(template: RecordTemplate): string {
    return [
        `template: ${template.id}`,
        `defaultType: ${template.defaultType}`,
        `description: ${template.description}`,
        `required: ${template.requiredFields.join(", ")}`,
        `recommended: ${template.recommendedFields.join(", ")}`,
    ].join("\n");
}
