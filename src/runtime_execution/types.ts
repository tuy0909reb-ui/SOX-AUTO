export interface ExternalRuntimeState {
    // External Runtime の読み取り専用状態
    // 具体的な構造は既存 Runtime に依存するためここでは抽象化する
}

export interface ExecutionInternalState {
    // Execution Layer 内部状態
    // Engine により更新されるが、意味論は保持される
}
