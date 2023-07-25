// License
// -----------------------BEGIN NOTICE -- DO NOT EDIT-----------------------

// This code is developed by Nirdesh Sharma at Hydrosense labs IIT-delhi(github @der-knight)
// Copyright © hydrosesnse labs IIT-Delhi. All rights reserved.
// contact: nirdesh@civil.iitd.ac.in
// RESEARCH ONLY LICENSE 
// 1.	Redistributions and use are permitted for internal research purposes only, and commercial use is strictly prohibited under this license. Inquiries regarding commercial use or external distribution should be directed to hydrosense labs iit delhi 
// 3.	Redistributions of source code must retain this NOTICE 
// THIS SOFTWARE IS PROVIDED  “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, 
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND 
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
// IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND 
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS 
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// -----------------------End NOTICE -- DO NOT EDIT-----------------------


// Create a control panel to the left of the map to store user defined inputs
var controlPanel = ui.Panel();
controlPanel.style().set({
  width:'370px'
});


// Add the logo to the control panel
// Upload a GeoTiff of the label and visualize it as RGB, then create a Thumbnail and add to the Panel
var logo = ee.Image('projects/ee-nirdeshksharma/assets/dfs').visualize({
    bands:  ['b1','b2','b3'],
    min: 0,
    max: 255
    });
var thumb = ui.Thumbnail({
    image: logo,
    params: {
        dimensions: '400x400',
        format: 'png'
        },
    style: {height: '200px', width: '320px',padding :'0'}
    });
var toolPanel = ui.Panel(thumb, 'flow', {width: '350px'});
controlPanel.add(toolPanel);

// Adda a description
var appDescription = ui.Label("For internal working and usage refer to");
var pdf=ui.Label("User Manual",{}," " )
var infoPanel = ui.Panel([appDescription,pdf],ui.Panel.Layout.flow('horizontal'));
controlPanel.add(infoPanel);

// Take user Inputs and add them to control Panel 

var latLabel = ui.Label("Enter Longitude");

latLabel.style().set({
  fontWeight:'bold',
  fontSize:'14px',
});

var latHolder = ui.Textbox({
  value:'12.49'});
  
var latPanel = ui.Panel([latLabel,latHolder], ui.Panel.Layout.flow('horizontal'));


var longLabel = ui.Label("Enter Latitude");

longLabel.style().set({
  fontWeight:'bold',
  fontSize:'14px',
});

var longHolder = ui.Textbox({
  value:'75.73'});
var longPanel = ui.Panel([longLabel,longHolder], ui.Panel.Layout.flow('horizontal'));

var dateLabel = ui.Label("Enter Date");

dateLabel.style().set({
  fontWeight:'bold',
  fontSize:'14px',
});

var dateHolder = ui.Textbox({placeholder:'YYYY-MM-DD', value: '2018-08-17'});
var datePanel = ui.Panel([dateLabel,dateHolder], ui.Panel.Layout.flow('horizontal'));

var latlongFilter = ui.Panel([latPanel,longPanel,datePanel]);

controlPanel.add(latlongFilter);

// ----------Map Panel-1------------------------------
var mapBefore = ui.Map();
mapBefore.setOptions( "ROADMAP");
mapBefore.add(ui.Label("Before Image"));
mapBefore.setControlVisibility(false);
mapBefore.centerObject(ee.Geometry.Point(78.96,23),4.2)


// ----------Map Panel-2------------------------------
var mapAfter = ui.Map();
mapAfter.setOptions( "ROADMAP");
mapAfter.add(ui.Label("After Image"));
mapAfter.setControlVisibility(false);

// Create a Map Linker
var linker = ui.Map.Linker([mapAfter,mapBefore]);

var mapGrid = ui.Panel(
    [ ui.Panel([mapAfter], null, {stretch: 'both'}),
    ui.Panel([mapBefore], null, {stretch: 'both'}),    ],
    ui.Panel.Layout.Flow('horizontal'), {stretch: 'both'});
    
    
// Clear root and add control Panel and mapGrid
ui.root.clear();
ui.root.widgets().reset([controlPanel,mapGrid]);

// General Functions
// Mask clouds from Sentinel2image

