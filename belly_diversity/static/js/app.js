function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/"+sample).then(function(response) {

  


  // Use d3 to select the panel with id of `#sample-metadata`
  
  metaPanelSel=d3.select("#sample-metadata");
  



    // Use `.html("") to clear any existing metadata
    metaPanelSel.html("");



    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(response).forEach(([key,value]) => metaPanelSel.append("div").text(`${key} : ${value}`));

    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);

// Create multiplier to calculate the meter tick.
var level = response.WFREQ*170/9+10;


// Trig to calc meter point
var degrees = 180 - level,
     radius = .5;
var radians = degrees * Math.PI / 180;
var x = radius * Math.cos(radians);
var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
var path = mainPath.concat(pathX,space,pathY,pathEnd);

var data = [{ type: 'scatter',
   x: [0], y:[0],
    marker: {size: 28, color:'850000'},
    showlegend: false,
    name: 'Frequency',
    text: response.WFREQ,
    hoverinfo: 'text+name'},
  { values: [50/9,50/9, 50/9, 50/9, 50/9, 50/9,50/9,50/9,50/9,50],
  rotation: 90,
  text: ['8-9', '7-8', '6-7', '5-6',
            '4-5', '3-4', '2-3','1-2','0-1',''],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                         'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                         'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)','rgba(212, 126, 102, .5)',
                         'rgba(111, 222, 202, .5)','rgba(232, 226, 202, .5)',
                         'rgba(255, 255, 255, 0)']},
  labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
  hoverinfo: 'none',
  hole: .5,
  type: 'pie',
  showlegend: false
}];

var layout = {
  shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
  title: 'Frequency of Washing',
  xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
};

Plotly.newPlot('gauge', data, layout);



  });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json("/samples/"+sample).then(function(response) {


    // @TODO: Build a Bubble Chart using the sample data
    var bubbleChart = [{
      x: response.otu_ids,
      y: response.sample_values,
      mode: 'markers',
      marker: {
        size: response.sample_values,
        color : response.otu_ids
      },
      type : 'scatter',
      text: response.otu_labels,
      hoverinfo :'text'
    }];
    
    var layoutB = {
      title : 'Bubble Chart',
      xaxis: {
        title: {
          text: 'OTU_ID'}
      },
      yaxis: {
        title: {
          text: 'Sample Value'}
    }
    
    }
    


    Plotly.newPlot("bubble", bubbleChart,layoutB);
    // @TODO: Build a Pie Chart
    
   var ListOfObjects = [];
    
    //  Place arrays into a list of objects in order to sort properly.
    response.sample_values.forEach((data,index) => {
      ListOfObjects.push ({
        "sample_values" : data,
        "otu_ids" : response.otu_ids[index],
        "otu_labels" : response.otu_labels[index]

      });
    });
    // Sorts lists of objects.
    ListOfObjects.sort(function compareFunction(a, b) {
      // resulting order is descending.
     return b.sample_values - a.sample_values;
   });
   console.log(ListOfObjects);
   console.log(ListOfObjects.map(element => element.sample_values).slice(0,10));
   console.log(ListOfObjects.map(element => element.otu_ids).slice(0,10));
   console.log (ListOfObjects.map(element => element.otu_labels).slice(0,10));
    var pietrace = [{

      values : ListOfObjects.map(element => element.sample_values).slice(0,10),
      labels : ListOfObjects.map(element => element.otu_ids).slice(0,10),
      type : 'pie',
      hovertext : ListOfObjects.map(element => element.otu_labels).slice(0,10),
      hoverinfo :'text'
      
      
    }];

    var layoutP = {
      title : 'Top 10 Pie Chart'
    }
    
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    Plotly.newPlot("pie", pietrace,layoutP);

  });
    
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
