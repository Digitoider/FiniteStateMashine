var $closeButton = $("<button type='button' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>")
					.click(function(){
						$(this).parent().animate({"width": "0"}, 350);
						setTimeout(function(elem){elem.parent().remove()}, 300, $(this));
					});
var $disjunctionSignDOMComponent = $("<div>").addClass("disjunctiveComponent disjunctionSign")
					  .append( $("<div>").text( signs.disjunction() ))
					  .append($closeButton.clone(true).css("display", "none"))
					  .mouseover( function(){$(this).find(".close").css("display", "block");} )
					  .mouseout( function(){$(this).find(".close").css("display", "none");} );
var $leftCurlyDOMComponent = $("<div>").addClass("disjunctiveComponent curly leftCurly")
					  .append( $("<div>").text( "{" ))
					  .append($closeButton.clone(true).css("display", "none"))
					  .mouseover( function(){$(this).find(".close").css("display", "block");} )
					  .mouseout( function(){$(this).find(".close").css("display", "none");} );
var $rightCurlyDOMComponent = $("<div>").addClass("disjunctiveComponent curly rightCurly")
					  .append( $("<div>").text( "}" ))
					  .append($closeButton.clone(true).css("display", "none"))
					  .mouseover( function(){$(this).find(".close").css("display", "block");} )
					  .mouseout( function(){$(this).find(".close").css("display", "none");} );
var $leftRoundedDOMComponent = $("<div>").addClass("disjunctiveComponent rounded leftRounded")
					  .append( $("<div>").text( "(" ))
					  .append($closeButton.clone(true).css("display", "none"))
					  .mouseover( function(){$(this).find(".close").css("display", "block");} )
					  .mouseout( function(){$(this).find(".close").css("display", "none");} );
var $rightRoundedDOMComponent = $("<div>").addClass("disjunctiveComponent rounded rightRounded")
					  .append( $("<div>").text(")") )
					  .append($closeButton.clone(true).css("display", "none"))
					  .mouseover( function(){$(this).find(".close").css("display", "block");} )
					  .mouseout( function(){$(this).find(".close").css("display", "none");} );

