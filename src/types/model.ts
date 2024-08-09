export class Model {
    name: string;
    description: string;
    downloadUrl: string;
    fileSize: number;
    installed: boolean;
    installable: boolean = false;
    usable: boolean;

    constructor(name: string, description: string, downloadUrl: string, fileSize: number, installed: boolean = false, installable: boolean = false, usable: boolean) {
        this.name = name;
        this.description = description;
        this.downloadUrl = downloadUrl;
        this.fileSize = fileSize;
        this.installed = installed;
        this.installable = installable;
        this.usable = usable;
    }

    getDownloadUrl(): string {
        return this.downloadUrl;
    }

    getDownloadSize(): string {
        return `${this.fileSize} MB`;
    }

    getDownloadLink(): string {
        return this.downloadUrl;
    }

    getDownloadInfo(): string {
        return `${this.getDownloadSize()} - ${this.getDownloadLink()}`;
    }

    getDetails(): string {
        return `${this.name} - ${this.description}`;
    }

    getSummary(): string {
        return `${this.getDetails()} - ${this.getDownloadInfo()}`;
    }

    isInstalled(): boolean {
        return this.installed;
    }

    isInstallable(): boolean {
        return this.installable;
    }

    setInstalled(installed: boolean) {
        this.installed = installed;
    }

    setInstallable(installable: boolean) {
        this.installable = installable;
    }

    isUsable(): boolean {
        return this.usable;
    }

    setUsable(usable: boolean) {
        this.usable = usable;
    }

    toString(): string {
        return this.getSummary();
    }

    static fromJson(json: any): Model {
        return new Model(json.name, json.description, json.downloadUrl, json.fileSize, json.installed, json.installable, json.usable);
    }

    static fromJsonArray(json: any[]): Model[] {
        return json.map((model) => Model.fromJson(model));
    }   
}
