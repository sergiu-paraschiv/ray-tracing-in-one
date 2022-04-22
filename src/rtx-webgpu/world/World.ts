import { Material, ScatterType } from './Material';
import { Object, Sphere, Triangle, isSphere, isTriangle } from './Object';


interface ObjectMaterial {
    object: Object
    material: Material
}

const MATERIAL_TYPE_MAP: {
    [key in ScatterType]: number
} = {
    lambertian: 1,
    metal: 2,
    dielectric: 3,
    difuse_light: 4
};

export class World {
    private materials: Material[] = [];
    private objects: Object[] = [];
    private objectMaterials: ObjectMaterial[] = [];
    private buffer = new Float32Array();

    public getBuffer(): {
        values: ArrayBufferLike,
        size: number
    } {
        this.buildBuffer();
        return {
            values: this.buffer.buffer,
            size: this.buffer.length
        };
    }

    public addMaterial(material: Material) {
        this.materials.push(material);
    }

    public addObject(object: Object, material: Material) {
        this.objects.push(object);
        this.objectMaterials.push({ object, material });
    }

    private buildBuffer() {
        const data: number[] = [];

        data.push(this.materials.length);
        data.push(this.objects.length);

        const materialDataIndexes: number[] = [];
        for (const material of this.materials) {
            materialDataIndexes.push(data.length);

            data.push(MATERIAL_TYPE_MAP[material.scatterType]);

            if (material.scatterType === 'lambertian') {
                data.push(material.color!.r, material.color!.g, material.color!.b);
                data.push(0.0);
            }
            else if (material.scatterType === 'metal') {
                data.push(material.color!.r, material.color!.g, material.color!.b);
                data.push(0.0);
            }
            else if (material.scatterType === 'dielectric') {
                data.push(0.0, 0.0, 0.0);
                data.push(material.indexOfRefraction!);
            }
            else if (material.scatterType === 'difuse_light') {
                data.push(material.color!.r, material.color!.g, material.color!.b);
                data.push(0.0);
            }
        }

        for (const object of this.objects) {
            if (isSphere(object)) {
                data.push(1.0);
                data.push(object.center.x, object.center.y, object.center.z, object.radius);
                data.push(0.0, 0.0, 0.0, 0.0, 0.0);
            }
            else if (isTriangle(object)) {
                data.push(2.0);
                data.push(object.v0.x, object.v0.y, object.v0.z);
                data.push(object.v1.x, object.v1.y, object.v1.z);
                data.push(object.v2.x, object.v2.y, object.v2.z);
            }
            else {
                throw new Error('Unknown object type');
            }

            const objectMaterial = this.objectMaterials.find(objectMaterial => objectMaterial.object === object);
            if (!objectMaterial) {
                throw new Error('Object Material not found');
            }

            const materialIndex = this.materials.indexOf(objectMaterial.material);
            data.push(materialDataIndexes[materialIndex]);
        }

        this.buffer = new Float32Array(data);
    }
}