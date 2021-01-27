const docx = require("docx");
const fs = require("fs");
const path = require("path");
const util = require("util");
const process = require('process');

const { Document, Packer, Paragraph, Table, TableCell, TableRow,  Media, AlignmentType, VerticalAlign, TextRun} = docx;

async function generateDocument({ period }) {
  
  const { degree, initDate, endDate, stage, questions, alternatives, evaluationGrades: grades} = period;

  const children = [];

  grades.forEach(({ syllabuses, parallel, number}) => {

    const paragraph = generateTitleCicle(number, parallel);
    const tableGrade = generateTable(syllabuses, parallel, number, alternatives, stage, questions);

    children.push(paragraph, tableGrade);
  });
  
  const pathInformation = getRandomDocumentName(degree, stage, initDate, endDate);
  const { documentName, folder } = pathInformation;
  
  const document = new Document();

  document.addSection({
    children
  });

  const buffer = await Packer.toBuffer(document);
  const pathToSave =  `reports/${folder}/${documentName}`;

  fs.writeFileSync(pathToSave, buffer);
  return pathInformation;
}

function generateTitleCicle(number, parallel) {
  const text = `${getGradeNameByNumber(number)} Ciclo "${parallel}"`;
  
  const paragraph = new Paragraph({
    children: [new TextRun({
      text,
      bold: true,
      size: 30
    })],
    alignment: AlignmentType.LEFT
  });

  return paragraph;
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
  
  const preparedIndicatorsData = prepareIndicatorsData(questions, syllabuses, alternatives, stage);

  preparedIndicatorsData.forEach(indicatorRow => {
    const currentIndicatorRow = generateSimpleRow(indicatorRow);
    tableRows.push(currentIndicatorRow);
  });
  
  const {rowsContent, rowsContentPercentage} = prepareFinalRows(stage, syllabuses, alternatives, questionsSize);
  rowsContent.forEach(finalRow => {
    const currentFinalRow = generateSimpleRow(finalRow);
    tableRows.push(currentFinalRow);
  });

  rowsContentPercentage.forEach(finalRowPercentage =>{
    const currentFinalRowPercentage = generateSimpleRow(finalRowPercentage);
    tableRows.push(currentFinalRowPercentage);
  });

  const table = new Table({
    rows: tableRows
  });    

  return table;
}

function generateTableHeader (stage, columnSpan){ 
  
  const headerTitle =  `APLICACIÓN A ${ getStage(stage) } DEL PERÍODO ACADÉMICO`;

  const cellChild = [
    new Paragraph({
      children: [new TextRun({
        text: headerTitle,
        bold: true          
      })],
      alignment: AlignmentType.CENTER,
    }),
  ];

  const tableHeader = new TableRow({
    children: [
      new TableCell({
        children: cellChild,
        columnSpan
      }),
    ],
  });

  return tableHeader;
}

function generateSyllabusRow(number, syllabuses, alternativesSize){
  
  const syllabusHeader = [];
  const currentCicle = `${getGradeNameByNumber(number)} Ciclo`;
  
  syllabusHeader.push({
    content: currentCicle,
    rowSpan: 2
  });
  
  syllabuses.forEach( ({ denomination }) => {

    syllabusHeader.push({
      content: denomination
    });

  });

  syllabusHeader.push(
    {
      content: "ITEMS",
      columnSpan: alternativesSize
    },
    {
      content: "PORCENTAJE",
      columnSpan: alternativesSize
    }
  );
  
  return generateTableRow(syllabusHeader);
}

function generateTeachersRow(syllabuses, alternatives){

  const teacherHeader = [];

  syllabuses.forEach( ({ teacher }) => {
    
    teacherHeader.push({
      content: teacher.name
    });
  
  });

  for (let index = 0; index < 2; index++) {
    alternatives.forEach( ({ description }) => {
      teacherHeader.push({
        content: description
      });
    });
  }

  return generateTableRow(teacherHeader);
}

function generateTitleQuestionRow(parallel, syllabusesSize, alternativesSize) {

  const indicatorsTitle = "INDICADORES DE DESARROLLO DEL SÍLABO";
  const currentParallel = `PARALELO ${parallel}`;

  const contentArray = [
    {
      content: indicatorsTitle
    },
    {
      content: currentParallel,
      columnSpan: syllabusesSize
    }
  ];

  /**
   * Only to fill with empty data to set table format
   */
  for (let index = 0; index < alternativesSize * 2; index++) {
    contentArray.push({
      content: ''
    });
  }
  
  return generateTableRow(contentArray);

}

