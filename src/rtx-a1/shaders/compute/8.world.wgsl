struct WorldBuffer {
  values: array<f32>;
};

fn hit_world(ray: Ray, tMin: f32, tMax: f32) -> HitRecord {
  let numMaterials = u32(world.values[0u]);
  let numObjects = u32(world.values[1u]);
  let materialsDataStart = 2u;
  let objectsDataStart = materialsDataStart + numMaterials * MATERIAL_DATA_SIZE;

  var hit = init_hit_record();
  var closestSoFar = tMax;
  var objectIndex: u32;
  for (objectIndex = 0u; objectIndex < numObjects; objectIndex = objectIndex + 1u) {
    let objectDataIndex = objectsDataStart + objectIndex * OBJECT_DATA_SIZE;
    let materialDataIndex = u32(world.values[objectDataIndex + 10u]);

    let material = Material(
      u32(world.values[materialDataIndex + 0u]),
      Color(
        world.values[materialDataIndex + 1u],
        world.values[materialDataIndex + 2u],
        world.values[materialDataIndex + 3u]
      ),
      world.values[materialDataIndex + 4u]
    );

    let objectType = u32(world.values[objectDataIndex + 0u]);

    if (objectType == object_sphere) {
      let sphere = Sphere(
        v3(
          world.values[objectDataIndex + 1u],
          world.values[objectDataIndex + 2u],
          world.values[objectDataIndex + 3u]
        ),
        world.values[objectDataIndex + 4u],
        material
      );

      let sphereHit = hit_sphere(sphere, ray, tMin, closestSoFar);
      if (sphereHit.hit) {
         closestSoFar = sphereHit.t;
         hit = sphereHit;
      }
    }
    else if (objectType == object_triangle) {
      let trg = Triangle(
        v3(
          world.values[objectDataIndex + 1u],
          world.values[objectDataIndex + 2u],
          world.values[objectDataIndex + 3u]
        ),
        v3(
          world.values[objectDataIndex + 4u],
          world.values[objectDataIndex + 5u],
          world.values[objectDataIndex + 6u]
        ),
        v3(
          world.values[objectDataIndex + 7u],
          world.values[objectDataIndex + 8u],
          world.values[objectDataIndex + 9u]
        ),
        material
      );

      let triangleHit = hit_triangle(trg, ray, tMin, closestSoFar);
      if (triangleHit.hit) {
         closestSoFar = triangleHit.t;
         hit = triangleHit;
      }
    }
  }

  return hit;
}

fn world_light_object_indexes() -> array<u32, MAX_LIGHTS> {
  let numMaterials = u32(world.values[0u]);
  let numObjects = u32(world.values[1u]);
  let materialsDataStart = 2u;
  let objectsDataStart = materialsDataStart + numMaterials * MATERIAL_DATA_SIZE;


  var indexes: array<u32, MAX_LIGHTS>;
  var indexIndex: u32;

  var objectIndex: u32;
  for (objectIndex = 0u; objectIndex < numObjects; objectIndex = objectIndex + 1u) {
    let objectDataIndex = objectsDataStart + objectIndex * OBJECT_DATA_SIZE;
    let materialDataIndex = u32(world.values[objectDataIndex + 10u]);

    let materialType = u32(world.values[materialDataIndex + 0u]);
    if (materialType == material_difuse_light) {
      indexes[indexIndex] = objectIndex;
      indexIndex = indexIndex + 1u;
    }

    if (indexIndex >= 10u) {
      break;
    }
  }

  return indexes;
}

fn get_object_type_at_index(objectIndex: u32) -> u32 {
  let numMaterials = u32(world.values[0u]);
  let numObjects = u32(world.values[1u]);
  let materialsDataStart = 2u;
  let objectsDataStart = materialsDataStart + numMaterials * MATERIAL_DATA_SIZE;
  let objectDataIndex = objectsDataStart + objectIndex * OBJECT_DATA_SIZE;

  return u32(world.values[objectDataIndex + 0u]);
}

fn get_sphere_at_index(objectIndex: u32) -> Sphere {
  let numMaterials = u32(world.values[0u]);
  let numObjects = u32(world.values[1u]);
  let materialsDataStart = 2u;
  let objectsDataStart = materialsDataStart + numMaterials * MATERIAL_DATA_SIZE;
  let objectDataIndex = objectsDataStart + objectIndex * OBJECT_DATA_SIZE;
  let materialDataIndex = u32(world.values[objectDataIndex + 10u]);

  let material = Material(
    u32(world.values[materialDataIndex + 0u]),
    Color(
      world.values[materialDataIndex + 1u],
      world.values[materialDataIndex + 2u],
      world.values[materialDataIndex + 3u]
    ),
    world.values[materialDataIndex + 4u]
  );

  return Sphere(
    v3(
      world.values[objectDataIndex + 1u],
      world.values[objectDataIndex + 2u],
      world.values[objectDataIndex + 3u]
    ),
    world.values[objectDataIndex + 4u],
    material
  );
}

fn get_triangle_at_index(objectIndex: u32) -> Triangle {
  let numMaterials = u32(world.values[0u]);
  let numObjects = u32(world.values[1u]);
  let materialsDataStart = 2u;
  let objectsDataStart = materialsDataStart + numMaterials * MATERIAL_DATA_SIZE;
  let objectDataIndex = objectsDataStart + objectIndex * OBJECT_DATA_SIZE;
  let materialDataIndex = u32(world.values[objectDataIndex + 10u]);

  let material = Material(
    u32(world.values[materialDataIndex + 0u]),
    Color(
      world.values[materialDataIndex + 1u],
      world.values[materialDataIndex + 2u],
      world.values[materialDataIndex + 3u]
    ),
    world.values[materialDataIndex + 4u]
  );

  return Triangle(
    v3(
      world.values[objectDataIndex + 1u],
      world.values[objectDataIndex + 2u],
      world.values[objectDataIndex + 3u]
    ),
    v3(
      world.values[objectDataIndex + 4u],
      world.values[objectDataIndex + 5u],
      world.values[objectDataIndex + 6u]
    ),
    v3(
      world.values[objectDataIndex + 7u],
      world.values[objectDataIndex + 8u],
      world.values[objectDataIndex + 9u]
    ),
    material
  );
}