function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}
// RGB visualization for Sentinel image
var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};
//  Reset maps 
function mapReset(){
  mapBefore.clear();
  mapAfter.clear();
  mapAfter.setOptions("ROADMAP");
  mapAfter.add(ui.Label("After Image"));
  mapAfter.setControlVisibility(false);
  mapBefore.setOptions("ROADMAP");
  mapBefore.add(ui.Label("Before Image"));
  mapBefore.setControlVisibility(false);

}


var step1 = ui.Label({
  value: 'Select cloud free imagery',
  style: {height: '40px',width:'320px' ,fontSize: '26px', color: 'ff0000'}
});
// step1.style().set('backgroundColor', 'lightgray');
// step1.style().set({border: '1px solid darkgray'});
controlPanel.add(step1);

// Get Before image Number and After image number from user to get cloud free image
var afterImageLabel = ui.Label("Enter After image number"); 
afterImageLabel.style().set({
  fontWeight:'bold',
  fontSize:'14px',
});
var afterImgSelector = ui.Select({
  items:['0','1','2','3','4','5','6','7','8','9','10'],
  placeholder:"Select after image",
  value:'0'
});
var afterImagePanel = ui.Panel([afterImageLabel,afterImgSelector], ui.Panel.Layout.flow('horizontal'));

var beforeImageLabel = ui.Label("Enter Before image"); 

beforeImageLabel.style().set({
  fontWeight:'bold',
  fontSize:'14px',
});

var beforeImgSelector = ui.Select({
items:['-1','-2','-3','-4','-5','-6','-7','-8','-9','-10'],
value:'-1'});

var beforeImagePanel = ui.Panel([beforeImageLabel,beforeImgSelector], ui.Panel.Layout.flow('horizontal'));
controlPanel.add(afterImagePanel);
controlPanel.add(beforeImagePanel);

// Get values from user defined inputs as Global Variables
var lat;
var long;
var date;
var before_image_number;
var after_image_number;
var loc;

// Define Global Variables for the first function
var before_image_collection;
var after_image_collection;
var beforeImage;
var afterImage;
var drawingTools;

// We define first function to zoom to AOI and select cloud free images

function zoom(){
  mapReset();
  lat = ee.Number.parse(latHolder.getValue());
  long = ee.Number.parse(longHolder.getValue());
  loc = ee.Geometry.Point([long,lat]);

  date = ee.Date.parse("YYYY-MM-dd",dateHolder.getValue());
  before_image_number=ee.Number.parse(beforeImgSelector.getValue());   
  after_image_number=ee.Number.parse(afterImgSelector.getValue());
  
  mapBefore.centerObject(loc,12);
  before_image_collection = ee.ImageCollection("COPERNICUS/S2_HARMONIZED")
                  .filterDate(date.advance(-12,'months'),date)
                  .filterBounds(loc)
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',30))
                  .map(maskS2clouds);
  after_image_collection = ee.ImageCollection("COPERNICUS/S2_HARMONIZED")
                    .filterBounds(loc)
                    .filterDate(date, date.advance(12,'months'))
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',10))
                    .map(maskS2clouds);
  beforeImage=ee.Image(before_image_collection.toList(before_image_collection.size()).get(before_image_number));
  afterImage=ee.Image(after_image_collection.toList(after_image_collection.size()).get(after_image_number));
  mapBefore.addLayer(beforeImage,visualization,'RGB image');
  mapAfter.addLayer(afterImage,visualization,'RGB image');
  mapBefore.addLayer(loc,{},'Location');
  mapAfter.addLayer(loc,{},'Location');
}


var runButton = ui.Button({
  label:"Show Before and After Images"});

controlPanel.add(runButton);

runButton.onClick(zoom);


// Create an Area of Intereset
// The code only allows to create one AOI and retains the last drawn rectangle

var step2 = ui.Label({
  value: 'Create an Area of Interest',
  style: {height: '40px',width:'320px' ,fontSize: '26px', color: 'ff0000'}
});
controlPanel.add(step2);

// Global Variable drawingTools
var drawingTools;

function create_AOI()
{
  drawingTools = mapAfter.drawingTools();
  drawingTools.setShown(false);
  mapBefore.drawingTools().setLinked(true);
  mapBefore.drawingTools().setShown(false);
  mapAfter.drawingTools().setLinked(true);
  drawingTools.setShape('rectangle');
  drawingTools.draw();
  drawingTools.onDraw(function(geometry, layer) {
    // Only allow one geometry per layer.
    if (layer.geometries().length() > 1) {
      layer.geometries().reset([geometry])}
  });
}

