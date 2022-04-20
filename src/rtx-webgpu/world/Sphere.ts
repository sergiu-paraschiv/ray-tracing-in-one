import { Point } from './Point';


export class Sphere {
    public readonly center: Point;
    public readonly radius: number;

    constructor(center: Point, radius: number) {
        this.center = center;
        this.radius = radius;
    }
}