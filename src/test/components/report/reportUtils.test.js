const {
  getGradeNameByNumber,
  getShortDenominationStage,
  generateTableHeader,
  generateTableRow,
  generateSyllabusRow,
  generateTeachersRow,
  generateTitleQuestionRow,
  prepareIndicatorsData,
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
        { denomination: 'No matter the content' },
        { denomination: 'No matter the content' },
        { denomination: 'No matter the content' },
        { denomination: 'No matter the content' },
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

  describe('Cases inside generateTeachersRow', () => {
    const syllabuses = [
      {
        teacher: {
          name: 'No matter',
        },
      },
      {
        teacher: {
          name: 'No matter',
        },
      },
      {
        teacher: {
          name: 'No matter',
        },
      },
    ];

    const alternatives = [
      { description: 'No matter description' },
      { description: 'No matter description' },
      { description: 'No matter description' },
      { description: 'No matter description' },
    ];

    test('When syllabuses and alternatives are provided correctly', () => {
      const teachersRow = generateTeachersRow(syllabuses, alternatives);

      const teachersRowSize = teachersRow.options.children;

      expect(teachersRowSize).toHaveLength(syllabuses.length + (alternatives.length * 2));
    });

    test('When syllabuses and alternatives are not provided', () => {
      const teachersRow = generateTeachersRow();

      const teachersRowSize = teachersRow.options.children;

      expect(teachersRowSize).toHaveLength(0);
    });

    test('When only syllabuses is provided', () => {
      const teachersRow = generateTeachersRow(syllabuses);

      const teachersRowSize = teachersRow.options.children;

      expect(teachersRowSize).toHaveLength(syllabuses.length);
    });
  });

  describe('Cases inside generateTitleQuestionRow', () => {
    test('When syllabusSize is 4 and alternativesSize are 3 should return a table row with 8 cells', () => {
      const syllabusSize = 4;
      const alternativesSize = 3;
      const parallel = 'No matter';

      const titleQuestionRow = generateTitleQuestionRow(parallel, syllabusSize, alternativesSize);

      expect(titleQuestionRow.options.children).toHaveLength(8);
    });

    test('When parallel is undefined, everything works correctly', () => {
      const syllabusSize = 4;
      const alternativesSize = 3;
      const parallel = undefined;

      const titleQuestionRow = generateTitleQuestionRow(parallel, syllabusSize, alternativesSize);

      expect(titleQuestionRow.options.children).toHaveLength(8);
    });
  });

  describe('Cases inside prepareIndicatorsData', () => {
    const questions = [
      {
        persistenceId: 5,
        description: 'Question number one',
      },
      {
        persistenceId: 6,
        description: 'Question number two',
      },
      {
        persistenceId: 7,
        description: 'Question number three',
      },
    ];

    const syllabuses = [
      {
        denomination: 'Control Automatizado Asistido por computador',
        sheets: [
          {
            answers: [
              {
                persistenceId: 9,
                alternative: '5',
                persistenceVersion: 0,
                question: '5',
              },
              {
                persistenceId: 10,
                alternative: '5',
                persistenceVersion: 0,
                question: '6',
              },
              {
                persistenceId: 11,
                alternative: '5',
                persistenceVersion: 0,
                question: '7',
              },
            ],
          },
          {
            answers: [
              {
                persistenceId: 12,
                alternative: '5',
                persistenceVersion: 0,
                question: '5',
              },
              {
                persistenceId: 13,
                alternative: '5',
                persistenceVersion: 0,
                question: '6',
              },
              {
                persistenceId: 14,
                alternative: '7',
                persistenceVersion: 0,
                question: '7',
              },
              {
                persistenceId: 50,
                alternative: '7',
                persistenceVersion: 0,
                question: 'percentage',
              },
            ],
          },
        ],
      },
      {
        denomination: 'Sistemas Expertos',
        sheets: [
          {
            answers: [
              {
                persistenceId: 9,
                alternative: '5',
                persistenceVersion: 0,
                question: '5',
              },
              {
                persistenceId: 10,
                alternative: '5',
                persistenceVersion: 0,
                question: '6',
              },
              {
                persistenceId: 11,
                alternative: '5',
                persistenceVersion: 0,
                question: '7',
              },
            ],
          },
          {
            answers: [
              {
                persistenceId: 9,
                alternative: '5',
                persistenceVersion: 0,
                question: '5',
              },
              {
                persistenceId: 10,
                alternative: '5',
                persistenceVersion: 0,
                question: '6',
              },
              {
                persistenceId: 11,
                alternative: '5',
                persistenceVersion: 0,
                question: '7',
              },
              {
                persistenceId: 50,
                alternative: '7',
                persistenceVersion: 0,
                question: 'percentage',
              },
            ],
          },
        ],
      },
    ];

    const alternatives = [
      {
        persistenceId: 5,
        description: 'YES',
        persistenceVersion: 0,
      },
      {
        persistenceId: 6,
        description: 'NO',
        persistenceVersion: 0,
      },
      {
        persistenceId: 7,
        description: 'IN PART',
        persistenceVersion: 0,
      },
    ];

    const stage = 'Mitad de Ciclo';

    test('When questions size is 3, allrows returnes should be 3 too.', () => {
      const { allRows } = prepareIndicatorsData(questions, syllabuses, alternatives, stage);

      expect(allRows).toHaveLength(questions.length);
    });

    test('When syllabuses size is 2 and alternatives size is 3, allrows have childs with 9 elements.', () => {
      const { allRows } = prepareIndicatorsData(questions, syllabuses, alternatives, stage);

      for (let index = 0; index < questions.length; index += 1) {
        expect(allRows[index]).toHaveLength(alternatives.length * 2 + syllabuses.length + 1);
      }
    });

    test('When all indicators has YES options with each syllabus, yes counter should be the amount of syllabuses for each indicator', () => {
      const { allRows } = prepareIndicatorsData(questions, syllabuses, alternatives, stage);

      for (let index = 0; index < questions.length; index += 1) {
        expect(allRows[index][syllabuses.length + 1]).toBe(syllabuses.length.toString());
        expect(allRows[index][syllabuses.length + 2]).toBe('0');
        expect(allRows[index][syllabuses.length + 3]).toBe('0');
      }
    });

    test('When questions are provided, each array inside allRows at first position should be the same that the question', () => {
      const { allRows } = prepareIndicatorsData(questions, syllabuses, alternatives, stage);

      for (let index = 0; index < questions.length; index += 1) {
        expect(allRows[index][0]).toBe(`${index + 1}. ${questions[index].description}`);
      }
    });
  });
});
