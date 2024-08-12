export class UpscaleData {
    startTimeMinutes: number;
    startTimeSeconds: number;
    durationMinutes: number;
    durationSeconds: number;

    constructor(startTimeMinutes: number, startTimeSeconds: number, durationMinutes: number, durationSeconds: number) {
        this.startTimeMinutes = startTimeMinutes;
        this.startTimeSeconds = startTimeSeconds;
        this.durationMinutes = durationMinutes;
        this.durationSeconds = durationSeconds;
    }

    getStartTimeMinutes(): number {
        return this.startTimeMinutes;
    }

    getStartTimeSeconds(): number {
        return this.startTimeSeconds;
    }

    getDurationMinutes(): number {
        return this.durationMinutes;
    }

    getDurationSeconds(): number {
        return this.durationSeconds;
    }

    static fromJson(json: any): UpscaleData {
        return new UpscaleData(json.startTimeMinutes, json.startTimeSeconds, json.durationMinutes, json.durationSeconds);
    }
}