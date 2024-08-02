
export interface VariableMapping {
    [key: string]: ConfigDetail[];
}

export interface ConfigDetail
{
    source:string,
    type:string
}
