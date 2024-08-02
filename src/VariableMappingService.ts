import { injectable } from 'tsyringe';
import { VariableDetailRepository } from './VariableDetailRepository';
import { VariableMapping } from './VariableMapping';

@injectable()
export class VariableMappingService implements Extracted {
    private variableDetailRepository: VariableDetailRepository;

    constructor(variableDetailRepository: VariableDetailRepository) {
        this.variableDetailRepository = variableDetailRepository;
    }

    buildVariableMapping(): VariableMapping {
        const mapping: VariableMapping = {};
        const variableDetails = this.variableDetailRepository.getAll();
        variableDetails.forEach(detail => {
            const configPath = detail.getConfigPath();
            mapping[detail.optionName] = [
                { source: configPath, type: 'config.json' },
                { source: detail.argumentName, type: 'argument' },
                { source: detail.envVarName, type: 'environment variable' }
            ];
        });
        return mapping;
    }
}

interface Extracted {
    buildVariableMapping(): VariableMapping;
}
