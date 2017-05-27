/**
*Represents the most basic structure of regular expression
*@params {string} symbol represents some value of this basic structure
*
*/
class Basic{
	constructor(symbol){
		this.item = elem;
	}
}
var bracketsTypes = {
	string: {name: "none", value: 0},
	curly: {name: "curly", value: 1},
	rounded: {name: "rounded", value: 2},
	basic: {name: "basic", value: 3},
}
class Structure{

	constructor(expression){
		this.bracketsType = this.defineType(expression);

		this.components = [];
		this.premain = [];
		this.postmain = [];
		if(this.bracketsType == bracketsTypes.basic){
			this.value = expression[0];//leaf
			this.endPlace = false;
			return;
		}
		
		if(this.bracketsType == bracketsTypes.curly || this.bracketsType == bracketsTypes.rounded){
			expression = Parser._subexpression(expression, {start: 1, end: expression.length-1}, {rounded:0, curly:0});
		}

		var parsedComponents = Parser.parse(expression);

		for(let i = 0; i < parsedComponents.length; i++){
			var temp = Expression.toString(parsedComponents[i].subexpression);
				this.components[this.components.length] = {
					child: new Structure(parsedComponents[i].subexpression),
					logicalOperationType: parsedComponents[i].logicalOperationType,
				};
		}
	}

	static buildTransitionMatrix(struct){
		var arr = this.getBasicComponents(struct);
		var dictionary = this._getDictionary(arr);
		var transitionMatrix = [];
		
		var columnsAmount = arr[arr.length-1].postmain[0];
		for(let i = 0; i < dictionary.length; i++){
			transitionMatrix[i] = new Array(columnsAmount);
		}

		for(let i = 0; i < arr.length; i++){

			var symbol = arr[i].value;
			var index = this._getIndexBySymbolInDictionary(dictionary, symbol);

			

			/*for(let q = 0; q < arr[i].premain.length; q++){
				this._push(transitionMatrix[index][i].states, [arr[i].postmain[0]]);	
			}*/

			arr[i].premain.forEach(function(item){
				if(transitionMatrix[index][item] === undefined){
					transitionMatrix[index][item] = {
						states: [],
					};
				}
				Structure._push(transitionMatrix[index][item].states, [arr[i].postmain[0]]); 
			});
		}

		var sygnals = [];
		sygnals[0] = "start";
		var amount = 1;
		for(let i = 0; i < arr.length; i++){

			if(arr[i].postmain[0] >= amount && arr[i].endPlace){
				//sygnals[i] = "end";
				sygnals[amount] = "end";
				amount++;
			}else if(arr[i].postmain[0] >= amount && !arr[i].endPlace){
				//sygnals[i] = "working";
				sygnals[amount] = "working";
				amount++;
			}
		}

		return {
			matrix: transitionMatrix,
			sygnals: sygnals,
		};
	}

	static _getIndexBySymbolInDictionary(dictionary, symbol){

		for(let i = 0; i < dictionary.length; i++){
			var currentSymbol = dictionary[i].value;
			if(dictionary[i].symbol.value == symbol.value){
				return i;
			}
		}
	}

