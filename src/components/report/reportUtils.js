/**
 * @file Manage all the configuration nedded to generate .docx file
 * @author Jean Carlos Alarcón <jeancalarcon98@gmail.com>
 * @author Edgar Andrés Soto <edgar.soto@unl.edu.ec>
 */
const docx = require('docx');
const fs = require('fs');
const process = require('process');
const { generateSyllabusGraph, generateIndicatorsGraph } = require('../graphs/graphsUtils');

const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  Media,
  AlignmentType,
  VerticalAlign,
  TextRun,
} = docx;

let verticalPercentage = 0;
/**
 * Generate grade name by entering a grade number.
 * @example <caption> Usage of <b>getGradeNameByNumber()</b></caption>
 * // returns 'Segundo'
 * getGradeNameByNumber(2);
 * @param  {number} number - Number of the grade, only numbers accepts [1..10].
 * @returns {string} The name of the grade entered.
 */
function getGradeNameByNumber(number) {
  switch (number) {
    case 1: return 'Primer';
    case 2: return 'Segundo';
    case 3: return 'Tercer';
    case 4: return 'Cuarto';
    case 5: return 'Quinto';
    case 6: return 'Sexto';
    case 7: return 'Séptimo';
    case 8: return 'Octavo';
    case 9: return 'Noveno';
    case 10: return 'Décimo';
    default: return undefined;
  }
}

/**
 * Generate a paragraph, it will be used as initial title after table.
 * @param  {string} text - The text that will be displayed
 * @param  {number} fontSize - The size of the text
 * @param  {number} alignment - Text alignment, if is 0 aligment will be LEFT else CENTER.
 * @returns {Paragraph} Paragraph object, it is part of the .docx library.
 */
function generateTitle(text, fontSize, alignment) {
  const currentAlignment = alignment === 0 ? AlignmentType.LEFT : AlignmentType.CENTER;

  const paragraph = new Paragraph({
    children: [new TextRun({
      text,
      bold: true,
      size: fontSize,
    })],
    alignment: currentAlignment,
  });

  return paragraph;
}

/**
 * Returns the short denomination of the Stage.
 * @param  {string} stage - The current stage (Mitad de ciclo || Final de ciclo).
 * @returns {string} short denomination of the stage (MITAD || FINAL).
 */
function getShortDenominationStage(stage) {
  const stages = {
    middleStage: 'MITAD DE CICLO',
    middle: 'MITAD',
    endStage: 'FINAL DE CICLO',
    end: 'FINAL',
  };

  return stage.toUpperCase() === stages.middleStage ? stages.middle : stages.end;
}
/**
 * Generate the main row of the table.
 * @param  {string} stage - The current stage (Mitad de ciclo || Final de ciclo).
 * @param  {number} columnSpan - The number of the columns that the cell inside row will be expanded.
 * @returns {TableRow} TableRow object, it is part of the .docx library
 */
function generateTableHeader(stage, columnSpan) {

  const shortStageDenomination = getShortDenominationStage(stage);

  const headerTitle = `APLICACIÓN A ${shortStageDenomination} DEL PERÍODO ACADÉMICO`;

  const cellChild = [
    new Paragraph({
      children: [new TextRun({
        text: headerTitle,
        bold: true,
      })],
      alignment: AlignmentType.CENTER,
    }),
  ];

  const tableHeader = new TableRow({
    children: [
      new TableCell({
        children: cellChild,
        columnSpan,
      }),
    ],
  });

  return tableHeader;
}
/**
 * Generate a table row with multiple cells according childrenArray size
 * @param  {Object[]} childrenArray - The cells that will be displayes inside the row.
 * @param  {string} childrenArray[].content - The content cell.
 * @param  {number} childrenArray[].rowSpan? - The number of the rows that the cell inside row will be expanded.
 * @param  {number} childrenArray[].columnSpan? - The number of the columns that the cell inside row will be expanded.
 * @returns  {TableRow} TableRow object with the same amount cell of the childrenArray elements, it is part of the .docx library
 */
function generateTableRow(childrenArray) {
  const generatedChildren = [];

  childrenArray.forEach((child) => {
    const cellChild = [
      new Paragraph({
        children: [new TextRun({
          text: child.content,
          bold: true,
        })],
        alignment: AlignmentType.CENTER,
      }),
    ];

    const currentTableCell = new TableCell({
      children: cellChild,
      rowSpan: child.rowSpan ? child.rowSpan : 1,
      columnSpan: child.columnSpan ? child.columnSpan : 1,
      verticalAlign: VerticalAlign.CENTER,
    });

    generatedChildren.push(currentTableCell);
  });

  const tableRow = new TableRow({
    children: generatedChildren,
  });

  return tableRow;
}

