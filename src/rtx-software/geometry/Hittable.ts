import { Ray } from '../math/Ray';
import { Vec3 } from '../math/Vec3';


export class HitRecord {
    public readonly t: number
    public readonly p: Vec3
    public readonly normal: Vec3
    public readonly frontFace: boolean

    constructor(t: number, p: Vec3, normal: Vec3, frontFace: boolean) {
        this.t = t;
        this.p = p;
        this.normal = normal;
        this.frontFace = frontFace;
    }
}

export interface Hittable {
    hit(ray: Ray, tMin: number, tMax: number): false | HitRecord;
}