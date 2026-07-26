import { ExecutionLayerInput } from "./ExecutionLayerInput";
import { DefaultExecutionContext } from "./ExecutionContext";

export interface ExecutionEngine {
    execute(context: DefaultExecutionContext, input: ExecutionLayerInput): unknown;
}

export class DefaultExecutionEngine implements ExecutionEngine {
    execute(context: DefaultExecutionContext, input: ExecutionLayerInput): unknown {
        void input; // 現時点では未使用であることを明示
        return context; // 契約どおり「同じ context を返す」
    }
}