	/**
	 * minimizes Regular expression
	 * @param  {Structure} struct 
	 * @return {nothing}        	doesn't return anything
	 */
	static minimizeRegex(struct, mask){

		if(mask === undefined){
			mask = [];
		}
		/*if(time === undefined){
			time = 0;
		}
		time++;*/

		var arr = this.getBasicComponents(struct);
		var dictionary = this._getDictionary(arr);

		for(let i = 0; i < arr.length; i++){
			arr[i].order = i;
		}
		var again = false;
		dictionary.forEach(function(symbol){
			
			var indexes = [];
			for(let q = 0; q < symbol.components.length-1; q++){

				if(Structure._hasNumber(indexes, q)){
					continue;
				}
				let currentIndexes = new Array();
				currentIndexes.push(symbol.components[q].postmain[0]);

				for(let t = q+1; t < symbol.components.length; t++){
					
					if(Structure.compareArrays(symbol.components[q].premain, symbol.components[t].premain)){
						
						if(symbol.components[q].postmain[0] != symbol.components[t].postmain[0]){
							
							//if(!Structure._hasNumber(mask, symbol.components[q].order)){
								indexes.push(t);
								again = true;
								currentIndexes.push(symbol.components[t].postmain[0]);
							//}
						}
					}
				}
				if(symbol.symbol.value == "!"){
					var k = 0;
				}
				if(currentIndexes.length > 1){
					let postmain = currentIndexes[1]-1;
					
					var variable = 0, oldPlace, newPlace;

					var p;
					for(let t = 0; t < arr.length; t++){
						if(arr[t].postmain[0] == currentIndexes[1]){
							p = t;
							break;
						}
					}

					for(let t = p; t < arr.length; t++){

						if(Structure._hasNumber(mask, t)){
							continue;
						}

						if(Structure._hasNumber(currentIndexes, arr[t].postmain[0])){
							
							oldPlace = arr[t].postmain[0];
							newPlace = arr[t].postmain[0] = currentIndexes[0];
							Structure._rewritePlaces(arr, oldPlace, newPlace);
							variable++;
							Structure._push(mask, [t]);
							continue;
						}
						
						oldPlace = arr[t].postmain[0];
						newPlace = arr[t].postmain[0] = oldPlace - variable;	
						
						Structure._rewritePlaces(arr, oldPlace, newPlace);
					}
				}
			}
		});

		var endPostmainPlaces = [];
		arr.forEach(function(item){
			if(item.endPlace){
				Structure._push(endPostmainPlaces, item.postmain);
			}
		});

		arr.forEach(function(item){
			if(Structure._hasNumber(endPostmainPlaces, item.postmain[0])){
				item.endPlace = true;
			}
		});

		/*for(let i = 0; i < arr.length; i++){
			console.log(arr[i].value.value, arr[i].premain, arr[i].postmain);
		}*/
		//console.log(time);
		

		for(let t = 0; t < arr.length; t++){
			arr[t].premain = Structure.removeRepetitivePlaces(arr[t].premain);
		}
		if(again){
			Structure.minimizeRegex(struct, mask);
		}
	}

	static removeRepetitivePlaces(array){

		var set = [];
		for(let i = 0; i < array.length; i++){
			if(!Structure._hasNumber(set, array[i])){
				set.push(array[i]);
			}
		}

		return set;
	}

	static _rewritePlaces(symbolsArray, oldPlace, newPlace){

		symbolsArray.forEach(function(item){
							
			for(let g = 0; g < item.premain.length; g++){
				if(item.premain[g] == oldPlace){
					item.premain[g] = newPlace;
				}
				if(item.postmain[0] == oldPlace){
					item.postmain[0] = newPlace;
				}
			}
		});
	}

	static _rewritePlaces2(struct, oldPlace, newPlace){
		
		for(let g = 0; g < struct.premain.length; g++){
			if(struct.premain[g] == oldPlace){
				struct.premain[g] = newPlace;
			}
		}

		if(struct.bracketsType == bracketsTypes.basic){
			return;
		}

		for(let g = 0; g < struct.postmain.length; g++){
			if(struct.postmain[g] == oldPlace){
				struct.postmain[g] = newPlace;
			}
		}

		struct.components.forEach(function(item){
			Structure._rewritePlaces2(item.child, oldPlace, newPlace);
		})
	}

	static _hasNumber(array, number){
		
		for(let i = 0; i < array.length; i++){
			
			if(array[i] == number){
				return true;
			}
		}

		return false;
	}

