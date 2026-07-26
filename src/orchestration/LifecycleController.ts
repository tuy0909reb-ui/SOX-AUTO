import { LifecycleEvent, OrchestratorState } from "./types";

export class InvalidLifecycleTransitionError extends Error {
    constructor(
        public readonly from: OrchestratorState,
        public readonly event: LifecycleEvent
    ) {
        super(`Invalid lifecycle transition: ${from} + ${event}`);
        this.name = "InvalidLifecycleTransitionError";
    }
}

/**
 * Sole gateway for Orchestrator state transitions.
 * Failures affecting Orchestrator state MUST go through this controller.
 */
export class LifecycleController {
    private _state: OrchestratorState = "Created";

    get state(): OrchestratorState {
        return this._state;
    }

    transition(event: LifecycleEvent): OrchestratorState {
        const next = this.resolve(this._state, event);
        if (next === null) {
            throw new InvalidLifecycleTransitionError(this._state, event);
        }
        this._state = next;
        return this._state;
    }

    /** Idempotent shutdown helper — second call leaves state unchanged. */
    shutdown(): OrchestratorState {
        if (this._state === "Shutdown") {
            return this._state;
        }
        if (this._state === "Created") {
            // Created may go Failed path only via initialize failure; allow direct shutdown.
            this._state = "Shutdown";
            return this._state;
        }
        return this.transition("SHUTDOWN");
    }

    canInitialize(): boolean {
        return this._state === "Created";
    }

    canExecute(): boolean {
        return this._state === "Ready";
    }

    private resolve(state: OrchestratorState, event: LifecycleEvent): OrchestratorState | null {
        switch (event) {
            case "INITIALIZE_SUCCESS":
                // Created → Initialized (Ready follows via MARK_READY)
                if (state === "Created") return "Initialized";
                return null;
            case "MARK_READY":
                if (state === "Initialized") return "Ready";
                return null;
            case "INITIALIZE_FAILURE":
                if (state === "Created" || state === "Initialized") return "Failed";
                return null;
            case "START_EXECUTE":
                if (state === "Ready") return "Running";
                return null;
            case "COMPLETE":
                if (state === "Running") return "Completed";
                return null;
            case "FAIL":
                if (state === "Running" || state === "Ready" || state === "Initialized") {
                    return "Failed";
                }
                if (state === "Created") return "Failed";
                return null;
            case "SHUTDOWN":
                if (
                    state === "Initialized" ||
                    state === "Ready" ||
                    state === "Running" ||
                    state === "Completed" ||
                    state === "Failed"
                ) {
                    return "Shutdown";
                }
                if (state === "Shutdown") return "Shutdown";
                return null;
            default:
                return null;
        }
    }
}