// Create a button for rectangle selection
var symbol = {
  rectangle: '⬛',
};
var RPanel = ui.Panel({
  widgets: [
    // ui.Label('Create AOI encompassing all the Landslides. Only one AOI can be selected, in case of multiple selection of AOIs the geometry will reset to the latest selected AOI.'),
    ui.Button({
      label: symbol.rectangle + ' Draw AOI on After Image',
      onClick: create_AOI
    }),
  ],
  style: {position: 'top-left'},
  layout: null,
});
controlPanel.add(RPanel);


// Write a function to clip the image and zoom to AOI

var step3 = ui.Label({
  value: 'Clip and Zoom to AOI',
  style: {height: '40px',width:'320px' ,fontSize: '26px', color: 'ff0000'}
});
controlPanel.add(step3);

// Define global variables from this function

var AOI_geometry;
var beforeImage_clipped;
var afterImage_clipped;
// A function to clip the AOI and zoom to AOI and add clipped layers 
function clipAOI(){
  AOI_geometry=drawingTools.layers().get(0).getEeObject();
  drawingTools.stop();
  var clipGeometry = ee.FeatureCollection(AOI_geometry);
  beforeImage_clipped = beforeImage.clip(AOI_geometry);
  afterImage_clipped = afterImage.clip(AOI_geometry);
  mapBefore.centerObject(AOI_geometry);
  mapReset();
  var layers = drawingTools.layers();
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
  
  // Create an empty image into which to paint the features, cast to byte.
  var empty = ee.Image().byte();

  // Paint all the polygon edges with the same number and width, display.
  var outline = empty.paint({
  featureCollection: clipGeometry,
  color: 1,
  width: 3
  });
  mapBefore.addLayer(outline, {palette: 'FF0000'}, 'User Selection');
  mapAfter.addLayer(outline, {palette: 'FF0000'}, 'User Selection');
  mapBefore.addLayer(beforeImage_clipped,visualization,'RGB image');
  mapAfter.addLayer(afterImage_clipped,visualization,'RGB image');
}
var clipButton = ui.Button({
  label:"Zoom to AOI"
  });
controlPanel.add(clipButton);
clipButton.onClick(clipAOI);


var step4 = ui.Label({
  value: 'Create Landslide samples',
  style: {height: '40px',width:'320px' ,fontSize: '26px', color: 'ff0000'}
});
controlPanel.add(step4);

// Global variable to get landslide geometry
var landslidePointTools;
//Function to draw landslide points  

function Landslide_points(){
  drawingTools.stop();
  drawingTools.clear();
  landslidePointTools = mapAfter.drawingTools();
  landslidePointTools.setShape('point');
  var getAOI = landslidePointTools.draw();
}

// Once all landslide points are drawn save it as landslide layer
var landslide_points;

function createLandslideLayer(){
  var layers=landslidePointTools.layers();
  drawingTools.stop();
  drawingTools.clear();
  var ls_geom=layers.get(0).getEeObject(); // this saves all points as geomtery
  landslide_points = ee.FeatureCollection(ls_geom.coordinates().map(function(p){
  var point = ee.Feature(ee.Geometry.Point(p), {'ls':1});
  return point; // convert geometry to feature collection with value of landslide as 1
  }));
  var li=ee.List.sequence(0,landslide_points.size()).getInfo();
  li.map(function(i){
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0)) ;// remove all points from map
});
}


var p1=ui.Button({
      label: 'Create a Point AOI',
      onClick: Landslide_points,
      imageUrl:'https://fonts.gstatic.com/s/i/materialiconsoutlined/place/v19/24px.svg'
    });
var p2=ui.Button({
      label: 'Create layer',
      onClick: createLandslideLayer,
    });

var landslidePanel=ui.Panel([p1,p2], ui.Panel.Layout.flow('horizontal'));

controlPanel.add(landslidePanel);

var step5 = ui.Label({
  value: 'Create non Landslide samples',
  style: {height: '40px',width:'350px' ,fontSize: '26px', color: 'ff0000'}
});
controlPanel.add(step5);



var nonlandslidePointTools;
var nonlandslide_points

