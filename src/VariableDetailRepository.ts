import { injectable } from 'tsyringe';
import * as fs from 'fs';
import { VariableDetail } from './VariableDetail';

@injectable()
export class VariableDetailRepository {
    private variableDetails: VariableDetail[] = [];

    constructor(mappingFilePath: string) {
        this.loadVariableDetails(mappingFilePath);
    }

    private loadVariableDetails(mappingFilePath: string): void {
        const data = fs.readFileSync(mappingFilePath, 'utf-8');
        const json = JSON.parse(data);
        this.variableDetails = json.map((item: any) => new VariableDetail(
            item.optionName,
            item.argumentName,
            item.envVarName,
            item.nestedPath
        ));
    }

    getAll(): VariableDetail[] {
        return this.variableDetails;
    }
}


