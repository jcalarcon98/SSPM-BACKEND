const docx = require("docx");
const fs = require("fs");
const path = require("path");
const util = require("util");

const { Document, Packer, Paragraph, Table, TableCell, TableRow,  Media, AlignmentType, HeadingLevel, TextRun} = docx;

async function generateDocument({ period }) {
  
  const { stage, questions, alternative, evaluationGrades: grades} = period;
  const children = [];

  grades.forEach(({ syllabuses, parallel, number}) => {

    const text = `${getGradeNameByNumber(number)} Ciclo "${parallel}"`;

    const paragraph = new Paragraph({
      children: [new TextRun({
        text,
        bold: true,
        size: 30
      })]
    });

    const tableGrade = generateTable(syllabuses, parallel, number, alternative, stage);
    
    children.push(paragraph, tableGrade);
  });
  
  const document = new Document();

  document.addSection({
    children
  });

  const buffer =  await Packer.toBuffer(document);
  fs.writeFileSync("document.docx", buffer);
  //TODO: Fix path.
  const documentPath =  path.join(__dirname + '/document.docx');

  return documentPath;
}

function generateTable(syllabuses, parallel, number, alternatives, stage) {

  const alternativesSize = alternatives.length;
  /**
   * To understand this -> verify Table header. 
   * Alternatives repeat two times (*2)
   * Each grade syllabus
   * 1 => First column title (Séptimo, Octavo ciclo);
   */
  const tableRows = [];
  const tableHeaderColumnSpan = alternativesSize * 2 + syllabuses.length + 1;
  const tableHeader = generateTableHeader(stage, tableHeaderColumnSpan);
  const syllabusRow = generateSyllabusRow(number, syllabuses, alternativesSize);
  const teachersRow=  generateTeachersRow(syllabuses, alternatives);

  tableRows.push(tableHeader, syllabusRow, teachersRow);

  const table = new Table({
    rows: tableRows
  });    

  return table;
}

function generateTableHeader (stage, columnSpan){ 
  
  const headerTitle =  `APLICACIÓN A ${ getStage(stage) } DEL PERÍODO ACADÉMICO`;

  const tableHeader = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph(headerTitle)],
        columnSpan
      })
    ]
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

/**
 * childrenArray : { content, rowSpan, columnSpan}
 * @param {*} childrenArray 
 */
function generateTableRow( childrenArray ){
  
  const children = [];

  childrenArray.forEach(child => {
    
    const currentTableCell = new TableCell({
      children: [new Paragraph(child.content)],
      rowSpan: child.rowSpan ? child.rowSpan : 1,
      columnSpan: child.columnSpan ? child.columnSpan: 1
    })

    children.push(currentTableCell);

  });

  const tableRow = new TableRow({
    children
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

module.exports = {
  generateDocument
}