describe("parse", function(){
	//var parser =  new Parser();
	it("parses '(a∨(b∨c)(d∨e)∨f)(g∨h)' into two blocks:'(a∨(b∨c)(d∨e)∨f)', '(g∨h)'", function(){
		var blocks = Parser.parse(Expression.toArray("(a∨(b∨c)(d∨e)∨f)(g∨h)"));
		assert.equal(Expression.toString(blocks[0].subexpression), "(a∨(b∨c)(d∨e)∨f)");
		assert.equal(Expression.toString(blocks[1].subexpression), "(g∨h)");
	});
	it("parses 'a∨(b∨c)(d∨e)∨f' into 4 blocks:", function(){
		var blocks = Parser.parse(Expression.toArray("a∨(b∨c)(d∨e)∨f"));
		assert.equal(Expression.toString(blocks[0].subexpression), "a");
		assert.equal(Expression.toString(blocks[1].subexpression), "(b∨c)");
		assert.equal(Expression.toString(blocks[2].subexpression), "(d∨e)");
		assert.equal(Expression.toString(blocks[3].subexpression), "f");
	});
	it("parses '(a∨(b∨c)(d∨e)∨f)∨(g∨h)' into two blocks:'(a∨(b∨c)(d∨e)∨f)', '(g∨h)'", function(){
		var blocks = Parser.parse(Expression.toArray("(a∨(b∨c)(d∨e)∨f)∨(g∨h)"));
		assert.equal(Expression.toString(blocks[0].subexpression), "(a∨(b∨c)(d∨e)∨f)");
		assert.equal(Expression.toString(blocks[1].subexpression), "(g∨h)");
	});
	it("parses '{a∨b}{c}∨(d∨(e∨f)∨g)h∨i'", function(){
		var blocks = Parser.parse(Expression.toArray("{a∨b}{c}∨(d∨(e∨f)∨g)h∨i"));
		assert.equal(Expression.toString(blocks[0].subexpression), "{a∨b}");
		assert.equal(Expression.toString(blocks[1].subexpression), "{c}");
		assert.equal(Expression.toString(blocks[2].subexpression), "(d∨(e∨f)∨g)");
		assert.equal(Expression.toString(blocks[3].subexpression), "h");
		assert.equal(Expression.toString(blocks[4].subexpression), "i");
	});
	it("parses '{a∨bcc}∨ghi'", function(){
		var blocks = Parser.parse(Expression.toArray("{a∨bcc}ghi"));
		assert.equal(Expression.toString(blocks[0].subexpression), "{a∨bcc}");
		assert.equal(Expression.toString(blocks[1].subexpression), "g");
		assert.equal(Expression.toString(blocks[2].subexpression), "h");
		assert.equal(Expression.toString(blocks[3].subexpression), "i");
	});
});