/**
 * Generate a table row with multiple cell with each syllabus denomination
 * @param  {number} gradeNumber - The grade number
 * @param  {Object[]} syllabuses - The syllabuses of the grade.
 * @param  {number} syllabuses[0].denomination - The syllabus denomination.
 * @param  {number} alternativesSize - The value that ITEMS and PERCENTAGE will be expanded in column.
 * @returns {TableRow} TableRow object with cells according syllabuses size and three more aditional cell, it is part of the .docx library
 */
function generateSyllabusRow(gradeNumber = 0, syllabuses = [], alternativesSize = 0) {
  const syllabusHeader = [];
  const gradeName = getGradeNameByNumber(gradeNumber);
  const currentCicle = `${gradeName} Ciclo`;

  syllabusHeader.push({
    content: currentCicle,
    rowSpan: 2
  });

  syllabuses.forEach(({ denomination }) => {
    syllabusHeader.push({
      content: denomination,
    });
  });

  syllabusHeader.push(
    {
      content: 'ITEMS',
      columnSpan: alternativesSize,
    },
    {
      content: 'PORCENTAJE',
      columnSpan: alternativesSize,
    },
  );

  return generateTableRow(syllabusHeader);
}

function generateTeachersRow(syllabuses, alternatives) {
  const teacherHeader = [];

  syllabuses.forEach(({ teacher }) => {
    teacherHeader.push({
      content: teacher.name,
    });
  });

  for (let index = 0; index < 2; index += 1) {
    alternatives.forEach(({ description }) => {
      teacherHeader.push({
        content: description,
      });
    });
  }

  return generateTableRow(teacherHeader);
}

function generateTitleQuestionRow(parallel, syllabusesSize, alternativesSize) {
  const indicatorsTitle = 'INDICADORES';
  const currentParallel = `PARALELO ${parallel}`;

  const contentArray = [
    {
      content: indicatorsTitle,
    },
    {
      content: currentParallel,
      columnSpan: syllabusesSize,
    },
  ];

  /**
   * Only to fill with empty data to set table format
   */
  for (let index = 0; index < alternativesSize * 2; index += 1) {
    contentArray.push({
      content: '',
    });
  }

  return generateTableRow(contentArray);
}

function prepareIndicatorsData(questions, syllabuses, alternatives, stage) {

  let totalItemsPercentage = 0;
  let areThereYesAlternative = false;

  const sheetNumber = getShortDenominationStage(stage) === 'MITAD' ? 0 : 1;

  const allRows = [];
  let currentRow = [];

  const indicatorsGraphData = [];
  let currentIndicatorGraphData = [];

  const counterAlternatives = [];

  alternatives.forEach((alternative) => {
    delete alternative.persistenceVersion;
    alternative.counter = 0;
    counterAlternatives.push(alternative);
  });

  questions.forEach(({ persistenceId, description }, index) => {
    const currentIndicator = `${index + 1}. ${description}`;

    currentRow.push(currentIndicator);
    currentIndicatorGraphData.push(currentIndicator);

    syllabuses.forEach(({ sheets }) => {
      const currentSheet = sheets[sheetNumber];
      // TODO: Here we can refactor code to break for if persistenceId === question
      currentSheet.answers.forEach(({ question, alternative }) => {
        if (question !== 'percentage') {
          const questionId = parseInt(question, 10);

          if (persistenceId === questionId) {
            counterAlternatives.forEach((counterAlternative) => {
              const alternativeId = parseInt(alternative, 10);

              if (counterAlternative.persistenceId === alternativeId) {
                currentRow.push(counterAlternative.description);
                counterAlternative.counter += 1;
              }
            });
          }
        }
      });
    });

    counterAlternatives.forEach(({ counter }) => {
      currentRow.push(counter.toString());
    });

    counterAlternatives.forEach((counterAlternative) => {
    
      const { counter, description } = counterAlternative;
      const percentageIndicator = (counter * 100) / syllabuses.length;

      if (description.toUpperCase() === "SI") {
        areThereYesAlternative = true;
        totalItemsPercentage += percentageIndicator;
      }

      currentRow.push(`${percentageIndicator.toFixed(2)}%`);

      currentIndicatorGraphData.push(percentageIndicator);
      counterAlternative.counter = 0;
    });

    indicatorsGraphData.push(currentIndicatorGraphData);
    currentIndicatorGraphData = [];

    allRows.push(currentRow);
    currentRow = [];
  });

  if(areThereYesAlternative){
    totalItemsPercentage /= questions.length;
    verticalPercentage = totalItemsPercentage;
  }

  return {
    allRows,
    indicatorsGraphData,
  };
}