$().ready(function(){
	getRegexFromLocalStorage();
	autosaveON();

	$("body").on("keydown", function(event){

		let inModal = false;
		$(".modal").each(function(){
			if($(this).hasClass("in")){
				inModal = true;
			}
		})

		//if($("body").hasClass("modal-open")){
		if(inModal){
			return;
		}

		event = event||window.event;
		if(event.which == 37 || event.which == 39){

			event.preventDefault();
			var $textPointer = $("#textPointer");
			
			if(event.which == 37){//left arrow
				if($textPointer.prev().hasClass("popover")){
					$textPointer.prev().prev().insertAfter($textPointer);	
				}else{
					$textPointer.prev().insertAfter($textPointer);
				}
			}else if(event.which == 39){
				if($textPointer.next().hasClass("popover")){
					$textPointer.insertAfter($textPointer.next().next());
				}else{
					$textPointer.insertAfter($textPointer.next());
				}
			}
		}
	});
	
	$("#addDisjunctionBtn").click(function(){
		let $textPointer = $("#textPointer");
		let $prev = $textPointer.prev();
		let $next = $textPointer.next();

		
		if($prev.hasClass("leftCurly") || $prev.hasClass("leftRounded")){
			$textPointer.popover({
				placement: "bottom",
				content: "Impossible to insert disjunction sign here",
			});
			$textPointer.popover("show");
			return;
		}
		if($prev.hasClass("popover")){
			if($prev.prev().hasClass("disjunctionSign")){
				return;
			}
		}
		if($next.hasClass("popover")){
			if($next.next().hasClass("disjunctionSign")){
				return;
			}
		}
		if($prev.hasClass("disjunctionSign") || $next.hasClass("disjunctionSign")){
			$textPointer.popover({
				placement: "bottom",
				content: "Impossible to insert disjunction sign here",
			});
			$textPointer.popover("show");
			return;
		}
		$disjunctionSignDOMComponent.clone(true).insertBefore($textPointer);
	});

	$("#addLeftCurlyBtn").click(function(){
		let $textPointer = $("#textPointer");
		$leftCurlyDOMComponent.clone(true).insertBefore($textPointer);
		//$rightCurlyDOMComponent.clone().insertAfter($textPointer);
	});

	$("#addRightCurlyBtn").click(function(){
		let $textPointer = $("#textPointer");
		$rightCurlyDOMComponent.clone(true).insertBefore($textPointer);

	});

	$("#addLeftRoundedBtn").click(function(){
		let $textPointer = $("#textPointer");
		$leftRoundedDOMComponent.clone(true).insertBefore($textPointer);
	});

	$("#addRightRoundedBtn").click(function(){
		let $textPointer = $("#textPointer");
		$rightRoundedDOMComponent.clone(true).insertBefore($textPointer);
	});

	$("#clearRegexBtn").click(function(){
		let $textPointer = $("#textPointer").clone(true);
		$("#editContainer").html("");
		$("#editContainer").html($textPointer);
	})

	$("#formRegexBtn").click(function(){
		let regex = [];
		regex.push({
			value: "(",
			lower: [],
			description: "",
			specialSymbol: false,
		});
		$("#editContainer").children().each(function(){
			if($(this).hasClass("curly") || $(this).hasClass("rounded") || $(this).hasClass("disjunctionSign")){
				let v;
				if($(this).hasClass("leftCurly")){
					v = "{";
				}else if($(this).hasClass("rightCurly")){
					v = "}";
				}else if($(this).hasClass("leftRounded")){
					v = "(";
				}else if($(this).hasClass("rightRounded")){
					v = ")";
				}else {
					v = signs.disjunction();
				}
				regex.push({
					value: v,
					lower: [],
					description: "",
					specialSymbol: false,
				});
			}else{
				$(this).children().each(function(){
					if($(this).hasClass("symbol")){
						regex.push({
							value: $(this).first().text(),
							lower: [],
							description: "",
							specialSymbol: false,
						});
					}
				})
			}
		});
		regex.push({
			value: ")",
			lower: [],
			description: "",
			specialSymbol: false,
		});
		alert(Expression.toString(regex));
		let struct = new Structure(regex);

		Structure.indexPlaces(struct);
		Structure.minimizeRegex(struct);
		var transitionMatrix = Structure.buildTransitionMatrix(struct);
		$("#transitionMatrix").html("");
		formTable(transitionMatrix, struct);

		drawRegexPlaces(struct, regex);
	});

	
		let s = $("<div>").addClass("disjunctiveComponent");
		let brackets = ["'{'", "'}'", "'('", "')'", "'['", "']'"];

		let list = [];
		brackets.forEach(function(val){
			let desc;
			switch(val){
				case "'{'": desc = "Left curly bracket"; break;
				case "'('": desc = "Left rounded bracket"; break;
				case "'['": desc = "Left squire bracket"; break;
				case "'}'": desc = "Right curly bracket"; break;
				case "')'": desc = "Right rounded bracket"; break;
				case "']'": desc = "Right squire bracket"; break; 
			}
			let $li = $("<li>").append( 
								  $("<a>").text(val)
								  		  .attr("title", desc)
								  		  .attr("val", val)
								  		  .css("cursor", "pointer")
								  		  .click(function(e){
								  		  	let v = $(this).attr("val");
								  		  	switch(v){
								  		  		case "'['": v = "'leftSquireBracket'"; break;
								  		  		case "']'": v = "'rightSquireBracket'"; break;
								  		  	}
								  		  	let expression = Expression.toArray("[&" + v /*$(this).attr("val")*/ + "]");
								  		    addMakrosOrSupersign(expression);
								  		  })
							   );
			list.push($li);
		});

		$("ul[name=supersignsAndMakroses]").each(function(){
			for(let i = 0; i < list.length; i++){
				$(this).append(list[i].clone(true));	
			}
		});
		
	

	$("#addDisjunctionMakrosModal").click(function(){
		insertTextAtCursor( $("#makrosInput"), signs.disjunction());
	});


	$("#addDisjunctiveComponentBtn").click(function(){
		let expr = Expression.toArray($("#disjunctiveElementInput").val());
		let $textPointer = $("#textPointer");
		let components = getHTMLcomponentsByExpression(expr);
		
		components.forEach(function(item){
			item.insertBefore($textPointer);
		});
	});

	var supersigns = [];
	$("#addButtonSupersignModal").click(function(){
		
		let val = $("#supersignElementInput").val();
		let desc = $("#supersignDescription").val();
		desc = (desc.length == 0)? "No description": desc;

		for(let i = 0; i < supersigns.length; i++){
			
			if(supersigns[i].value == val){
				$("#supersignElementInput").popover({
					content: "Element with such name already exists",
				});
				$("#supersignElementInput").popover("show");

				return;
			}
		};

		supersigns.push({
			value: val,
			description: desc,
		});

		let $li = $("<li>").append( 
							  $("<a>").text(val)
							  		  .attr("title", desc)
							  		  .attr("val", val)
							  		  .css("cursor", "pointer")
							  		  .click(function(e){
							  		  	let expression = Expression.toArray("[&" + $(this).attr("val") + "]");
							  		    addMakrosOrSupersign(expression);
							  		  })
						   )
		$("ul[name=supersignsAndMakroses]").each(function(){
			$(this).append($li.clone(true));
			let k = 0;
		});

		let div = $("<div>").text(val+" - "+desc);//.addClass("btn btn-info makrosItem");
		let supersignsLI = $("<li>").append(div);
		// li.append( $("<div>").text(desc).addClass("btn btn-info") );
		$("#supersignsPanel").append(supersignsLI);
	});

	var makroses = [];
	$("#addMakrosBtn").click(function(){
		
		let val = $("#makrosInput").val();
		let desc = $("#makrosDescription").val();
		desc = (desc.length == 0)? "No description": desc;

		for(let i = 0; i < makroses.length; i++){
			
			if(makroses[i].value == val){
				$("#makrosInput").popover({
					content: "Element with such name already exists",
				});
				$("#makrosInput").popover("show");

				return;
			}
		};

		makroses.push({
			value: val,
			description: desc,
		});
		
		let $li = $("<li>").append( 
							  $("<a>").text(val)
							  		  .attr("title", desc)
							  		  .attr("val", val)
							  		  .css("cursor", "pointer")
							  		  .click(function(e){
							  		  	let expression = Expression.toArray($(this).attr("val"));
							  		    addMakrosOrSupersign(expression);
							  		  })
						   );
		$("ul[name=supersignsAndMakroses]").each(function(){
			$(this).append($li.clone(true));
			let k = 0;
		});
		let div = $("<div>").text(val+" - "+desc);//.addClass("btn btn-info makrosItem");
		let makrosesLI = $("<li>").append(div);
		// li.append( $("<div>").text(desc).addClass("btn btn-info") );
		$("#makrosesPanel").append(makrosesLI);
	});
});

