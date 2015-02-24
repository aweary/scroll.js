

var scrollJS = (function(){


	var scrollElements        = [],
		tweenableElements     = [],

		tweenElementPrototype = {


			//Default options

			_options: {
				visible: true,
				isTweened: false,
				isTweenable: true,
				persist: false,
				tweenBoundriesSet: false

			},


			// Used to set tween positions

			at : function(scrollPosition, scrollState){

				if(typeof scrollPosition !== "number" || scrollPosition < 0) throw new Error('Scroll position must be a number greater than 0');
				if(this._tweenPositionDefined(scrollPosition)) throw new Error('Scroll position already defined for this element');
				if(Object.keys(scrollState).length === 0){ throw new Error('Scroll state must have at least one value')  };

				var breakpoint = {};
				for(value in scrollState){
					if(scrollState.hasOwnProperty(value)){
						breakpoint[value] = scrollState[value];
					}
				}

				breakpoint['scrollPosition'] = scrollPosition;

				this.tweenBreakpoints.push(breakpoint);

				this._updateTweens();
			},


			// Used in _updateTweens to ensure that the tweenBreakpoint elements are in order

			_sortCompareFunction : function(first, second){
				if(first.scrollPosition < second.scrollPosition) return -1;
				if(first.scrollPosition > second.scrollPosition) return 1;
				return 0;

			},


			_updateTweens : function(){


				// Sort the breakpoints so we have them in order
				this.tweenBreakpoints = this.tweenBreakpoints.sort(this._sortCompareFunction);

				for(var value in this.tweenBreakpoints[0]){
					if(this.tweenBreakpoints[0].hasOwnProperty(value) && value !== 'increment' && value !== 'scrollPosition'){
						this.zeroTween[value] = this.tweenBreakpoints[0][value];
					}

				}

				for(var i = 0; i < this.tweenBreakpoints.length; i++){

					if(this.tweenBreakpoints[i + 1]){

						this._calculateTweenIncrement(this.tweenBreakpoints[i], this.tweenBreakpoints[i + 1])
					}
				}
			},


			_calculateTweenIncrement : function(firstTween, secondTween){



				var totalTraversal = secondTween.scrollPosition - firstTween.scrollPosition;

				// We always store the increment values on the first object
				if(!firstTween.increment) firstTween.increment = {};


				//TODO if value is in secondTween but not in firstTween, set value to 0 for firstTween
				for(var value in secondTween){

					if(secondTween.hasOwnProperty(value) && value !== 'increment'){
						firstTween.increment[value] = (secondTween[value] - firstTween[value]) / totalTraversal;
					}

				}


			},


			_getActiveTweenPair: function(){

				var offset = window.pageYOffset;
				var breakpoints = this.tweenBreakpoints.map(function(value){ return value.scrollPosition });
				for(var i = 0; i < breakpoints.length; i++){
					if((offset > breakpoints[1] || breakpoints[i] === 0) && offset < breakpoints[i + 1]){
						this._activeTweenPair.splice(0);
						this._activeTweenPair.push(this.tweenBreakpoints[i], this.tweenBreakpoints[i+1]);
						return;
					}
				}


			},


			_animateTweens : function(){



				this._getActiveTweenPair();


				if(window.pageYOffset <= this._activeTweenPair[1].scrollPosition && window.pageYOffset >= 0){
					this._options.isTweenable = true;

					var tweenState = {};

					for(var value in this._activeTweenPair[1]){

						if(this._activeTweenPair[1].hasOwnProperty(value) && value !== 'scrollPosition' && value !== 'increment'){
							if(!this._options.tweenBoundriesSet){
								this._options.tweenBoundriesSet = true;
								this.zeroTween[value] = this.tweenBreakpoints[0][value];
								this.finalTween[value] = this.tweenBreakpoints[1][value];
							}

							tweenState[value] = this._activeTweenPair[0][value] + (this._activeTweenPair[0].increment[value] * ( window.pageYOffset  - this._activeTweenPair[0].scrollPosition));
						}
					}


					TweenLite.to(this.elem, 0.016, tweenState);

				}

				if(window.pageYOffset > this._activeTweenPair[1].scrollPosition && this._options.isTweenable){
					this._options.isTweenable = false;
					TweenLite.to(this.elem, 0.016, this.finalTween);

				}

				if(window.pageYOffset < 0 && this._options.isTweenable){
					this._options.isTweenable = false;
					TweenLite.to(this.elem, 0.016, this.zeroTween);
				}

				if(window.pageYOffset > 700  && !this._options.persist){
					console.log('HEHEH')
					this._dereferenceNullElement();
				}

			},



			// Checks to be sure that we haven't already defined a state for the position
			// TODO add option for tweenElement to overwrite previous tweenState if desired
			_tweenPositionDefined  : function(scrollPosition){

				for(var i = 0; i < this.tweenBreakpoints.length; i++){
					var currentTween = this.tweenBreakpoints[i];
					if(currentTween[scrollPosition] !== undefined) return true;
				}

				return false;
			},

			_dereferenceNullElement : function(){
				scrollElements.splice(scrollElements.indexOf(this), 1);
				console.log('Removed reference');
			},




			_getTweenBreakpoints : function(){
				return this.tweenBreakpoints;
			}


		};




	var scrollObject  =  function(selector, options) {


		var tweenElement = Object.create(tweenElementPrototype);

		// DOM element being Tween'd
		tweenElement.elem = document.querySelector ? document.querySelector(selector) : false;
		if(!tweenElement.elem){ throw new Error('CSS  Selector invalid or querySelector() not supported in your browser')};

		tweenElement.tweenBreakpoints = [];


		//TODO remove last lodash dependency
		if(options) tweenElement._options = _.assign(this._options, options);
		//General options for controlling states.


		// Object holding tween values between steps
		tweenElement.zeroTween   = {};
		tweenElement.finalTween  = {};
		tweenElement._activeTweenPair = [];

		scrollElements.push(tweenElement);
		tweenElement.rate = 6;



		return tweenElement;
	};



	scrollObject._getScrollElements        = function(){  return scrollElements           };
	scrollObject._getTweenableElements     = function(){  return tweenableElements        };



	// ONE EVENT LISTENER TO RULE THEM ALL!

	window.addEventListener('scroll', function(){
		for(var i = 0; i < scrollElements.length; i++){
			scrollElements[i]._animateTweens.apply(scrollElements[i]);
		}
	});


	var initalParse = window.addEventListener('DOMContentLoaded', function(){
		for(var i = 0; i < scrollElements.length; i++){
			scrollElements[i]._animateTweens.apply(scrollElements[i]);
		}
	});


	return scrollObject;


})();


/*


 Need function that decides which tweenBreakpoint is active. Should be easy enough to
 use the tweenBreakpoint array since it will always be ordered from least to greatest



 */



