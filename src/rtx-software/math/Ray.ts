import { Vec3 } from './Vec3';


export class Ray {
    public readonly origin: Vec3;
    public readonly direction: Vec3;

    public constructor(origin: Vec3, direction: Vec3) {
        this.origin = origin;
        this.direction = direction;
    }

    public at(t: number): Vec3 {
        return this.origin.add(this.direction.mul(t))
    }
}
