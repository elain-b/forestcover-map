var dataset = ee.Image('UMD/hansen/global_forest_change_2020_v1_8');
print(dataset)
var treeCoverVisParam = {
  bands: ['treecover2000'],
  min: 0,
  max: 100,
  palette: ['black', 'green']
};
var forestcover = dataset.clip(geometry);
Map.addLayer(forestcover, treeCoverVisParam, 'tree cover');

var treeLossVisParam = {
  bands: ['lossyear'],
  min: 0,
  max: 20,
  palette: ['yellow', 'red']
};
var forestcover2 = dataset.clip(geometry);
Map.addLayer(forestcover2, treeLossVisParam, 'tree loss year');

Export.image.toDrive({
  image: forestcover,
  description:'forestcoverdate',
  fileFormat: 'geotiff'
});

// 成功
// Load a Japan boundary from the Large Scale International Boundary dataset.
var japan = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
  .filter(ee.Filter.eq('country_na', 'Japan'));

// Load a 2012 nightlights image, clipped to the Japan border.
var nl2012 = ee.Image('UMD/hansen/global_forest_change_2020_v1_8')
  .select('treecover2000')
  .clipToCollection(japan);

// Define arbitrary thresholds on the 6-bit nightlights image.
var zones = nl2012.gt(30).add(nl2012.gt(55)).add(nl2012.gt(62));
zones = zones.updateMask(zones.neq(0));

// Convert the zones of the thresholded nightlights to vectors.
var vectors = zones.addBands(nl2012).reduceToVectors({
  geometry: japan,
  crs: nl2012.projection(),
  scale: 1000,
  geometryType: 'polygon',
  eightConnected: false,
  labelProperty: 'zone',
  reducer: ee.Reducer.mean()
});

// Display the thresholds.
Map.setCenter(139.6225, 35.712, 9);
Map.addLayer(zones, {min: 1, max: 3, palette: ['0000FF', '00FF00', 'FF0000']}, 'raster');

// Make a display image for the vectors, add it to the map.
var display = ee.Image(0).updateMask(0).paint(vectors, '000000', 3);
Map.addLayer(display, {palette: '000000'}, 'vectors');

Export.table.toDrive({
  collection: vectors,
  description:'vectorsToDriveExample',
  fileFormat: 'geojson'
});