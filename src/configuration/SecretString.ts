export class SecretString {

    private readonly value: ()=> string;

    constructor(value: string) {
        this.value = () => value;
    }

    getValue(): string {
        return this.value();
    }
}