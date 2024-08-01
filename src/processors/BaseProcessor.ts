export abstract class BaseProcessor {
    abstract process(): Promise<void>;
}