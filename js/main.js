 Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMzA4MjRmNi01MWFkLTRjYzctOWQ2MS03NzlmNTViNDRlNjYiLCJpZCI6MTExODcxLCJpYXQiOjE2NjYyNzM5OTh9.HB2Ft4ePjW8N-sJOWbGDjObHXj8IOBDta9Okzir315k';
    const TILESET_URL = "ressources/Xmodel/tileset.json";
    const viewer = new Cesium.Viewer('cesiumContainer');

(async () => {
  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl(TILESET_URL);
    viewer.scene.primitives.add(tileset);
    await tileset.readyPromise;

    // Ausgangspunkt aus BoundingSphere
    const boundingCenter = tileset.boundingSphere.center;
    const boundingCarto = Cesium.Cartographic.fromCartesian(boundingCenter);

    // Originale Werte:
    let longitude = boundingCarto.longitude; // In RADIANS!
    let latitude = boundingCarto.latitude;   // In RADIANS!
    const originalHeight = boundingCarto.height;

    // OFFSETS (in Meter!):
    const offsetEast = -35;    // Positive Werte = OST, negative = WEST
    const offsetNorth = 25;   // Positive Werte = NORD, negative = SÜD
    const heightOffset = -22;  // Wenn du nochmal die Höhe anpassen willst

    // Umrechnung Meter -> Grad für kleine lokale Verschiebungen:
    // (WGS84-Ellipsoid, Näherung)
    const metersPerDegreeLat = 111320; // ca. Meter pro Grad Breitengrad
    const metersPerDegreeLon = 40075000 * Math.cos(latitude) / 360; // abhängig vom Breitengrad

    // Offset in Grad:
    const deltaLat = offsetNorth / metersPerDegreeLat;
    const deltaLon = offsetEast / metersPerDegreeLon;

    // Neue Koordinaten:
    const newLongitude = longitude + Cesium.Math.toRadians(deltaLon);
    const newLatitude = latitude + Cesium.Math.toRadians(deltaLat);
    const newHeight = originalHeight + heightOffset;

    // Neue Position
    const newCenter = Cesium.Cartesian3.fromRadians(
      newLongitude,
      newLatitude,
      newHeight
    );

    // Rotation beibehalten, falls notwendig:
    const heading = -0.05;
    const pitch = 0;
    const roll = Cesium.Math.toRadians(-90);

    // Transformation
    const transform = Cesium.Transforms.headingPitchRollToFixedFrame(
      newCenter,
      new Cesium.HeadingPitchRoll(heading, pitch, roll)
    );

    tileset.root.transform = transform;
    viewer.zoomTo(tileset);

  } catch (e) {
    console.error('Fehler beim Laden des Tilesets:', e);
  }
})();