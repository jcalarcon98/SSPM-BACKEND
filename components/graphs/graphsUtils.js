const QuickChart = require("quickchart-js");
const util = require("util");

function prepareDataGraph(syllabuses, alternatives, questionsSize){

  const labels = [];
  const datasets = []; 

  alternatives.forEach( ({ description }) => {
    datasets.push({
      label: description,
      data: []
    });
  });

  syllabuses.forEach(syllabus => {

    const [{denomination}] = syllabus;

    const currentDenomination = denomination.length > 20 ? denomination.split(" ") : denomination;

    labels.push(currentDenomination);
    
    syllabus.forEach( ({ counter, alternative }) => {

      datasets.forEach( currentData => {

        if(currentData.label ===  alternative){

          const currentValue = (counter * 100)/questionsSize;

          const dataValue = currentValue === 0 ? 0.3 : currentValue;

          currentData.data.push(dataValue);
        }
      });
    })
  })

  return {
    labels,
    datasets
  }
}

function generateSyllabusGraph(titleGraph, grade, syllabuses, alternatives, questionsSize) {

  const { labels, datasets } = prepareDataGraph(syllabuses, alternatives, questionsSize);

  const myChart = new QuickChart();
  myChart.setConfig({
    type: "horizontalBar",
    data: {
      labels,
      datasets
    },
    options: {
      title: {
        display: true,
        text: [titleGraph, grade]
      },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
      plugins: {
        datalabels: {
          color: 'black',
          font: {
            weight: 'bold'
          },
          anchor: "bottom",
          align: "end",
          formatter: (value) => {
            if(value === 0.3) return (0).toFixed(2) + "%"; 
            return value.toFixed(2) + "%";
          },
        },
      },
    },
  })
  .setWidth(900)
  .setHeight(400)
  .setBackgroundColor("white");

  myChart.toFile("myChart.png");

  return "myChart.png";
}

module.exports = {
  generateSyllabusGraph
}