	/**
	 * defines dictionary of a given structure
	 * @param  {Array} arr    		contains basic components of an expression in structure
	 * @return {Array}        		returns dictionary 
	 */
	static _getDictionary(arr){

		var dictionary = [];

		for(let i = 0; i < arr.length; i++){
			
			let symbol = undefined;
			for(let q = 0; q < dictionary.length; q++){

				let arrSymbol = arr[i].value;
				if(dictionary[q].symbol.value == arrSymbol.value){
					symbol = dictionary[q];
					break;
				}
			}

			if(symbol === undefined){
				dictionary.push({
					symbol: arr[i].value,
					components: new Array(arr[i]/*.premain*/),
				});
			}else{
				symbol.components.push(arr[i]/*.premain*/);
			}
		}

		return dictionary;
	}

	static compareArrays(array1, array2){

		if(array1.length != array2.length){
			return false;
		}

		function compareFunction(a, b){
			return a - b;
		}

		var arr1 = array1.sort(compareFunction);
		var arr2 = array2.sort(compareFunction)
		for(let i = 0; i < arr1.length; i++){

			if(arr1[i] != arr2[i]){
				return false;
			}
			/*var exists = false;
			for(let q = 0; q < arr2.length; q++){
				if(arr1[i] == arr2[q]){
					exists = true;
					break;
				}
			}

			if(!exists){
				return false;
			}*/
		}

		return true;
	}

	static indexPlaces(struct){
		this.markEndPlaces(struct);
		this._indexPlaces(struct);
		var startPlace = [0];
		this.markPlaces(struct, startPlace);//, struct.bracketsType);
	}

	static _indexPlaces(struct){
	
		var arr = this.getBasicComponents(struct);
	
		for(let i = 0; i < arr.length; i++){
			arr[i].postmain.push(i+1);
		}
	}

	static getBasicComponents(struct, array){
		
		if(array === undefined){
			array = [];
		}

		if(struct.bracketsType == bracketsTypes.basic){
			array[array.length] = struct;
			return array;
		}

		for(let i = 0; i < struct.components.length; i++){
			array = this.getBasicComponents(struct.components[i].child, array);
		}

		return array;
	}

	static _push(array, places){
		
		for(let i = 0; i < places.length; i++){

			let exists = false; 
			for(let q = 0; q < array.length; q++){
				
				if(places[i] == array[q]){
					exists = true;
					break;
				}
			}
			
			if(!exists){
				array.push(places[i]);
			}
		}

		return array;
	}

	static markPlaces(struct, places){//, parentBracketsType){
			/*IT DOESN'T WORK PROPERLY YET*/
			if(struct.bracketsType == bracketsTypes.basic){
				//if(struct.logicalOperationType == "disjunction"){
					this._push(struct.premain, places);

				//}
				return struct.postmain;
			}
				
			if(struct.bracketsType == bracketsTypes.rounded){//parentBracketsType
				
				var returnedPlaces = [];
				for(let i = 0; i < struct.components.length; i++){

					if(struct.components[i].logicalOperationType == "disjunction"){
						this._push(struct.components[i].child.premain, places);
					}
						returnedPlaces = this.markPlaces(struct.components[i].child, struct.components[i].child.premain);
						//, struct.components[i].child.bracketsType);
						if(i < struct.components.length-1){
							if(struct.components[i+1].logicalOperationType == "conjunction"){
								this._push(struct.components[i+1].child.premain, returnedPlaces);
							}
							if(struct.components[i+1].logicalOperationType == "disjunction"){
								this._push(struct.components[i].child.postmain, returnedPlaces);
							}
						}else{
							this._push(struct.components[i].child.postmain, returnedPlaces);
						}
					
				}

				var postmainPlaces = [];
				for(let i = 0; i < struct.components.length-1; i++){

					if(struct.components[i+1].logicalOperationType == "disjunction"){
						this._push(postmainPlaces, struct.components[i].child.postmain);
					}
				}

				//if(struct.components[0].logicalOperationType == "disjunction")
				this._push(postmainPlaces, struct.components[struct.components.length - 1].child.postmain);
				return postmainPlaces;

			}else if(struct.bracketsType == bracketsTypes.curly){//parentBracketsType

				for(let i = 0; i < struct.components.length; i++){

					if(struct.components[i].logicalOperationType == "disjunction"){
						this._push(struct.components[i].child.premain, places);
					}

					returnedPlaces = this.markPlaces(struct.components[i].child, struct.components[i].child.premain);
					//, struct.components[i].child.bracketsType);
					
					/*if(i < struct.components.length-1 && struct.components[i+1].logicalOperationType == "conjunction"){
						this._push(struct.components[i+1].child.premain, returnedPlaces);
					}*/
					if(i < struct.components.length-1){
						if(struct.components[i+1].logicalOperationType == "conjunction"){
							this._push(struct.components[i+1].child.premain, returnedPlaces);
						}
						if(struct.components[i+1].logicalOperationType == "disjunction"){
							this._push(struct.components[i].child.postmain, returnedPlaces);
						}
					}else{
						this._push(struct.components[i].child.postmain, returnedPlaces);
					}
				}

				var postmainPlaces = [];
				for(let i = 0; i < struct.components.length-1; i++){

					if(struct.components[i+1].logicalOperationType == "disjunction"){
						this._push(postmainPlaces, struct.components[i].child.postmain);
					}
				}

				this._push(postmainPlaces, struct.components[struct.components.length - 1].child.postmain);
				
				for(let i = 0; i < struct.components.length; i++){
					
					if(struct.components[i].logicalOperationType == "disjunction"){
						this._push(struct.components[i].child.premain, postmainPlaces);
						this.markPlaces(struct.components[i].child, postmainPlaces);//, struct.components[i].child.bracketsType);
					}
				}

				return struct.components[0].child.premain; 
			}
		}

