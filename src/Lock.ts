import { injectable } from "tsyringe";
import {Logger} from "./logger";

@injectable()
export class Lock {
    constructor(private logger:Logger) {
    }
    private _promise: Promise<void> | null = null;
    private _resolve: (() => void) | null = null;

    async acquire(): Promise<void> {
        this.logger.debug("Acquiring lock");
        while (this._promise) {
            await this._promise;
        }
        this._promise = new Promise<void>(resolve => {
            this._resolve = resolve;
        });
    }

    release(): void {
        this.logger.debug("Releasing lock");
        if (this._resolve) {
            this._resolve();
            this._promise = null;
            this._resolve = null;
        }
    }
}