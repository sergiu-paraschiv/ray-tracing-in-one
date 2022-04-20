import { Point } from '../world/Point';

export class Camera {
    public lookFrom: Point;
    public lookAt: Point;
    public fov: number;
    public aperture: number;
    public distanceToFocus: number;

    private buffer = new Float32Array();

    constructor(lookFrom: Point, lookAt: Point, fov: number, aperture: number, distanceToFocus: number) {
        this.lookFrom = lookFrom;
        this.lookAt = lookAt;
        this.fov = fov;
        this.aperture = aperture;
        this.distanceToFocus = distanceToFocus;
    }

    public getBuffer(): {
        values: ArrayBufferLike,
        size: number
    } {
        this.buildBuffer();
        return {
            values: this.buffer.buffer,
            size: this.buffer.length
        };
    }

    private buildBuffer() {
        const data: number[] = [];

        data.push(this.lookFrom.x, this.lookFrom.y, this.lookFrom.z);
        data.push(this.lookAt.x, this.lookAt.y, this.lookAt.z);
        data.push(this.fov);
        data.push(this.aperture);
        data.push(this.distanceToFocus);

        this.buffer = new Float32Array(data);
    }
}