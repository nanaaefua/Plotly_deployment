function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    console.log(data);
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);

}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var resultsArray = samples.filter(obj => obj.id == sample);
    //  5. Create a variable that holds the first sample in the array.

    var result = resultsArray[0];
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIDs = result.otu_ids;
    var otuLabs = result.otu_labels;
    var sampleVals = result.sample_values;
    var metadataarray = data.metadata.filter(obj => obj.id == sample);
    var frequency = metadataarray[0].wfreq;


    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    var yticks = otuIDs.slice(0, 10).reverse().map(otuID => `OTU ${otuID}`).reverse();
    var xticks = sampleVals.slice(0, 10).reverse();
    var labels = otuLabs.slice(0, 10).reverse();


    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: xticks,
      y: yticks,
      type: 'bar',
      orientation: 'h',
      text: labels

    }];


    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",

    };

    // Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

    // Create the trace for the bubble chart.
    var bubbleData = [{
      x: otuIDs,
      y: sampleVals,
      text: otuLabs,
      mode: 'markers',
      marker: {
        size: sampleVals,
        color: otuIDs
      }
    }];

    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: { title: "OTU ID" },
      showlegend: false
    };

    // Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // Gauge chart

    // Gauge Chart is easier to do it with demographics as the wash frequency is found under metadata
    var traceGauge = {
      type: 'indicator',
      mode: 'gauge+number',
      title: {
        text: `<span style='font-size:0.8em; color:#00bcf2'><b>Belly Button Washing Frequency<b><br>From Subject<br># of Scrubs</span>`
      },
      subtitle: { text: `# Scrubs per week` },
      domain: {
        x: [0, 5],
        y: [0, 1]
      },
      value: frequency,
      gauge: {
        axis: {
          range: [null, 9]
        },
        steps: [
          { range: [0, 2], color: '#e81123' },
          { range: [2, 4], color: '#ff8c00' },
          { range: [4, 6], color: '#fff100' },
          { range: [6, 8], color: '#00b294' },
          { range: [8, 10], color: '#009e49' }
        ],
        threshold: {
          line: { color: 'red', width: 4 },
          thickness: 0.75,
          value: 6
        }
      }
    };

    var Gaugedata = [traceGauge];

    var Gaugelayout = {
      width: 350,
      height: 350,
      margin: { t: 25, r: 10, l: 25, b: 25 }
    };

    // Creating Gauge Chart
    Plotly.newPlot('gauge', Gaugedata, Gaugelayout);
  });
}