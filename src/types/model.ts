export class Model {
  name: string
  description: string
  downloadUrl: string
  fileSize: number
  installed: boolean
  installable: boolean = false
  usable: boolean
  execusionScriptPath: string
  location: string

  constructor(
    name: string,
    description: string,
    downloadUrl: string,
    fileSize: number,
    installed: boolean = false,
    installable: boolean = false,
    usable: boolean,
    execusionScriptPath: string,
    location: string
  ) {
    this.name = name
    this.description = description
    this.downloadUrl = downloadUrl
    this.fileSize = fileSize
    this.installed = installed
    this.installable = installable
    this.usable = usable
    this.execusionScriptPath = execusionScriptPath
    this.location = location
  }

  getDownloadUrl(): string {
    return this.downloadUrl
  }

  getDownloadSize(): string {
    return `${this.fileSize} MB`
  }

  getDownloadLink(): string {
    return this.downloadUrl
  }

  getDownloadInfo(): string {
    return `${this.getDownloadSize()} - ${this.getDownloadLink()}`
  }

  getDetails(): string {
    return `${this.name} - ${this.description}`
  }

  getSummary(): string {
    return `${this.name} - ${this.description}`
  }

  isInstalled(): boolean {
    return this.installed
  }

  isInstallable(): boolean {
    return this.installable
  }

  setInstalled(installed: boolean) {
    this.installed = installed
  }

  setInstallable(installable: boolean) {
    this.installable = installable
  }

  isUsable(): boolean {
    return this.usable
  }

  setUsable(usable: boolean) {
    this.usable = usable
  }

  getExecutionScriptPath(): string {
    return this.execusionScriptPath
  }

  getLocation(): string {
    return this.location
  }

  setLocation(location: string) {
    this.location = location
  }

  toString(): string {
    return this.getSummary()
  }

  toJSON(): object {
    return {
      name: this.name,
      description: this.description,
      downloadUrl: this.downloadUrl,
      fileSize: this.fileSize,
      installed: this.installed,
      installable: this.installable,
      usable: this.usable,
      execusionScriptPath: this.execusionScriptPath,
      location: this.location
    }
  }
}