function nonLandslide_points(){
  nonlandslidePointTools = mapAfter.drawingTools();
  nonlandslidePointTools.setShape('point');
  var getAOI = nonlandslidePointTools.draw();
}

function createnonLandslideLayer(){
  var layers=nonlandslidePointTools.layers();
  drawingTools.stop();
  drawingTools.clear();
  var non_ls_geom=layers.get(0).getEeObject();
  nonlandslide_points = ee.FeatureCollection(non_ls_geom.coordinates().map(function(p){
  var point = ee.Feature(ee.Geometry.Point(p), {'ls':0});
  return point;
  }));
  var li=ee.List.sequence(0,nonlandslide_points.size()).getInfo();
  li.map(function(i){
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
});
}

var p3=ui.Button({
      label: 'Create a Point AOI',
      onClick: nonLandslide_points,
      imageUrl:'https://fonts.gstatic.com/s/i/materialiconsoutlined/place/v19/24px.svg'
    });
var p4=ui.Button({
      label: 'Create layer',
      onClick: createnonLandslideLayer,
    });

var nonlandslidePanel=ui.Panel([p3,p4], ui.Panel.Layout.flow('horizontal'));

controlPanel.add(nonlandslidePanel);

var step6 = ui.Label({
  value: 'SNIC',
  style: {height: '40px',width:'320px' ,fontSize: '26px', color: 'ff0000'}
});
controlPanel.add(step6);


var checkBox = ui.Checkbox({
  label:"Click for OBIA using SNIC"});
  
var SNICpanel = ui.Panel([checkBox]);
 

var textBoxlabel = ui.Label({
  value:"Enter SNIC super pixel size"
  }) ; 
var textBox = ui.Textbox({
  placeholder:"4",
  value:"4"
});
  
var textBoxlabel1 = ui.Label({
  value:"Enter SNIC compactness"
  })  ;
var textBox1 = ui.Textbox({
  placeholder:"0",
  value:"0"
});

var textBoxlabel2 = ui.Label({
  value:"Enter SNIC connectivity"
  }) ; 
var textBox2 = ui.Textbox({
  placeholder:"4",
  value:"4"
});
  
var textBoxlabel3 = ui.Label({
  value:"Enter SNIC Shape"
  })  ;
var textBox3 = ui.Textbox({
  placeholder:"HEX",
  value:"HEX"
});
  
var textboxforcheckbox = ui.Panel([textBoxlabel,textBox], ui.Panel.Layout.flow('horizontal'));
var textboxforcheckbox1 = ui.Panel([textBoxlabel1,textBox1], ui.Panel.Layout.flow('horizontal'));
var textboxforcheckbox2 = ui.Panel([textBoxlabel2,textBox2], ui.Panel.Layout.flow('horizontal'));
var textboxforcheckbox3 = ui.Panel([textBoxlabel3,textBox3], ui.Panel.Layout.flow('horizontal'));

controlPanel.add(SNICpanel);


var checkBoxvalue;
function updatecontrolPanel(){
  checkBoxvalue = checkBox.getValue();
  print(checkBoxvalue);
  if(checkBoxvalue ===true){
    SNICpanel.add(textboxforcheckbox);
    SNICpanel.add(textboxforcheckbox1);
    SNICpanel.add(textboxforcheckbox2);
    SNICpanel.add(textboxforcheckbox3);
  }
  if(checkBoxvalue===false){
    SNICpanel.remove(textboxforcheckbox);
    SNICpanel.remove(textboxforcheckbox1);
    SNICpanel.remove(textboxforcheckbox2);
    SNICpanel.remove(textboxforcheckbox3);
  }

}

checkBox.onChange(updatecontrolPanel);


var afn_SNIC = function(imageOriginal, SuperPixelSize, Compactness,
    Connectivity, NeighborhoodSize, SeedShape) {
    var theSeeds = ee.Algorithms.Image.Segmentation.seedGrid(
        SuperPixelSize, SeedShape);
    var snic2 = ee.Algorithms.Image.Segmentation.SNIC({
        image: imageOriginal,
        size: SuperPixelSize,
        compactness: Compactness,
        connectivity: Connectivity,
        neighborhoodSize: NeighborhoodSize,
        seeds: theSeeds
    });
    var theStack = snic2.addBands(theSeeds);
    return (theStack);
};

