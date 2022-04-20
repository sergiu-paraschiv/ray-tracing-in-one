import { Vec3 } from '../math/Vec3';
import { Ray } from '../math/Ray';
import { HitRecord, Hittable } from './Hittable';


export class Sphere implements Hittable {
    public readonly center: Vec3
    public readonly radius: number;

    public constructor(center: Vec3, radius: number) {
        this.center = center;
        this.radius = radius;
    }

    public hit(ray: Ray, tMin: number, tMax: number): false | HitRecord {
        const oc = ray.origin.sub(this.center);
        const a = ray.direction.lengthSquared();
        const halfB = oc.dot(ray.direction);
        const c = oc.lengthSquared() - this.radius * this.radius;
        const discriminant = halfB*halfB - a*c;

        if (discriminant < 0) {
            return false;
        }

        const sqrtd = Math.sqrt(discriminant);
        let root = (-halfB - sqrtd) / a;
        if (root < tMin || root > tMax) {
            root = (-halfB + sqrtd) / a;

            if (root < tMin || root > tMax) {
                return false;
            }
        }

        const t = root;
        const p = ray.at(t);
        const outwardNormal = p.sub(this.center).div(this.radius);
        const frontFace = ray.direction.dot(outwardNormal) < 0;
        const normal = frontFace ? outwardNormal : outwardNormal.mul(-1);

        return new HitRecord(
            t,
            p,
            normal,
            frontFace
        );
    }
}