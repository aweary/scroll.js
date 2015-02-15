//Created by Brandon Dail

'use strict';

var svgElements = [];


var createSVGReference = function(selector, options){

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

		var totalTraversal = svg._options.scrollEnd - svg._options.scrollBegin;

		var tween = {};
		_.forEach(tweenModel, function(value, key){

			tween[key] = value / totalTraversal;

		});

		return tween;


	};

	svg.tween = tweenFunc();

	//add the svg element to the svgElements list
	svgElements.push(svg);
	return svg;
};


//TODO this needs to be local to each SVG

//TODO fix tweenFunc so it caches the css properties for us earlier.

var tweenIt = function(){



	_.forEach(svgElements, function(svg){


		if(window.pageYOffset < 0)
			TweenLite.to(svg.elem, 0.016, svg._initialTween);

		if(window.pageYOffset > svg._options.scrollEnd){
			TweenLite.to(svg.elem, 0.016, svg._options.scrollEndState);
		}

		if(window.pageYOffset <= svg._options.scrollEnd && window.pageYOffset >= svg._options.scrollBegin && window.pageYOffset > 0){



			if(svg._options.isTweened){

				//TODO this math is all fucked, see the bottom notes.
				_.forEach(svg._initialTween.css, function(value, key){
					svg.intermediateTween.css[key] = svg._initialTween.css[key] + (svg.tween[key] * window.pageYOffset)

				})


			}

			//otherwise lets initiate the tween;
			else {
				svg._options.isTweened = true;
			}

			TweenLite.to(svg.elem, 0.016, svg.intermediateTween);


		}

	});

}


//TODO add option for media-query like conditional animations
//TODO add option to use css classes to declare start and end states




window.addEventListener('scroll', function(){

	window.requestAnimationFrame(tweenIt);

}, false);


window.addEventListener('load', tweenIt, false);