//Segmentation Layer
var step6 = ui.Label({
  value: 'Binary segmentation',
  style: {height: '40px',width:'320px' ,fontSize: '26px', color: 'ff0000'}
});
controlPanel.add(step6);

//Global variables for classification layer

var desired;
var classified;
var im;
var str;

var probButton =  ui.Button({
      label: 'Run Algorithm'});

var probability_Panel = ui.Panel({
  widgets: [probButton],
});



function probablistic_classification(){

  ui.root.remove(mapGrid);
  var mapFinal = ui.Map()
  ui.root.add(mapFinal)
  mapFinal.centerObject(AOI_geometry,13);
  
  mapFinal.addLayer(beforeImage_clipped,visualization,'Before Image')
  mapFinal.addLayer(afterImage_clipped,visualization,'After Image')
  str=ee.String(beforeImage.get('system:index')).slice(0,8).cat(ee.String('_')).cat(ee.String(afterImage.get('system:index')).slice(0,8));
  
  var before_image_ndvi=beforeImage_clipped.normalizedDifference(['B8', 'B4'])
  var after_image_ndvi=afterImage_clipped.normalizedDifference(['B8', 'B4'])
  var dem=ee.Image('NASA/NASADEM_HGT/001').select('elevation').clip(AOI_geometry).float()
  var slope=ee.Terrain.slope(dem)
  var aspect=ee.Terrain.aspect(dem)
  var ndvi_diff=before_image_ndvi.subtract(after_image_ndvi)
// var slope_postprocessed = slope.gt(10)
  function bsi(before_image)
  {
      var bsi=before_image.expression('((Red+SWIR) - (NIR+Blue)) / ((Red+SWIR) + (NIR+Blue))', {'Red': before_image.select('B11'),'SWIR': before_image.select('B4'),'NIR': before_image.select('B8'),'Blue': before_image.select('B2')})
      return bsi
  }
  var bsi_change=bsi(afterImage_clipped).subtract(bsi(beforeImage_clipped))

  im=ee.Image.cat(beforeImage_clipped.select(['B4','B3','B2','B8','B11','B12'])
  ,afterImage_clipped.select(['B4','B3','B2','B8','B11','B12']),dem,slope,aspect,before_image_ndvi,after_image_ndvi,ndvi_diff,bsi_change)
  .rename(['B4_1','B3_1','B2_1','B8_1','B11_1','B12_1','B4_2','B3_2','B2_2','B8_2','B11_2','B12_2','dem','slope','aspect','vegetation before','vegetation after','vegetation difference','bsi_change']);

  var projection = im.select('B2_1').projection().getInfo();
  var gcps=landslide_points.merge(nonlandslide_points);
  
  checkBoxvalue = checkBox.getValue();
  
  if(checkBoxvalue ===true){
  var SNIC_SuperPixelSize =  ee.Number.parse(textBox.getValue());
  var SNIC_Compactness = ee.Number.parse(textBox1.getValue());
  var SNIC_Connectivity = ee.Number.parse(textBox2.getValue());
  var SNIC_SeedShape = ee.String(textBox3.getValue());
  var SNIC_NeighborhoodSize = ee.Number(2).multiply(SNIC_SuperPixelSize);
  var SNIC_MultiBandedResults = afn_SNIC(
    im,
    SNIC_SuperPixelSize,
    SNIC_Compactness,
    SNIC_Connectivity,
    SNIC_NeighborhoodSize,
    SNIC_SeedShape);

  var SNIC_MultiBandedResults = SNIC_MultiBandedResults
      .reproject("EPSG:4326", null, 10);
  mapFinal.addLayer(SNIC_MultiBandedResults.select('clusters')
      .randomVisualizer(), {}, 'SNIC Segment Clusters', true, 1);
  var predictionBands=SNIC_MultiBandedResults.bandNames().remove("clusters").remove("seeds");
  var training = SNIC_MultiBandedResults.select(predictionBands).sampleRegions({
    collection: gcps, 
    properties: ['ls'], 
    scale: 10
  });


// Train a classifier.
var classifier = ee.Classifier.smileRandomForest(50).setOutputMode('PROBABILITY').train({
  features: training,  
  classProperty: 'ls', 
  inputProperties: predictionBands
});
classified = SNIC_MultiBandedResults.select(predictionBands).classify(classifier);
} 
// end of if block
  // Map.addLayer(ee.Image(classified),{min: 0, max: 1, palette: ['black', 'white']},'class')

  if(checkBoxvalue===false){
    var training = im.sampleRegions({
    collection: gcps, 
    properties: ['ls'], 
    scale: 10
  });
  
  var classifier = ee.Classifier.smileRandomForest(50).setOutputMode('PROBABILITY').train({
    features: training,  
    classProperty: 'ls', 
    inputProperties: im.bandNames()
  });
  // // Classify the image.
  classified = im.classify(classifier);
  }
  // close of false block
  
  mapFinal.addLayer(ee.Image(classified),{min: 0, max: 1, palette: ['black', 'white']},'Probability Layer');
  mapFinal.addLayer(landslide_points,{color:'FF0000'},"Landslide Points");
  mapFinal.addLayer(nonlandslide_points,{color:'00FF00'},"Non-Landslide Points");
  
  var out= ee.Image.cat(im,classified.float());
  
  var label = ui.Label('Probability');

  var slider = ui.Slider({
    min:0,
    max: 1,
    step: 0.01,
    value:0.5,
    style: {stretch: 'horizontal', width:'300px'},
    onChange: updateLayer
  });
  
  function updateLayer(demval){
    var demval = slider.getValue();
  
    // mapFinal.layers().reset();
    desired = classified.gte(demval)
    var desiredViz = ui.Map.Layer(desired, {palette:["grey","orange"]}, 'Binary Label')
    
    mapFinal.layers().set(5, desiredViz)
  }
  
    var panel = ui.Panel({
        widgets: [label, slider],
        layout: ui.Panel.Layout.flow('vertical'),
        // style: {position: 'bottom-right',width: '520px'
            // }
      });
  
      // Add the panel to the map.
      probability_Panel.add(panel);
      updateLayer(0.5);
}