function prepareIndicatorsData(questions, syllabuses, alternatives, stage) {

  sheetNumber = getStage(stage)  === "MITAD" ? 0 : 1; 

  const allRows = [];
  let currentRow = [];

  const counterAlternatives = [];

  alternatives.forEach( alternative => {
    delete alternative.persistenceVersion;
    alternative.counter = 0;
    counterAlternatives.push(alternative);
  });

  questions.forEach( ({ persistenceId, description }, index) => {

    currentRow.push( `${index + 1}. ${description}`);

    syllabuses.forEach(({ sheets }) => {
      
      const currentSheet = sheets[sheetNumber];
      // TODO: Here we can refactor code to break for if persistenceId === question
      currentSheet.answers.forEach(({question, alternative}) => {

        const questionId = parseInt(question);

        if( persistenceId === questionId ){

          counterAlternatives.forEach(counterAlternative => {

            const alternativeId = parseInt(alternative);

            if(counterAlternative.persistenceId === alternativeId){

              currentRow.push(counterAlternative.description);
              counterAlternative.counter += 1;
            }
          });
        }
      });
    });

    counterAlternatives.forEach( ({counter}) => {
      currentRow.push(counter.toString());
    });

    counterAlternatives.forEach( counterAlternative => {
      const counter = counterAlternative.counter;
      const percentage = ((counter * 100)/syllabuses.length).toFixed(2); 
      currentRow.push(`${percentage}%`);
      counterAlternative.counter = 0;
    });

    allRows.push(currentRow);
    currentRow = [];
  });

  return allRows;
}

function generateSimpleRow(row){

  const indicatorRow = [];

  row.forEach(item => {
    indicatorRow.push({
      content: item 
    });
  })

  return generateTableRow(indicatorRow);
}

function prepareFinalRows(stage, syllabuses, alternatives, questionsSize){

  sheetNumber = getStage(stage)  === "MITAD" ? 0 : 1; 

  const syllabusesRateCounter = [];
  
  syllabuses.forEach(({ sheets, denomination }, index) => {
    
    const currentSyllabus = [];

    alternatives.forEach( ({ description, persistenceId }) => {
      currentSyllabus.push({
        counter: 0,
        alternative: description,
        alternativeId: persistenceId,
        denomination: denomination 
      });
    });

    syllabusesRateCounter.push(currentSyllabus);

    const currentSheet = sheets[sheetNumber];
    
    currentSheet.answers.forEach( ({ alternative }) => {
      
      const currentAlternativeId = parseInt(alternative);
      
      syllabusesRateCounter[index].forEach(currentSyllabus => {

          if(currentAlternativeId === currentSyllabus.alternativeId){
            currentSyllabus.counter +=1;
          }
      });
    });
  });

  const rowsContent = [];
  let currentRowContent = [];

  const rowsContentPercentage = [];
  let currentRowContentPercentage = [];

  alternatives.forEach(({ description }, index) => {

    currentRowContent.push(description);
    currentRowContentPercentage.push(description);

    syllabusesRateCounter.forEach(currentSyllabus => {
      
      const currentCounter = currentSyllabus[index].counter;
      currentRowContent.push(currentCounter.toString());
      const counterPercentage = ((currentCounter * 100)/questionsSize).toFixed(2);
      currentRowContentPercentage.push(`${counterPercentage}%`);
    });

    rowsContent.push(currentRowContent);
    rowsContentPercentage.push(currentRowContentPercentage);
    currentRowContent = [];
    currentRowContentPercentage = [];
  });
  
  return { rowsContent, rowsContentPercentage };
} 

/**
 * childrenArray : { content, rowSpan, columnSpan}
 * @param {*} childrenArray 
 */
function generateTableRow( childrenArray ){
  
  const generatedChildren = [];

  childrenArray.forEach(child => {
    
    const cellChild = [
      new Paragraph({
        children: [new TextRun({
          text: child.content,
          bold: true          
        })],
        alignment: AlignmentType.CENTER,
      }),
    ];

    const currentTableCell = new TableCell({
      children: cellChild,
      rowSpan: child.rowSpan ? child.rowSpan : 1,
      columnSpan: child.columnSpan ? child.columnSpan: 1,
      verticalAlign: VerticalAlign.CENTER
    })

    generatedChildren.push(currentTableCell);

  });

  const tableRow = new TableRow({
    children: generatedChildren
  });

  return tableRow;
}

function getStage( stage ) {

  const stages = {
    middleStage : "MITAD DE CICLO",
    middle: "MITAD",
    endStage : "FINAL DE CICLO",
    end: "FINAL"
  }
  
  return stage.toUpperCase() === stages.middleStage ? stages.middle :  stages.end;
}

function getGradeNameByNumber(number) {

  switch(number){
    case 1: return "Primer";
    case 2: return "Segundo";
    case 3: return "Tercer";
    case 4: return "Cuarto";
    case 5: return "Quinto";
    case 6: return "Sexto";
    case 7: return "Séptimo";
    case 8: return "Octavo";
    case 9: return "Noveno";
    case 10: return "Décimo"
    default: return;
  }
}

function getRandomDocumentName( degree, stage, initDate, endDate ){
  
  const randomNumber = new Date().getMilliseconds();
  const currentStage = getStage(stage);
  const basePath = `${process.cwd()}/reports`;

  const degreePath = `${basePath}/${degree}`;

  if (!fs.existsSync(degreePath)){
    fs.mkdirSync(degreePath);
  }
  
  const documentName = `report-${currentStage}-${initDate}-${randomNumber}.docx`;

  return {
    documentName,
    folder: degree
  }

}
module.exports = {
  generateDocument
}