describe("Structure.indexPlaces(...)", function(){
	it("marks all the places in the expression '(a{a∨ab}{ab}c{c}∨b{ab}c{c∨d})'", function(){
		var struct = new Structure(Expression.toArray("(a{a∨ab}{ab}c{c}∨b{ab}c{c∨d})"));
		Structure.indexPlaces(struct);

		var arr = Structure.getBasicComponents(struct);

		assert.equal(compareArrays(arr[0].premain, [0]), true);//a
		assert.equal(compareArrays(arr[1].premain, [1, 2, 4]), true);//{a
		assert.equal(compareArrays(arr[2].premain, [1, 2, 4]), true);//∨a
		assert.equal(compareArrays(arr[3].premain, [3]), true);//b}
		assert.equal(compareArrays(arr[4].premain, [1, 2, 4, 6]), true);//{a
		assert.equal(compareArrays(arr[5].premain, [5]), true);//b}
		assert.equal(compareArrays(arr[6].premain, [1, 2, 4, 6]), true);//c
		assert.equal(compareArrays(arr[7].premain, [7, 8]), true);//{c}
		assert.equal(compareArrays(arr[8].premain, [0]), true);//∨b
		assert.equal(compareArrays(arr[9].premain, [9, 11]), true);//{a
		assert.equal(compareArrays(arr[10].premain, [10]), true);//b}
		assert.equal(compareArrays(arr[11].premain, [9, 11]), true);//c
		assert.equal(compareArrays(arr[12].premain, [12, 13, 14]), true);//{c
		assert.equal(compareArrays(arr[13].premain, [12, 13, 14]), true);//∨d}
	});
	it("marks all the places in the expression '({a∨bcc}ghi)'", function(){
		var struct = new Structure(Expression.toArray("({a∨bcc}ghi)"));
		Structure.indexPlaces(struct);

		var arr = Structure.getBasicComponents(struct);

		assert.equal(compareArrays(arr[0].premain, [0, 1, 4]), true);//{a
		assert.equal(compareArrays(arr[1].premain, [0, 1, 4]), true);//∨b
		assert.equal(compareArrays(arr[2].premain, [2]), true);//c
		assert.equal(compareArrays(arr[3].premain, [3]), true);//c}
		assert.equal(compareArrays(arr[4].premain, [0, 1, 4]), true);//g
		assert.equal(compareArrays(arr[5].premain, [5]), true);//h
		assert.equal(compareArrays(arr[6].premain, [6]), true);//i
	});
	it("marks all the places in the expression '(a∨(b∨c)(d∨e)∨f)(g∨h)'", function(){
		var struct = new Structure(Expression.toArray("((a∨(b∨c)(d∨e)∨f)(g∨h))"));
		Structure.indexPlaces(struct);

		var arr = Structure.getBasicComponents(struct);

		assert.equal(compareArrays(arr[0].premain, [0]), true);//(a
		assert.equal(compareArrays(arr[1].premain, [0]), true);//∨(b
		assert.equal(compareArrays(arr[2].premain, [0]), true);//∨c)
		assert.equal(compareArrays(arr[3].premain, [2, 3]), true);//(d
		assert.equal(compareArrays(arr[4].premain, [2, 3]), true);//∨e)
		assert.equal(compareArrays(arr[5].premain, [0]), true);//∨f)
		assert.equal(compareArrays(arr[6].premain, [1, 4, 5, 6]), true);//(g
		assert.equal(compareArrays(arr[7].premain, [1, 4, 5, 6]), true);//∨h)
	});
	it("marks all the places in the expression '{a∨(b∨c)(d∨e)∨f}(g∨h)'", function(){
		var struct = new Structure(Expression.toArray("({a∨(b∨c)(d∨e)∨f}(g∨h))"));
		Structure.indexPlaces(struct);

		var arr = Structure.getBasicComponents(struct);

		assert.equal(compareArrays(arr[0].premain, [0, 1, 4, 5, 6]), true);//{a
		assert.equal(compareArrays(arr[1].premain, [0, 1, 4, 5, 6]), true);//∨(b
		assert.equal(compareArrays(arr[2].premain, [0, 1, 4, 5, 6]), true);//∨c)
		assert.equal(compareArrays(arr[3].premain, [2, 3]), true);//(d
		assert.equal(compareArrays(arr[4].premain, [2, 3]), true);//∨e)
		assert.equal(compareArrays(arr[5].premain, [0, 1, 4, 5, 6]), true);//∨f}
		assert.equal(compareArrays(arr[6].premain, [0, 1, 4, 5, 6]), true);//(g
		assert.equal(compareArrays(arr[7].premain, [0, 1, 4, 5, 6]), true);//∨h)
	});
	it("marks all the places in the expression '{a∨b}{c}∨(d∨(e∨f)∨g)h∨i'", function(){
		var struct = new Structure(Expression.toArray("({a∨b}{c}∨(d∨(e∨f)∨g)h∨i)"));
		Structure.indexPlaces(struct);

		var arr = Structure.getBasicComponents(struct);

		assert.equal(compareArrays(arr[0].premain, [0, 1, 2]), true);//{a
		assert.equal(compareArrays(arr[1].premain, [0, 1, 2]), true);//∨b}
		assert.equal(compareArrays(arr[2].premain, [0, 1, 2, 3]), true);//{c}
		assert.equal(compareArrays(arr[3].premain, [0]), true);//∨(d
		assert.equal(compareArrays(arr[4].premain, [0]), true);//∨(e
		assert.equal(compareArrays(arr[5].premain, [0]), true);//∨f)
		assert.equal(compareArrays(arr[6].premain, [0]), true);//∨g)
		assert.equal(compareArrays(arr[7].premain, [4, 5, 6, 7]), true);//h
		assert.equal(compareArrays(arr[8].premain, [0]), true);//∨i)
	});

	it("marks all the places in the expression '(a∨b∨((a∨b∨c)∨(a∨b∨c)(a∨b∨c)∨(a∨b∨c)(a∨b∨c)(a∨b∨c)))'", function(){
		var struct = new Structure(Expression.toArray("(a∨b∨((a∨b∨c)∨(a∨b∨c)(a∨b∨c)∨(a∨b∨c)(a∨b∨c)(a∨b∨c)))"));
		Structure.indexPlaces(struct);

		var arr = Structure.getBasicComponents(struct);

		assert.equal(compareArrays(arr[0].premain, [0]), true);
		assert.equal(compareArrays(arr[1].premain, [0]), true);
		assert.equal(compareArrays(arr[2].premain, [0]), true);
		assert.equal(compareArrays(arr[3].premain, [0]), true);
		assert.equal(compareArrays(arr[4].premain, [0]), true);
		assert.equal(compareArrays(arr[5].premain, [0]), true);
		assert.equal(compareArrays(arr[6].premain, [0]), true);
		assert.equal(compareArrays(arr[7].premain, [0]), true);
		assert.equal(compareArrays(arr[8].premain, [6, 7, 8]), true);
		assert.equal(compareArrays(arr[9].premain, [6, 7, 8]), true);
		assert.equal(compareArrays(arr[10].premain, [6, 7, 8]), true);
		assert.equal(compareArrays(arr[11].premain, [0]), true);
		assert.equal(compareArrays(arr[12].premain, [0]), true);
		assert.equal(compareArrays(arr[13].premain, [0]), true);
		assert.equal(compareArrays(arr[14].premain, [12, 13, 14]), true);
		assert.equal(compareArrays(arr[15].premain, [12, 13, 14]), true);
		assert.equal(compareArrays(arr[16].premain, [12, 13, 14]), true);
		assert.equal(compareArrays(arr[17].premain, [15, 16, 17]), true);
		assert.equal(compareArrays(arr[18].premain, [15, 16, 17]), true);
		assert.equal(compareArrays(arr[19].premain, [15, 16, 17]), true);

	});
});