	/**
	 * Marks end places
	 * @param  {Structure} struct structure where end places should be marked
	 */
	static markEndPlaces(struct){
		this._firstMarkingStep(struct);
		this._secondMarkingStep(struct);
	}

	static _firstMarkingStep(struct){
		if(struct.bracketsType ==  bracketsTypes.basic){
			struct.endPlace = true;
			return;
		}
		for(let i = 0; i < struct.components.length-1; i++){
			if(struct.components[i+1].logicalOperationType == "disjunction"){
				this._firstMarkingStep(struct.components[i].child);
			}
		}
		if(struct.components[0].logicalOperationType == "disjunction"){
			this._firstMarkingStep(struct.components[struct.components.length-1].child);
		}
	}

	static _secondMarkingStep(struct){

		for(let i = struct.components.length-2; i >=0; i--){

			if(struct.components[i+1].child.bracketsType == bracketsTypes.curly){

 				if(this._checkEndPlace(struct.components[i+1].child))
					this._firstMarkingStep(struct.components[i].child);
			}
		}
	}
	
	/**
	 * Checks if any child of recieved structure has end place
	 * @param  {Structure} struct strucure 
	 * @return {boolean}          returns true if some child of recieved structure has end place
	 */
	static _checkEndPlace(struct){

		if(struct.bracketsType ==  bracketsTypes.basic){
			if(struct.endPlace){
				return true;
			}
			return false;
		}

		for(let i = 0; i < struct.components.length; i++){
			var isEnd = this._checkEndPlace(struct.components[i].child);
			
			if(isEnd){
				return true;
			}
		}

		return false;
	}

	/**
	 * checks if the recieved expression has brackets in it
	 * @param  {string}  expression where function is trying to fin brackets
	 * @return {Boolean}            returns true if expression has brackets
	 */
	hasBrackets(expression){
		
		for(let i = 0; i < expression.length; i++){
			if(expression[i].value == "{" || expression[i].value == "("){
				return true;
			}
		}

		return false;
	}

	/**
	 * defines type of recieved expression
	 * @return {struct}          returns struct that represents the type of recieved expression
	 */
	defineType(expression){
		var brackets = {
			rounded: (expression[0].value == "{")?-1:0,
			curly: (expression[0].value == "(")?-1:0,
		}

		if(expression[0].value == "{" || expression[0].value == "("){
			for(let i = 0; i < expression.length; i++){
				switch(expression[i].value){
					case "{": brackets.curly++; break;
					case "}": brackets.curly--; break;
					case "(": brackets.rounded++; break;
					case ")": brackets.rounded--; break;
				}
			}
		}
			if(brackets.curly == -1){
				return bracketsTypes.rounded;
			}else if(brackets.rounded == -1){
				return bracketsTypes.curly;
			}else if(expression.length > 1){
				return bracketsTypes.string;
			}

			return bracketsTypes.basic;
		
	}
}

