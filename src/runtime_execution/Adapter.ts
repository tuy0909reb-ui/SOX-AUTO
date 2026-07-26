import { ExternalRuntimeState } from "./types";

export interface Adapter {
    // Baseline により API は凍結されていないため、
    // ここでは責務のみを定義し、具体的なメソッドは実装側に委ねる。
}

export class DefaultAdapter implements Adapter {
    constructor(private readonly external: ExternalRuntimeState) {}

    project(): Readonly<ExternalRuntimeState> {
        return Object.freeze({ ...this.external });
    }
}