describe("Structure.minimizeRegex(...)", function(){
	it("minimizes '(a{a∨ab}{ab}c{c}∨b{ab}c{c})'", function(){
		var struct = new Structure(Expression.toArray("(a{a∨ab}{ab}c{c}∨b{ab}c{c})"));
		Structure.indexPlaces(struct);
		Structure.minimizeRegex(struct);

		var arr = Structure.getBasicComponents(struct);

		assert.equal(arr[0].postmain[0], 1);
		assert.equal(arr[1].postmain[0], 2);
		assert.equal(arr[2].postmain[0], 2);
		assert.equal(arr[3].postmain[0], 3);
		assert.equal(arr[4].postmain[0], 4);
		assert.equal(arr[5].postmain[0], 5);
		assert.equal(arr[6].postmain[0], 6);
		assert.equal(arr[7].postmain[0], 7);
		assert.equal(arr[8].postmain[0], 8);
		assert.equal(arr[9].postmain[0], 9);
		assert.equal(arr[10].postmain[0], 10);
		assert.equal(arr[11].postmain[0], 11);
		assert.equal(arr[12].postmain[0], 12);
	});

	it("minimizes '({a∨ab∨akb}{c}cd)'", function(){
		var struct = new Structure(Expression.toArray("({a∨ab∨akb}{c}cd)"));
		Structure.indexPlaces(struct);
		Structure.minimizeRegex(struct);

		var arr = Structure.getBasicComponents(struct);

		assert.equal(arr[0].postmain[0], 1);
		assert.equal(arr[1].postmain[0], 1);
		assert.equal(arr[2].postmain[0], 2);
		assert.equal(arr[3].postmain[0], 1);
		assert.equal(arr[4].postmain[0], 3);
		assert.equal(arr[5].postmain[0], 4);
		assert.equal(arr[6].postmain[0], 5);
		assert.equal(arr[7].postmain[0], 5);
		assert.equal(arr[8].postmain[0], 6);
	});

	it("minimizes '({a∨ab∨abb}{c}cd)'", function(){
		var struct = new Structure(Expression.toArray("({a∨ab∨abb}{c}cd)"));
		Structure.indexPlaces(struct);
		Structure.minimizeRegex(struct);

		var arr = Structure.getBasicComponents(struct);
		arr.forEach(function(item){
			console.log(item.value, item.premain);
		});

		assert.equal(arr[0].postmain[0], 1);
		assert.equal(arr[1].postmain[0], 1);
		assert.equal(arr[2].postmain[0], 2);
		assert.equal(arr[3].postmain[0], 1);
		assert.equal(arr[4].postmain[0], 2);
		assert.equal(arr[5].postmain[0], 3);
		assert.equal(arr[6].postmain[0], 4);
		assert.equal(arr[7].postmain[0], 4);
		assert.equal(arr[8].postmain[0], 5);
	});

	it("minimizes '(ab{b∨a}b{c∨a}∨b{b}a)'", function(){
		var struct = new Structure(Expression.toArray("(ab{b∨a}b{c∨a}∨b{b}a)"));
		Structure.indexPlaces(struct);
		Structure.minimizeRegex(struct);

		var arr = Structure.getBasicComponents(struct);


		assert.equal(arr[0].postmain[0], 1);
		assert.equal(arr[1].postmain[0], 2);
		assert.equal(arr[2].postmain[0], 3);
		assert.equal(arr[3].postmain[0], 4);
		assert.equal(arr[4].postmain[0], 3);
		assert.equal(arr[5].postmain[0], 5);
		assert.equal(arr[6].postmain[0], 6);
		assert.equal(arr[7].postmain[0], 7);
		assert.equal(arr[8].postmain[0], 8);
		assert.equal(arr[9].postmain[0], 9);
	});
});

describe("Structure.compareArrays(arr1, arr2)", function(){
	it("compares two arrays [4, 5, 6, 7, 7] and [4, 4, 5, 6, 7] that are not equal", function(){
		var expected = false;
		assert.equal(expected, Structure.compareArrays([4, 5, 6, 7, 7], [4, 4, 5, 6, 7]));
	});
	it("compares two arrays [3] and [3] that are equal", function(){
		var expected = true;
		assert.equal(expected, Structure.compareArrays([3], [3]));
	});
	it("compares two arrays [3] and [4] that are not equal", function(){
		var expected = false;
		assert.equal(expected, Structure.compareArrays([3], [4]));
	});
});

function compareArrays(array1, array2){

	for(let i = 0; i < array1.length; i++){

		var exists = false;
		for(let q = 0; q < array2.length; q++){
			if(array1[i] == array2[q]){
				exists = true;
				break;
			}
		}

		if(!exists){
			return false;
		}
	}

	return true;
}