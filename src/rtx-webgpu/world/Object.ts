import { Point } from './Point';


export class Sphere {
    public readonly center: Point;
    public readonly radius: number;

    constructor(center: Point, radius: number) {
        this.center = center;
        this.radius = radius;
    }
}

export class Triangle {
    public readonly v0: Point;
    public readonly v1: Point;
    public readonly v2: Point;

    constructor(v0: Point, v1: Point, v2: Point) {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
    }
}

export type Object = Sphere | Triangle

export function isSphere(object: Object): object is Sphere {
    return object.hasOwnProperty('center');
}

export function isTriangle(object: Object): object is Triangle {
    return object.hasOwnProperty('v0');
}