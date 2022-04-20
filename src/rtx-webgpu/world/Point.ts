export class Point {
    public readonly x: number;
    public readonly y: number;
    public readonly z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public subtract(other: Point): Point {
        return new Point(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z
        )
    }
}