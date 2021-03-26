
describe("Testing", function() {
    var spell_check = require('../lib/jasmine_examples/spell_check');
    var sent = require('../lib/jasmine_examples/sentiment');
    var repl = require('../lib/jasmine_examples/pos');

  
    it("Passed the spell-checking function ", function() {
        expect(spell_check("My namesae is John")).toEqual("My namesake is John");
    });

    it("Passed the sentiment analysis function", function() {
      var temp = ["Good for you","Bad for you","Satisfactory for you"]
      console.log();
      expect(sent.process(temp)).toEqual([ 'Satisfactory for you', 'Bad for you', 'Good for you' ])
    });
  
    it("Passed the processing replace function", async function(){
      text = await repl.process("The weather today is preposterous");
      expect(spell_check("The weather now is preposterous")).toEqual(text);
    });
 
  });