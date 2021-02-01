const { 
  getGradeNameByNumber,
  getShortDenominationStage,
  generateTableHeader,
  generateTableRow,
  generateSyllabusRow
} = require('../../../components/report/reportUtils');

describe('Tests inside reportUtils.js file', () => {
  
  describe('Cases inside getGradeNameByNumber function', () => {
    
    test('When permited grade number is specified, should return the correct grade name', () => {
      
      const permitedGradeNumber = 2;
      
      const gradeName = getGradeNameByNumber(permitedGradeNumber);
      
      expect(gradeName).toBe('Segundo');
    });

    test('When not permited grade number is specified, should return undefined', () => {

      const notPermitedGradeNUmber = 20;
      
      const gradeName = getGradeNameByNumber(notPermitedGradeNUmber);
      
      expect(gradeName).toBeUndefined();
    });
  });

  describe('Cases inside getStage function', () => {
    
    test('When stage is middle stage, should return MITAD', () => {
      
      const middleStage = 'Mitad de ciclo';
      
      const shorStageDenomination = getShortDenominationStage(middleStage);

      expect(shorStageDenomination).toBe('MITAD');

    });

    test('When stage is final stage, should return FINAL', () => {
      
      const middleStage = 'Final de ciclo';
      
      const shorStageDenomination = getShortDenominationStage(middleStage);

      expect(shorStageDenomination).toBe('FINAL');

    });
    
    test('When stage is any stage, should return FINAL', () => {
      
      const middleStage = 'ANY STAGE';
      
      const shorStageDenomination = getShortDenominationStage(middleStage);

      expect(shorStageDenomination).toBe('FINAL');

    });
  });
  
  describe('Cases inside generateTableHeader function', () => {
    
    test('When call this function, should return a Table row only with one cell', () => {
      
      const expectedTableRowTitle = 'No matter the content';
      const columnExpandedSize = 1;

      const tableHeaderRow = generateTableHeader(expectedTableRowTitle, columnExpandedSize);

      expect(tableHeaderRow.options.children).toHaveLength(1);

    });

  });

  describe('Cases inside generateTableRow function', () => {
    
    test('When array is specified, should return a tableRow with the same childrens size that the array size', () => {

      const childrenArray = [
        { content: 'No matter the content' },
        { content: 'No matter the content' },
        { content: 'No matter the content' },
        { content: 'No matter the content' },
        { content: 'No matter the content' },
      ];

      const tableRow = generateTableRow(childrenArray);

      expect(tableRow.options.children).toHaveLength(childrenArray.length);
    });
    

    test('When an empty array is specified, should return a tableRow with any childrens', () => {

      const childrenArray = [];

      const tableRow = generateTableRow(childrenArray);

      expect(tableRow.options.children).toHaveLength(childrenArray.length);
    });

  });
  
  describe('Cases inside generateSyllabusRow', () => {

    let gradeNumber;
    let alternativesSize;
    let defaultItemsAmount;

    beforeEach(() => {
      gradeNumber = 10;
      alternativesSize = 3;
      defaultItemsAmount = 3;
    });

    test('When syllabuses array is specified, should return a tableRow with the amount of syllabuses length plus Three default items', () => {

      const syllabuses = [
        {denomination: 'No matter the content'},
        {denomination: 'No matter the content'},
        {denomination: 'No matter the content'},
        {denomination: 'No matter the content'},
      ];
      
      const syllabusRow = generateSyllabusRow(gradeNumber, syllabuses, alternativesSize);

      expect(syllabusRow.options.children).toHaveLength(syllabuses.length + defaultItemsAmount);
    });

    test('When syllabuses is specified empty, should return a tableRow with the amount of Three default items', () => {

      const syllabuses = [];
      
      const syllabusRow = generateSyllabusRow(gradeNumber, syllabuses, alternativesSize);

      expect(syllabusRow.options.children).toHaveLength(defaultItemsAmount);
    });

    test('When attributes are not specified, should return a tableRow with the amount of Three default items', () => {

      const syllabusRow = generateSyllabusRow();

      expect(syllabusRow.options.children).toHaveLength(defaultItemsAmount);
    });
  });
  
  
  


  


});
