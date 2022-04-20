import { Renderer } from '../Renderer';
import { Output } from '../../output/Output';
import { Vec3 } from '../../math/Vec3';
import { Ray } from '../../math/Ray';


export class SurfaceNormalsRenderer implements Renderer {
    private readonly focalLength: number;

    public constructor(focalLength: number) {
        this.focalLength = focalLength;
    }

    render(output: Output) {
        const origin = new Vec3(0, 0, 0);
        const horizontal = new Vec3(output.width, 0, 0);
        const vertical = new Vec3(0, output.height, 0);
        const llc = origin
                        .sub(horizontal.div(2))
                        .sub(vertical.div(2))
                        .sub(new Vec3(0, 0, this.focalLength))

        for (let j = output.height - 1; j >= 0; --j) {
            // console.info(`${j} lines remaining, ${Math.round(j/output.height * 100)}%`);
            for (let i = 0; i < output.width; ++i) {
                const u = i / (output.width - 1);
                const v = j / (output.height - 1);
                const ray = new Ray(
                    origin,
                    llc.add(horizontal.mul(u))
                        .add(vertical.mul(v))
                        .sub(origin)
                );

                const color = this.rayColor(ray);

                output.pushPixel([
                    Math.trunc(255.999 * color.x),
                    Math.trunc(255.999 * color.y),
                    Math.trunc(255.999 * color.z),
                    255,
                ]);
            }
        }
    }

    private hitSphere(center: Vec3, radius: number, ray: Ray): number {
        const oc = ray.origin.sub(center);
        const a = ray.direction.lengthSquared();
        const halfB = oc.dot(ray.direction);
        const c = oc.lengthSquared() - radius * radius;
        const discriminant = halfB*halfB - a*c;

        if (discriminant < 0) {
            return -1;
        }

        return (-halfB - Math.sqrt(discriminant)) / a;
    }

    private rayColor(ray: Ray): Vec3 {
        let t = this.hitSphere(
            new Vec3(0, 0, -1),
            .5,
            ray
        );

        if (t > 0) {
            const N = ray.at(t).sub(new Vec3(0, 0, -1)).unit();
            return new Vec3(N.x + 1, N.y + 1, N.z + 1).mul(.5);
        }

        const unitDirection = ray.direction.unit();
        t = 0.5 * (unitDirection.y + 1);
        return (
            new Vec3(1, 1, 1)
                .mul(1 - t)
                .add(
                    new Vec3(.5, .7, 1)
                        .mul(t)
                )
        );
    }
}