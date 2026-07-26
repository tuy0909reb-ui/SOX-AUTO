import {
    ErrorRecord,
    EventRecord,
    NodeID,
    OrchestrationSnapshot,
    OrchestratorState,
} from "./types";

/**
 * OrchestrationContext — only Orchestrator / ResultCollector (via Orchestrator ownership path)
 * may mutate. Snapshot SHALL NOT reference mutable internal state.
 */
export class OrchestrationContext {
    private _state: OrchestratorState = "Created";
    private readonly _events: EventRecord[] = [];
    private readonly _errors: ErrorRecord[] = [];
    private readonly _completedNodes: NodeID[] = [];
    readonly startTime: number;
    private _endTime?: number;

    constructor(startTime: number = Date.now()) {
        this.startTime = startTime;
    }

    get state(): OrchestratorState {
        return this._state;
    }

    get events(): readonly EventRecord[] {
        return this._events;
    }

    get errors(): readonly ErrorRecord[] {
        return this._errors;
    }

    get completedNodes(): readonly NodeID[] {
        return this._completedNodes;
    }

    get endTime(): number | undefined {
        return this._endTime;
    }

    /** Internal mutation API — callers must be Orchestrator ownership path. */
    setState(state: OrchestratorState): void {
        this._state = state;
        if (state === "Completed" || state === "Failed" || state === "Shutdown") {
            this._endTime = Date.now();
        }
    }

    appendEvent(event: EventRecord): void {
        this._events.push(event);
    }

    appendError(error: ErrorRecord): void {
        this._errors.push(error);
    }

    markCompleted(nodeId: NodeID): void {
        if (!this._completedNodes.includes(nodeId)) {
            this._completedNodes.push(nodeId);
        }
    }

    snapshot(): OrchestrationSnapshot {
        return Object.freeze({
            state: this._state,
            events: Object.freeze(this._events.map((e) => Object.freeze({ ...e }))),
            errors: Object.freeze(this._errors.map((e) => Object.freeze({ ...e }))),
            startTime: this.startTime,
            endTime: this._endTime,
            completedNodes: Object.freeze([...this._completedNodes]),
        });
    }
}
