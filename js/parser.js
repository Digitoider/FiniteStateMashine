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
		this.type = this.defineType(expression);
		if(this.type == bracketsTypes.basic){
			this.components[0] = expression;
			return;
		}
		
		if(this.type == bracketsTypes.curly || this.type == bracketsTypes.rounded){
			expression = expression.substring(1, expression.length-1);
		}

		var parsedComponents = Parser.parse(epression);
		this.components = [];

		for(let i = 0; i < parsedComponents.length; i++){

			if(!this.hasBrackets(parsedComponents[i])){
			
				for(let q = 0; q < parsedComponents[i].length; q++){
					this.components[this.components.length] = new Structure(parsedComponents[i][q]);
				}
			}else{
				this.components = new Structure(parsedComponents[i]);
			}
		}
	}

	/**
	 * checks if the recieved expression has brackets in it
	 * @param  {string}  expression where function is trying to fin brackets
	 * @return {Boolean}            returns true if expression has brackets
	 */
	hasBrackets(expression){
		
		for(let i = 0; i < expression.length; i++){
			if(expression[i] == "{" || expression[i] == "("){
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
			rounded: (expression[0] == "{")?-1:0,
			curly: (expression[0] == "(")?-1:0,
		}

		if(expression[0] == "{" || expression[0] == "("){
			for(let i = 0; i < expression.length; i++){
				switch(expression[i]){
					case "{": brackets.curly++; break;
					case "}": brackets.curly--; break;
					case "(": brackets.rounded++; break;
					case ")": brackets.rounded--; break;
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
	}
}

var signs = {
	disjunction: function(){
		return "∨";
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
	 * @param  {string} expression expression that should be parsed
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
			
			if(expression[i] == "("){
				brackets.rounded++;
			}

			if(expression[i] == "{"){
				brackets.curly++;
			}

			if(expression[i] == ")" || expression[i] == "}"){
				switch(expression[i]){
					case ")": brackets.rounded--; break;
					case "}": brackets.curly--; break;
				}

				var subexpr;

				if(brackets.curly == 0 && brackets.rounded == 0){
					indexes.end = i+1;
					subexpr = this._subexpression(expression, indexes, brackets);
					components[components.length] = subexpr;
					indexes.start = i+1;
				}
			}

			if(expression[i] == signs.disjunction() && brackets.rounded == 0 && brackets.curly == 0){
				/*if(i > 0 && (expression[i-1] == "}" || expression[i-1] == ")")){
					indexes.start = i+1;
					indexes.end = i+1;
				}*/
				indexes.end = i;
				if(indexes.end != indexes.start){
					components[components.length] = expression.substring(indexes.start, indexes.end);
					indexes.start = i;
				}
			}
		}
		if(indexes.start < expression.length){
			components[components.length] = expression.substring(indexes.start, expression.length);
		}
		for(let i = 0; i < components.length; i++){
			var length = components[i].length;
			if(components[i][0] == signs.disjunction()){
				components[i] = components[i].substring(1, length);
			}else if(components[i][length-1] == signs.disjunction()){
				components[i] = components[i].substring(0, length-1);
			}
		}
		return components;
	}

	/** 
	*@param {string}    expression  string, where substring is going to be taken
	*@param {structure} indexes		consists of @start and @end indexes
	*@param {structure} brackets    contains two parameters: @curly, which represents 
	*						        the amount of opend curly brackets, and @rounded,
	*							    which represents amount of opened rounded brackets
	*@return {string} 				substring of @expression or @"" in case if brackets!=0
	*/
	static _subexpression(expression, indexes, brackets){
		let substr = "";
		if(brackets.rounded == 0 && brackets.curly == 0){
			substr = expression.substring(indexes.start, indexes.end);
		}
		return substr;
	}
}