function generateSimpleRow(row) {
  const indicatorRow = [];

  row.forEach((item) => {
    indicatorRow.push({
      content: item,
    });
  });

  return generateTableRow(indicatorRow);
}

function prepareFinalRows(stage, syllabuses, alternatives, questionsSize) {
  
  const defaultAlternatives = ["SI", "NO", "EN PARTE"];
  let areTheDefaultAlternatives = true;

  const sheetNumber = getShortDenominationStage(stage) === 'MITAD' ? 0 : 1;

  const syllabusesRateCounter = [];

  syllabuses.forEach(({ sheets, denomination }, index) => {
    const currentSyllabuses = [];

    alternatives.forEach(({ description, persistenceId }) => {

      if(!defaultAlternatives.includes(description.toUpperCase())){
        areTheDefaultAlternatives = false;
      }

      currentSyllabuses.push({
        counter: 0,
        alternative: description,
        alternativeId: persistenceId,
        denomination,
      });
    });

    syllabusesRateCounter.push(currentSyllabuses);

    const currentSheet = sheets[sheetNumber];

    currentSheet.answers.forEach(({ question, alternative }) => {
      // Verify if the question doesn't have percentage
      if (question !== 'percentage') {
        const currentAlternativeId = parseInt(alternative, 10);

        syllabusesRateCounter[index].forEach((currentSyllabus) => {
          if (currentAlternativeId === currentSyllabus.alternativeId) {
            currentSyllabus.counter += 1;
          }
        });
      }
    });
  });

  const rowsContent = [];
  let currentRowContent = [];

  const rowsContentPercentage = [];
  let currentRowContentPercentage = [];

  let totalPercentage = 0;

  alternatives.forEach(({ description }, index) => {
    currentRowContent.push({content: description});
    currentRowContentPercentage.push({content:description});

    syllabusesRateCounter.forEach((currentSyllabus) => {
      const currentCounter = currentSyllabus[index].counter;
      const currentPercentage = (currentCounter * 100) / questionsSize;
      const counterPercentage = currentPercentage.toFixed(2);
      
      currentRowContent.push({content: currentCounter.toString()});
      currentRowContentPercentage.push({content: `${counterPercentage}%`});
      
      if(description.toUpperCase() === 'SI'){
        totalPercentage += currentPercentage;
      }
    });

    if(areTheDefaultAlternatives){
      if(description.toUpperCase() === 'SI'){
        totalPercentage /= syllabusesRateCounter.length;

        currentRowContent.push({
          content: 'TOTAL ITEMS',
          rowSpan: 3,
          columnSpan: 3
        });

        currentRowContent.push({
          content: verticalPercentage,
          columnSpan: 3
        });
        
        currentRowContentPercentage.push({
          content: 'PORCENTAJE TOTAL',
          rowSpan: 3,
          columnSpan: 3
        });
        
        currentRowContentPercentage.push({
          content: totalPercentage,
          rowSpan: 3,
          columnSpan: 3
        });  
      }

      if(description.toUpperCase() === 'NO'){
        currentRowContent.push({
          content: 'TOTAL CUMPLIMIENTO',
          rowSpan: 2,
          columnSpan: 3
        });
      }
    }

    rowsContent.push(currentRowContent);
    rowsContentPercentage.push(currentRowContentPercentage);
    currentRowContent = [];
    currentRowContentPercentage = [];
  });

  return { syllabusesRateCounter, rowsContent, rowsContentPercentage };
}