var signs = {
	disjunction: function(){
		return "∨";
	}
}

/**
 * class 
 */
class Expression{
	static toString(array){
		var newExpression = "";

		for(let i = 0; i < array.length; i++){
			newExpression += array[i].value;
		}

		return newExpression;
	}
	static toArray(string){
		var newExpression = [];
		for(let i = 0; i < string.length; i++){
			newExpression[i] = {
				value: string[i],
				lower: [],
				description: "",
				specialSymbol: false
			}
		}
		return newExpression;
	}
}
/**
*
*
*/
class Parser{

	/**
	 * parses the expression into blocks like {} or () or blocks,
	 * separated by conjunction sign
	 * @param  {array} expression expression that should be parsed
	 * @return {array}             parsed components
	 */
	static parse(expression){
		var brackets = {
			rounded: 0,
			curly: 0,
		}
		var indexes = {
			start: 0,
			end: 0
		}
		var components = [];

		for(let i = 0; i < expression.length; i++){
			
			if(this.equal(expression[i], "(")){
				brackets.rounded++;
				continue;
			}

			if(this.equal(expression[i], "{")){
				brackets.curly++;
				continue;
			}

			if(this.equal(expression[i], ")") || this.equal(expression[i], "}")){
				switch(expression[i].value){
					case ")": brackets.rounded--; break;
					case "}": brackets.curly--; break;
				}

				var subexpr;

				if(brackets.curly == 0 && brackets.rounded == 0){
					indexes.end = i+1;
					var logicalOperationType = this.defineLogicalOperationType(expression, indexes);
					subexpr = this._subexpression(expression, indexes, brackets);
					components[components.length] = {
						subexpression: subexpr,
						logicalOperationType: logicalOperationType,
						/*startIndex: indexes.start,
						endIndex: indexes.end*/
					};
					indexes.start = i+1;
				}
				continue;
			}

			if(this.equal(expression[i], signs.disjunction()) && brackets.rounded == 0 && brackets.curly == 0){
				indexes.end = i;
				
				if(indexes.end != indexes.start){
					components[components.length] = {
						subexpression: this._subexpression(expression, indexes, brackets),
						logicalOperationType: this.defineLogicalOperationType(expression, indexes),
						/*startIndex: indexes.start,
						endIndex: indexes.end	*/					
					};
					indexes.start = i;
				}else if(i < expression.length-1){
					if(!this.equal(expression[i+1], "{") && !this.equal(expression[i+1], "(")){
						indexes.end = i+2;
						components[components.length] = {
							subexpression: this._subexpression(expression, indexes, brackets),
							logicalOperationType: this.defineLogicalOperationType(expression, indexes),
							/*startIndex: indexes.start,
							endIndex: indexes.end	*/					
						};
						i++;//important!
						indexes.start = i+1;
					}
				}
				//indexes.start = i;
				continue;
			}

			if(brackets.rounded == 0 && brackets.curly == 0){
				indexes.end = i;
				components[components.length] = {
					subexpression: this._subexpression(expression, indexes, brackets),
					logicalOperationType: this.defineLogicalOperationType(expression, indexes),
					/*startIndex: indexes.start,
					endIndex: indexes.end	*/					
				};
				indexes.start = i+1;
			}
		}

		if(indexes.start < expression.length){
			indexes.end = expression.length;
			components[components.length] = {
				subexpression: this._subexpression(expression, indexes, {rounded: 0, curly: 0}),
				logicalOperationType: this.defineLogicalOperationType(expression, indexes),
				/*startIndex: indexes.start,
				endIndex: expression.length-1						*/
			};
		}

		for(let i = 0; i < components.length; i++){
			var length = components[i].subexpression.length;

			if(this.equal(components[i].subexpression[0], signs.disjunction())){
				components[i].subexpression = this._subexpression(components[i].subexpression, {start: 1, end: length}, {rounded: 0, curly: 0});
			}else if(this.equal(components[i].subexpression[length-1], signs.disjunction())){
				components[i].subexpression = this._subexpression(components[i].subexpression, {start: 0, end: length-1}, {rounded: 0, curly: 0});
			}
		}

		var newComponents = [];
		for(let i = 0; i < components.length; i++){
			//var temp = Expression.toString(components[i].subexpression)
			if(this.defineType(components[i].subexpression) == bracketsTypes.string){

				for(let q = 0; q < components[i].subexpression.length; q++){
					newComponents[newComponents.length] = {
						subexpression: new Array(components[i].subexpression[q]),
						logicalOperationType: (q == 0)?components[i].logicalOperationType: "conjunction",
					}
				}
			}else{
				newComponents[newComponents.length] = components[i];
			}
		}

		/*var expr = Expression.toString(expression);
		for(let i = 0; i < components.length; i++){
			var temp = Expression.toString(components[i].subexpression);
		}*/
		return newComponents;
	}

