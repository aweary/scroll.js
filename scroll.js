
var scrollJS = (function(){

	tweenElements = [];

	return function(selector, options){

		var tweenElement = {

			_options : _.assign({
			visible: false,
			isTweened: false,
			isTweenable: true,
			duration: 0.016,
			scrollBegin: 0,
			scrollEnd: 0,
			persist: true

			}, options),

			intermediateTween : {}

		};

		if(document.querySelector) tweenElement.elem  = document.querySelector(selector);
		else return false;

		//TODO add option for appearance type (fade, scroll, spin, etc);

			tweenElement._initialTween = options.init;
			TweenLite.to(tweenElement.elem, tweenElement._options.duration, _.assign(options.init));

		//TODO allow for object prop to be excluded and assumed to have remained the same
		var tweenFunc = function(){

			var tweenModel = {};


			//TODO Abstract this out so we can use it here and when we find the differences onscroll
			//Compare and find the differences between the start and end states
			_.forEach(tweenElement._options.scrollEndState, function(value, key){


				if(options.init[key] ){


					tweenModel[key] = options.init.css && options.init.css[key] ?  value - options.init.css[key] : value - options.init[key];
				}

				else {
					tweenModel[key] = value;
				}
			});

			console.log('tweenModel', tweenModel);

			var totalTraversal = tweenElement._options.scrollEnd - tweenElement._options.scrollBegin;

			var tween = {};

			_.forEach(tweenModel, function(value, key){

				tween[key] = value / totalTraversal;

			});
			console.log('tween', tween);
			return tween;



		};

		tweenElement.tween = tweenFunc();

		tweenElements.push(tweenElement);
		return tweenElement;
	};


})();



//TODO fix tweenFunc so it caches the css properties for us earlier.
//TODO add option for persistAfterFirstCycle, so users can choose whether its retriggered


var tweenIt = function(){


	_.forEach(tweenElements, function(tweenElement){

		if(window.pageYOffset < 0 && tweenElement._options.isTweenable)
			TweenMax.to(tweenElement.elem, 0.016, tweenElement._initialTween);


		if(window.pageYOffset > tweenElement._options.scrollEnd){
			TweenMax.to(tweenElement.elem, 0.016, tweenElement._options.scrollEndState);
			if(!tweenElement._options.persist) tweenElement._options.isTweenable = false;
		}

		if(window.pageYOffset <= tweenElement._options.scrollEnd && window.pageYOffset >= tweenElement._options.scrollBegin && window.pageYOffset > 0 && tweenElement._options.isTweenable){


			if(tweenElement._options.isTweened){

				//TODO make function so it can be called recursively

				_.forEach(tweenElement._initialTween, function(value, key){

					if ( key === 'css' ) {

						_.forEach(tweenElement._initialTween[key], function(value, key){
							tweenElement.intermediateTween.css[key] = value + (tweenElement.tween[key] * (window.pageYOffset - tweenElement._options.scrollBegin))
						})

					}

					else {

						tweenElement.intermediateTween[key] = tweenElement._initialTween[key] + (tweenElement.tween[key] * window.pageYOffset)
						//console.log(key, value);

					}



				})


			}

			//otherwise lets initiate the tween;
			else {
				tweenElement._options.isTweened = true;
			}

			TweenMax.to(tweenElement.elem, 0.016, tweenElement.intermediateTween);


		}

	});

}


//TODO add option for media-query like conditional animations
//TODO add option to use css classes to declare start and end states




window.addEventListener('scroll', function(){

	window.requestAnimationFrame(tweenIt);

}, false);


window.addEventListener('load', tweenIt, false);










/*

Potential new syntax:

// have scrollJS return an object with the methods:
//    at() - Sets the Tween state at that pageYOffset value


var tweenElement = ScrollJS('.element-class', {
     init: {x: 0, y: 0, opacity: 0.5}
});

	tweenElement.at(300, { x: 200, y: 300, opacity: 1 })
	tweenElement.at(500, {x: 0, y: 0, opacity: 0}


OR, if I can get media queries down:

	tweenElement.at(300, {
		"700px": {x: 0, y: 100, opacity: 0  }
		"1280px" : { x: 100, y: 95, opacity: 1}
	})

 */

