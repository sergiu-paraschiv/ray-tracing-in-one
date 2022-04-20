import { Vec3 } from '../math/Vec3';
import { Ray } from '../math/Ray';


export class Camera {
    private readonly viewportWidth: number;
    private readonly viewportHeight: number;
    private readonly focalLength: number;
    private readonly origin: Vec3;
    private readonly horizontal: Vec3;
    private readonly vertical: Vec3;
    private readonly llc: Vec3;

    public constructor(viewportWidth: number, viewportHeight: number, focalLength: number) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.focalLength = focalLength;

        this.origin = new Vec3(0, 0, 0);
        this.horizontal = new Vec3(this.viewportWidth, 0, 0);
        this.vertical = new Vec3(0, this.viewportHeight, 0);
        this.llc = this.origin
            .sub(this.horizontal.div(2))
            .sub(this.vertical.div(2))
            .sub(new Vec3(0, 0, this.focalLength))
    }

    public getRay(u: number, v: number): Ray {
        return new Ray(
            this.origin,
            this.llc.add(this.horizontal.mul(u))
                .add(this.vertical.mul(v))
                .sub(this.origin)
        );
    }
}