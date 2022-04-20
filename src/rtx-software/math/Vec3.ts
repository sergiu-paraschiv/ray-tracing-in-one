export class Vec3 {
    public readonly e: [ number, number, number ] = [0, 0, 0];

    public constructor(x: number, y: number, z: number) {
        this.e[0] = x;
        this.e[1] = y;
        this.e[2] = z;
    }

    public get x() {
        return this.e[0];
    }

    public get y() {
        return this.e[1];
    }

    public get z() {
        return this.e[2];
    }

    public sub(v: Vec3): Vec3 {
        return new Vec3(
            this.e[0] - v.e[0],
            this.e[1] - v.e[1],
            this.e[2] - v.e[2]
        );
    }

    public add(v: Vec3): Vec3 {
        return new Vec3(
            this.e[0] + v.e[0],
            this.e[1] + v.e[1],
            this.e[2] + v.e[2]
        );
    }

    public mul(t: number): Vec3 {
        return new Vec3(
            this.e[0] * t,
            this.e[1] * t,
            this.e[2] * t
        );
    }

    public div(t: number): Vec3 {
        return this.mul(1 / t);
    }

    public lengthSquared(): number {
        return this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2];
    }

    public length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    public unit(): Vec3 {
        return this.div(this.length())
    }

    public dot(v: Vec3): number {
        return this.e[0] * v.e[0] + this.e[1] * v.e[1] + this.e[2] * v.e[2];
    }
}
