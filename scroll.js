
var scrollJS = (function(){




	svgElements = [];

	//return function
	return function(selector, options){

		//container object
		var svg = {};
		if(document.querySelector) svg.elem   = document.querySelector(selector);
		else return false; //fuck browsers that don't have querySelector

		//general options
		svg._options = _.assign({

			visible: false,
			isTweened: false,
			duration: 0.5,
			scrollDirection: null,
			scrollBegin: 0,
			scrollEnd: 0

		}, options);

		//TODO add option for appearance type (fade, scroll, spin, etc);

		svg.intermediateTween = {};



		if(options.init){
			svg._initialTween = options.init;
			TweenLite.to(svg.elem, svg._options.duration, _.assign(options.init));
		}


		//TODO allow for object prop to be excluded and assumed to have remained the same
		var tweenFunc = function(){

			var tweenModel = {};


			//TODO Abstract this out so we can use it here and when we find the differences onscroll
			//Compare and find the differences between the start and end states
			_.forEach(svg._options.scrollEndState, function(value, key){


				if(options.init[key] ){


					tweenModel[key] = options.init.css && options.init.css[key] ?  value - options.init.css[key] : value - options.init[key];
				}

				else {
					tweenModel[key] = value;
				}
			});

			console.log('tweenModel', tweenModel);

			var totalTraversal = svg._options.scrollEnd - svg._options.scrollBegin;
			console.log('totalTraversal', totalTraversal);
			var tween = {};
			_.forEach(tweenModel, function(value, key){

				tween[key] = value / totalTraversal;

			});
			console.log('tween', tween);
			return tween;



		};

		svg.tween = tweenFunc();

		//add the svg element to the svgElements list
		svgElements.push(svg);
		return svg;
	};


})();



var svgElements = [];
'use strict';





//TODO fix tweenFunc so it caches the css properties for us earlier.

//TODO fix bug with start positions greater than 0. Need to subtract pageoffset from start

var tweenIt = function(){


	//console.log('tweenIt invoked');

	_.forEach(svgElements, function(svg){

		if(window.pageYOffset < 0)
			TweenMax.to(svg.elem, 0.016, svg._initialTween);


		if(window.pageYOffset > svg._options.scrollEnd){
			TweenMax.to(svg.elem, 0.016, svg._options.scrollEndState);
		}

		if(window.pageYOffset <= svg._options.scrollEnd && window.pageYOffset >= svg._options.scrollBegin && window.pageYOffset > 0){

			//console.log('Should be tweening!');

			if(svg._options.isTweened){

				//TODO make function so it can be called recursively

				_.forEach(svg._initialTween, function(value, key){

					if ( key === 'css' ) {

						_.forEach(svg._initialTween[key], function(value, key){
							svg.intermediateTween.css[key] = value + (svg.tween[key] * (window.pageYOffset - svg._options.scrollBegin))
						})

					}

					else {

						svg.intermediateTween[key] = svg._initialTween[key] + (svg.tween[key] * window.pageYOffset)
						//console.log(key, value);

					}



				})


			}

			//otherwise lets initiate the tween;
			else {
				svg._options.isTweened = true;
			}

			//console.log(svg.intermediateTween);
			TweenMax.to(svg.elem, 0.016, svg.intermediateTween);


		}

	});

}


//TODO add option for media-query like conditional animations
//TODO add option to use css classes to declare start and end states




window.addEventListener('scroll', function(){

	window.requestAnimationFrame(tweenIt);

}, false);


window.addEventListener('load', tweenIt, false);