function generateTable(syllabuses, parallel, number, alternatives, stage, questions) {
  const alternativesSize = alternatives.length;
  const syllabusesSize = syllabuses.length;
  const questionsSize = questions.length;
  /**
   * To understand this -> verify Table header.
   * Alternatives repeat two times (*2)
   * Each grade syllabus takes a space.
   * 1 => First column title (Séptimo, Octavo ciclo);
   */
  const tableRows = [];
  const tableHeaderColumnSpan = alternativesSize * 2 + syllabuses.length + 1;
  const tableHeader = generateTableHeader(stage, tableHeaderColumnSpan);
  const syllabusRow = generateSyllabusRow(number, syllabuses, alternativesSize);
  const teachersRow = generateTeachersRow(syllabuses, alternatives);
  const titleQuestionRow = generateTitleQuestionRow(parallel, syllabusesSize, alternativesSize);

  tableRows.push(tableHeader, syllabusRow, teachersRow, titleQuestionRow);

  const { allRows } = prepareIndicatorsData(questions, syllabuses, alternatives, stage);
  
  allRows.forEach((indicatorRow) => {
    const currentIndicatorRow = generateSimpleRow(indicatorRow);
    tableRows.push(currentIndicatorRow);
  });

  const {
    rowsContent,
    rowsContentPercentage,
  } = prepareFinalRows(stage, syllabuses, alternatives, questionsSize);

  console.log(rowsContent, 'Rows content');
  console.log(rowsContentPercentage, 'Rows content percentage')


  rowsContent.forEach((finalRow) => {
    const currentFinalRow = generateTableRow(finalRow);
    tableRows.push(currentFinalRow);
  });

  rowsContentPercentage.forEach((finalRowPercentage) => {
    const currentFinalRowPercentage = generateTableRow(finalRowPercentage);
    tableRows.push(currentFinalRowPercentage);
  });

  const table = new Table({
    rows: tableRows,
  });

  return table;
}

function getRandomDocumentName(degree, stage, initDate) {
  const randomNumber = new Date().getMilliseconds();
  const currentStage = getShortDenominationStage(stage);
  const basePath = `${process.cwd()}/reports`;

  const degreePath = `${basePath}/${degree}`;

  if (!fs.existsSync(degreePath)) {
    fs.mkdirSync(degreePath);
  }

  const documentName = `report-${currentStage}-${initDate}-${randomNumber}.docx`;

  return {
    documentName,
    folder: degree,
  };
}

async function generateDocument({ period }) {
  const {
    degree,
    initDate,
    stage,
    questions,
    alternatives,
    evaluationGrades: grades,
  } = period;

  const children = [];

  const document = new Document();

  for (const grade of grades) {
    
    const {
      syllabuses,
      parallel,
      number,
    } = grade;

    const gradeName = getGradeNameByNumber(number);
    const text = `${gradeName} Ciclo '${parallel}'`;
    const paragraph = generateTitle(text, 30, 0);
    const tableGrade = generateTable(syllabuses, parallel, number, alternatives, stage, questions);
    const currentGrade = `${gradeName} '${parallel}'`;

    // Generate syllabus Graph;
    const { syllabusesRateCounter } = prepareFinalRows(
      stage,
      syllabuses,
      alternatives,
      questions.length,
    );
    // TODO: check current stage and customize titleGraph
    const titleSyllabusGraph = 'Resumen de cumplimiento por Asignatura a mitad de periodo';
    const pathSyllabusGraph = await generateSyllabusGraph(
      titleSyllabusGraph,
      currentGrade,
      syllabusesRateCounter,
      alternatives,
      questions.length,
    );
    const syllabusGraph = Media.addImage(document, fs.readFileSync(`${process.cwd()}/${pathSyllabusGraph}`), 630, 400);

    const syllabusGraphParagraph = new Paragraph({
      children: [syllabusGraph],
      alignment: AlignmentType.CENTER,
    });

    // Generate IndicatorsGraph
    // TODO: check current stage and customize titleGraph
    const titleIndicatorsGraph = 'Resumen de cumplimiento por Indicador a mitad de periodo';
    const { indicatorsGraphData } = prepareIndicatorsData(
      questions,
      syllabuses,
      alternatives,
      stage,
    );

    const pathIndicatorsGraph = await generateIndicatorsGraph(
      titleIndicatorsGraph,
      currentGrade,
      indicatorsGraphData,
      alternatives,
    );
    const indicatorsGraph = Media.addImage(document, fs.readFileSync(`${process.cwd()}/${pathIndicatorsGraph}`), 630, 800);

    const indicatorsGraphParagraph = new Paragraph({
      children: [indicatorsGraph],
      alignment: AlignmentType.CENTER,
    });

    children.push(paragraph, tableGrade, syllabusGraphParagraph, indicatorsGraphParagraph);
  }

  const pathInformation = getRandomDocumentName(degree, stage, initDate);
  const { documentName, folder } = pathInformation;

  document.addSection({
    children,
  });

  const buffer = await Packer.toBuffer(document);
  const pathToSave = `reports/${folder}/${documentName}`;

  fs.writeFileSync(pathToSave, buffer);
  return pathInformation;
}

module.exports = {
  generateDocument,
  getGradeNameByNumber,
  getShortDenominationStage,
  generateTableHeader,
  generateTableRow,
  generateSyllabusRow
};
