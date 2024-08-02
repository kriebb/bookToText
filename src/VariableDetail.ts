export class VariableDetail {
    constructor(
        public optionName: string,
        public argumentName: string,
        public envVarName: string,
        public nestedPath?: string // Optional nested path
    ) { }

    getConfigPath(): string {
        return this.nestedPath ? this.nestedPath : this.optionName;
    }
}
