import { Renderer } from '../Renderer';
import { Output } from '../../output/Output';
import { Vec3 } from '../../math/Vec3';
import { Ray } from '../../math/Ray';


export class RaySkyRenderer implements Renderer {
    render(output: Output) {
        const focalLength = 110;

        const origin = new Vec3(0, 0, 0);
        const horizontal = new Vec3(output.width, 0, 0);
        const vertical = new Vec3(0, output.height, 0);
        const llc = origin
                        .sub(horizontal.div(2))
                        .sub(vertical.div(2))
                        .sub(new Vec3(0, 0, focalLength))

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

    private hitSphere(center: Vec3, radius: number, ray: Ray): boolean {
        const oc = ray.origin.sub(center);
        const a = ray.direction.dot(ray.direction);
        const b = 2 * oc.dot(ray.direction);
        const c = oc.dot(oc) - radius * radius;
        const discriminant = b*b - 4*a*c;

        return discriminant > 0;
    }

    private rayColor(r: Ray): Vec3 {
        if (this.hitSphere(
            new Vec3(0, 0, -1),
            .5,
            r
        )) {
            return new Vec3(1, 0, 0);
        }
        const unitDirection = r.direction.unit();
        const t = 0.5 * (unitDirection.y + 1);
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