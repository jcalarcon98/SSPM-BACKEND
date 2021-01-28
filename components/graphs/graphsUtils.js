const QuickChart = require("quickchart-js");
const util = require("util");

function prepareSyllabusGraphData(syllabuses, alternatives, questionsSize) {
  const labels = [];
  const datasets = [];

  alternatives.forEach(({ description }) => {
    datasets.push({
      label: description,
      data: [],
    });
  });

  syllabuses.forEach((syllabus) => {
    const [{ denomination }] = syllabus;

    const currentDenomination =
      denomination.length > 20 ? denomination.split(" ") : denomination;

    labels.push(currentDenomination);

    syllabus.forEach(({ counter, alternative }) => {
      datasets.forEach((currentData) => {
        if (currentData.label === alternative) {
          const currentValue = (counter * 100) / questionsSize;

          const dataValue = currentValue === 0 ? 0.3 : currentValue;

          currentData.data.push(dataValue);
        }
      });
    });
  });

  return {
    labels,
    datasets,
  };
}

async function generateSyllabusGraph(
  titleGraph,
  grade,
  syllabuses,
  alternatives,
  questionsSize
) {
  const { labels, datasets } = prepareSyllabusGraphData(
    syllabuses,
    alternatives,
    questionsSize
  );

  const myChart = new QuickChart();
  myChart
    .setConfig({
      type: "horizontalBar",
      data: {
        labels,
        datasets,
      },
      options: {
        title: {
          display: true,
          text: [titleGraph, grade],
        },
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        plugins: {
          datalabels: {
            color: "black",
            font: {
              weight: "bold",
            },
            anchor: "bottom",
            align: "end",
            formatter: (value) => {
              if (value === 0.3) return (0).toFixed(2) + "%";
              return value.toFixed(2) + "%";
            },
          },
        },
      },
    })
    .setWidth(900)
    .setHeight(400)
    .setBackgroundColor("white");

  await myChart.toFile("myChart.png");

  return "myChart.png";
}

async function generateIndicatorsGraph(titleGraph, grade, indicatorsData, alternatives) {
  
  const { labels, datasets } = prepareIndicatorsGraphData(indicatorsData, alternatives);

  const myChart = new QuickChart();

  myChart
    .setConfig({
      type: "horizontalBar",
      data: {
        labels,
        datasets,
      },
      options: {
        title: {
          display: true,
          text: [titleGraph, grade],
        },
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        plugins: {
          datalabels: {
            color: "black",
            font: {
              weight: "bold",
            },
            anchor: "bottom",
            align: "end",
            formatter: (value) => {
              if (value === 0.3) return (0).toFixed(2) + "%";
              return value.toFixed(2) + "%";
            },
          },
        },
      },
    })
    .setWidth(900)
    .setHeight(400)
    .setBackgroundColor("white");

  await myChart.toFile("myIndicatorsChart.png");

  return "myIndicatorsChart.png";
}

function prepareIndicatorsGraphData(indicatorsData, alternatives) {
  console.log(util.inspect(indicatorsData, false, null, true));

  const labels = [];
  const datasets = [];

  alternatives.forEach(({ description }) => {
    datasets.push({
      label: description,
      data: [],
    });
  });

  for (let index = 0; index < indicatorsData.length; index++) {

    const currentArray = indicatorsData[index];
    const indicatorTitle = currentArray[0];

    labels.push(transformIndicatorWords(indicatorTitle));

    for (let currentIndexArray = 1; currentIndexArray < currentArray.length; currentIndexArray++) {
      
      const currentValue = currentArray[currentIndexArray];
      const dataValue = currentValue === 0 ? 0.3 : currentValue;

      datasets[currentIndexArray - 1].data.push(dataValue);
    }
  }

  return {
    labels,
    datasets
  };
}

function transformIndicatorWords(word) {

  const arrayWord = word.split(" ");
  const rows = [];
  let rowArray = [];

  if (arrayWord.length < 4) {
    return word;
  }
  
  for (let i = 0; i < arrayWord.length; i += 4) {
    for (let j = i; j <= i + 3; j++) {
      if (j < arrayWord.length) {
        rowArray.push(arrayWord[j]);
      }
    }
    rows.push(rowArray.join(' '));
    rowArray = [];
  }

  return rows;
}

module.exports = {
  generateSyllabusGraph,
  generateIndicatorsGraph,
};