probButton.onClick(probablistic_classification);

controlPanel.add(probability_Panel);


var step7 = ui.Label({
  value: 'Download Label/raw data',
  style: {height: '40px',width:'320px' ,fontSize: '26px', color: 'ff0000'}
});
controlPanel.add(step7);

function download(){
  var out= ee.Image.cat(im,classified.float(),desired.float()).rename(im.bandNames().add('Probability Layer').add('Label'))
  var url = desired.float().getDownloadURL({
    name:str.cat(ee.String('_Label only')).getInfo(),
    scale: 10,
    format: "ZIPPED_GEO_TIFF"
  });
  urlLabel.setUrl(url);
  urlLabel.style().set({shown: true});
  var url = out.getDownloadURL({
    name:str.cat(ee.String('_Raw files and label')).getInfo(),
    scale: 10,
    format: "ZIPPED_GEO_TIFF"
  });
  urlLabel1.setUrl(url);
  urlLabel1.style().set({shown: true});
}


var downloadButton = ui.Button('Download', download);
var urlLabel = ui.Label('Download Label only', {shown:false});
var urlLabel1 = ui.Label('Download Raw data and Label', {shown:false});

var panel = ui.Panel([urlLabel,urlLabel1],ui.Panel.Layout.Flow('horizontal'));
controlPanel.add(downloadButton);
controlPanel.add(panel);

var step8 = ui.Label({
  value: 'Reset App',
  style: {height: '40px',width:'320px' ,fontSize: '26px', color: 'ff0000'}
});
controlPanel.add(step8);

function Reset(){

ui.root.clear();
ui.root.widgets().reset([controlPanel,mapGrid]);
mapReset();
}

var resetButton = ui.Button('Reset', Reset);
controlPanel.add(resetButton);
var step9 = ui.Label({
  value: 'Contacts',
  style: {height: '40px',width:'320px' ,fontSize: '26px', color: '000000'}
});
controlPanel.add(step9)
var info= ui.Label('In case of problems or suggestion contact us:')
controlPanel.add(info)
var link = ui.Label('Hydrosense Labs IIT-DELHI', {},'https://hydrosense.iitd.ac.in/');
controlPanel.add(link);
var link = ui.Label('Prof. Manabendra Saharia IIT-Delhi', {},'mailto: msaharia@iitd.ac.in');
controlPanel.add(link);
var link = ui.Label('Mr. Nirdesh Sharma PhD Scholar', {},'mailto: nirdesh@civil.iitd.ac.in');
controlPanel.add(link);