	/**
	 * defines type of recieved expression
	 * @return {struct}          returns struct that represents the type of recieved expression
	 */
	static defineType(expression){
		var brackets = {
			rounded: (expression[0].value == "{")?-1:0,
			curly: (expression[0].value == "(")?-1:0,
		}

		if(expression[0].value == "{" || expression[0].value == "("){
			for(let i = 0; i < expression.length; i++){
				switch(expression[i].value){
					case "{": brackets.curly++; break;
					case "}": brackets.curly--; break;
					case "(": brackets.rounded++; break;
					case ")": brackets.rounded--; break;
				}
			}
		}
		if(brackets.curly == -1){
			return bracketsTypes.curly;
		}else if(brackets.rounded == -1){
			return bracketsTypes.rounded;
		}else if(expression.length > 1){
			return bracketsTypes.string;
		}

		return bracketsTypes.basic;	
	}

	/**
	 * defines if expression element equals symbol
	 * @param  {struct} expressionElem single element of a whole expression
	 * @param  {string} symbol         some character
	 * @return {boolean}               returns true if equal
	 */
	static equal(expressionElem, symbol){

		if(expressionElem.value == symbol && expressionElem.specialSymbol == false){
			return true;
		}

		return false;
	}

	/**
	 * fucntion defines the logical operation type	
	 * @param  {string} expression 
	 * @param  {struct} indexes    contains start index and end index of distinguishing component
	 * @return {string}            logical operation type
	 */
	static defineLogicalOperationType(expression, indexes){
		
		if(indexes.start == 0){
			return "disjunction";
		}

		if(this.equal(expression[indexes.start], signs.disjunction())){
			return "disjunction"
		}

		/*if(expression[indexes.start-1] == "}" || expression[indexes.start-1] == ")"){
			return "conjunction";
		}*/

		return "conjunction";
	}

	/** 
	*@param {structure} expression  array, where substring is going to be taken
	*@param {structure} indexes		consists of @start and @end indexes
	*@param {structure} brackets    contains two parameters: @curly, which represents 
	*						        the amount of opend curly brackets, and @rounded,
	*							    which represents amount of opened rounded brackets
	*@return {string} 				substring of @expression or @"" in case if brackets!=0
	*/
	static _subexpression(expression, indexes, brackets){
		let substr = [];
		if(brackets.rounded == 0 && brackets.curly == 0){

			if(indexes.start == indexes.end){
				return new Array(expression[indexes.start]);
			}

			if(indexes.start > indexes.end){
				let l = indexes.start;
				indexes.start = indexes.end;
				indexes.end = l;
			}

			for(let i = indexes.start, q=0; i < indexes.end; i++, q++){
				substr[q] = expression[i];
			}
			//substr = expression.substring(indexes.start, indexes.end);
		}
		return substr;
	}
}