/**
 * inserts makros or supersign before cursor
 * @param {Array} expression 	an array of signs or supersigns
 */
function addMakrosOrSupersign(expression){
	let modal = "nomodal"; 
	$(".modal").each(function(){
		if( $(this).css("display") == "block"){
			modal = $(this).attr("id");
		}
	})

	if(modal == "nomodal"){
		let $textPointer = $("#textPointer");
		let components = getHTMLcomponentsByExpression(expression);
		
		components.forEach(function(item){
			item.insertBefore($textPointer);
		});
		return;
	}

	if(modal == "AddDisjunctiveComponentModal"){
		insertTextAtCursor( $("#disjunctiveElementInput"), Expression.toString(expression));
		return;
	}

	if(modal == "AddMakrosModal"){
		insertTextAtCursor( $("#makrosInput"), Expression.toString(expression));
	}
}
//[&supersign]; expression ::= makros|supersign
function stringifyExpression(expression){
	
	/*expression.forEach(function(item){
		let sign = item.value;
		if(sign.match){
			if(sign.match(/[&*]/)){//supersign

			}
			if(sign.charAt(0) == "[" && sign.charAt(1) == "&")
		}
	});*/
}
function MergeSort(array, left, right){
	let first, second;
	let diff = Math.abs(right - left);
	if(diff > 1){
		first = MergeSort(array, left, left + Math.floor(diff/2));
		second = MergeSort(array, left + Math.floor(diff/2) + 1, right);
	}else{
		if(left == right) {
			return [array[left]];
		}
		if(array[left] < array[right]){
			return [array[left], array[right]];
		}
		return [array[right], array[left]];
	}

	//let amount = Math.min(first.length, second.length);
	let l = 0, r = 0;
	let result = [];
	
	while(l < first.length && r < second.length){
		if(first[l] > second[r]){
			result.push(second[r]);
			r++;
		}else{
			result.push(first[l]);
			l++;
		}
	}
	if(l < first.length){
		result.push(first.pop());
	}else if(r < second.length){
		result.push(second.pop());
	}
	return result;
}
function getHTMLcomponentsByExpression(expression){
	let components = [];
	let isSupersign = false;
	let lastItem = undefined;
	let $phrase = undefined;
	let currSupersignValue = "";
	/*expression.forEach(function*/
	for(let i = 0; i < expression.length; i++){
		
		switch(expression[i].value){
			case signs.disjunction(): 
			case "{": 
			case "}": 
			case "(": 
			case ")": 
			case "[": if(!isSupersign) break;
			default:
				if(lastItem !== undefined && lastItem.value == "[" && expression[i].value == "&"){
					isSupersign = true;
					lastItem = expression[i];
					continue;
				}
				if(isSupersign && expression[i].value != "]"){
					lastItem = expression[i];
					currSupersignValue += expression[i].value;
					continue;
				}

				if($phrase === undefined){
					$phrase = $("<div>").addClass("disjunctiveComponent");
				}
				let $symbol;
				
				if(isSupersign){
					switch(currSupersignValue){
						case "'leftSquireBracket'": currSupersignValue = "'['";break;
						case "'rightSquireBracket'": currSupersignValue = "']'";break;
					}
					$symbol = $("<div>").text(currSupersignValue);
				}else{
				 	$symbol = $("<div>").text(expression[i].value);
				}

				$phrase.append( $("<div>").append($symbol).addClass("symbol") );
				
				currSupersignValue = "";
				isSupersign = false;
		}
		let v = expression[i].value;
		if(v == "{" || v == "}" || v == "(" || v == ")" || v == "]" || v == signs.disjunction()){
			if($phrase !== undefined){
				$phrase.append($closeButton.clone(true));
				components.push($phrase);
				$phrase = undefined;
			}
			switch(expression[i].value){
				case signs.disjunction(): components.push($disjunctionSignDOMComponent.clone(true)); break;
				case "{": components.push($leftCurlyDOMComponent.clone(true)); break;
				case "}": components.push($rightCurlyDOMComponent.clone(true)); break;
				case "(": components.push($leftRoundedDOMComponent.clone(true)); break;
				case ")": components.push($rightRoundedDOMComponent.clone(true)); break;
			}
		}
		lastItem = expression[i];
	}//);//end of forEach
	if($phrase !== undefined){
		$phrase.append($closeButton.clone(true));
		components.push($phrase);
	}
	return components;
}
function insertTextAtCursor(element, text) {
	element = element[0];
	var val = element.value, endIndex, range, doc = element.ownerDocument;
	endIndex = element.selectionEnd;
	element.value = val.slice(0, endIndex) + text + val.slice(endIndex);
}
function getRegexFromLocalStorage(){
	let savedRegex = localStorage.getItem("FiniteStateMashine");
	if(savedRegex){
		$("#editContainer").html(savedRegex);
		$("#editContainer").children().each(function(){
			if($(this).hasClass("leftCurly")){
				$(this).replaceWith($leftCurlyDOMComponent.clone(true));
			}else if($(this).hasClass("rightCurly")){
				$(this).replaceWith($rightCurlyDOMComponent.clone(true));
			}else if($(this).hasClass("leftRounded")){
				$(this).replaceWith($leftRoundedDOMComponent.clone(true));
			}else if($(this).hasClass("rightRounded")){
				$(this).replaceWith($rightRoundedDOMComponent.clone(true));
			}else if($(this).hasClass("disjunctionSign")){
				$(this).replaceWith($disjunctionSignDOMComponent.clone(true));
			}else{
				$(this).find(".close").replaceWith($closeButton.clone(true));
			}
		});
	}
}
function autosaveON(){
	setInterval(saveRegexToLocslStorage, 1000*30);
}
function saveRegexToLocslStorage(){
	localStorage.setItem("FiniteStateMashine", $("#editContainer").html());
}
function drawRegexPlaces(struct, regex){
	$("#regexContainer").html("");

	let arr = Structure.getBasicComponents(struct);
	let q = 0;
	let max = 4;
	for(let i = 0; i < regex.length; i++){
		let $regexElem = $("<div>").addClass("regexElem");
		switch(regex[i].value){
			case "{": 
			case "}": 
			case "(": 
			case ")": 
			case signs.disjunction(): $regexElem.append($("<div>").text(regex[i].value)); break;
			default:
				if(q < arr.length){
					if(i > 0){
						switch(regex[i-1].value){
							case "{": case "}": case "(": case ")": case signs.disjunction():{
								let $premain = $("<div>").addClass("premain");
								$premain.append( $("<div>").text("|") );

								let places = getShortPlacesToDraw(arr[q].premain);
								if(places.length > max){
									max = places.length;
								}
								places.forEach(function(item){
									let $place = $("<div>").addClass("place")
														   .text(item);
									$premain.append($place);
								});
								$regexElem.append($premain);
							}
						}
					}
	
					$regexElem.append( $("<div>").text(regex[i].value) );

					let $postmain = $("<div>").addClass("postmain");
					$postmain.append( $("<div>").text("❘") );//౹
					let $place = $("<div>").addClass("place")
										   .text(arr[q].postmain[0]);
					$postmain.append($place);
					$regexElem.append($postmain);
					q++;
				}
		}
		$("#regexContainer").append($regexElem);
	}//endfor
	$(".premain").css("marginBottom", max*19 + "px");
}
function getShortPlacesToDraw(array){
	if(array.length == 1){
		return [array[0]];
	}
	array.sort((a,b)=>{return a-b});

	let start = array[0], last = array[0];
	let places = [];
	for(let i = 1; i < array.length; i++){
		if(array[i] != last+1){
			if(start == last){
				places.push(""+last);
			}else{
				places.push(start + ".." + last);
			}
			start = last = array[i];
			continue;
		}	
		last = array[i];
	}
	if(start == last){
		places.push(""+last);
	}else{
		places.push(start + ".." + last);
	}
	return places;
	//1,2,3, 5,6, 8,9,10,11, 13, 15 => [1-3],[5-6],[8-11],[13],[15]
}