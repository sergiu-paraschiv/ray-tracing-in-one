import { Ray } from '../math/Ray';
import { HitRecord, Hittable } from './Hittable';


export class HittableList {
    private objects: Hittable[] = [];

    public add(object: Hittable): void {
        this.objects.push(object);
    }

    public clear(): void {
        this.objects = [];
    }

    public hit(ray: Ray, tMin: number, tMax: number): false | HitRecord {
        let hit: false | HitRecord = false;
        let closestSoFar = tMax;

        for (const object of this.objects) {
            const objectHitRecord = object.hit(ray, tMin, closestSoFar);
            if (objectHitRecord) {
                closestSoFar = objectHitRecord.t;
                hit = objectHitRecord;
            }
        }

        return hit;
    }
}