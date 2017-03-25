describe("parse", function(){
	//var parser =  new Parser();
	it("parses '(a∨(b∨c)(d∨e)∨f)(g∨h)' into two blocks:'(a∨(b∨c)(d∨e)∨f)', '(g∨h)'", function(){
		var blocks = Parser.parse("(a∨(b∨c)(d∨e)∨f)(g∨h)");
		assert.equal(blocks[0], "(a∨(b∨c)(d∨e)∨f)");
		assert.equal(blocks[1], "(g∨h)");
	});
	it("parses 'a∨(b∨c)(d∨e)∨f' into 4 blocks:", function(){
		var blocks = Parser.parse("a∨(b∨c)(d∨e)∨f");
		assert.equal(blocks[0], "a");
		assert.equal(blocks[1], "(b∨c)");
		assert.equal(blocks[2], "(d∨e)");
		assert.equal(blocks[3], "f");
	});
	it("parses '(a∨(b∨c)(d∨e)∨f)∨(g∨h)' into two blocks:'(a∨(b∨c)(d∨e)∨f)', '(g∨h)'", function(){
		var blocks = Parser.parse("(a∨(b∨c)(d∨e)∨f)∨(g∨h)");
		assert.equal(blocks[0], "(a∨(b∨c)(d∨e)∨f)");
		assert.equal(blocks[1], "(g∨h)");
	});
	it("parses '{a∨b}{c}∨(d∨(e∨f)∨g)h∨i'", function(){
		var blocks = Parser.parse("{a∨b}{c}∨(d∨(e∨f)∨g)h∨i");
		assert.equal(blocks[0], "{a∨b}");
		assert.equal(blocks[1], "{c}");
		assert.equal(blocks[2], "(d∨(e∨f)∨g)");
		assert.equal(blocks[3], "h");
		assert.equal(blocks[4], "i");
	});
	it("parses '{a∨bcc}∨ghi'", function(){
		var blocks = Parser.parse("{a∨bcc}ghi");
		assert.equal(blocks[0], "{a∨bcc}");
		assert.equal(blocks[1], "ghi");
	});
})