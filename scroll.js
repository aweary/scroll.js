
var ScrollJS  = (function(){


	var scrollElements      = [],
		tweenableElements   = [],
		scrollObject        =  function(selector, options) {

			this.elem = document.querySelector ? document.querySelector(selector) : false;
			if(!this.elem) throw new Error('CSS  Selector invalid or querySelector() not supported in your browser');


			this._tweenBreakpoints   = [];
			this._cache              = {};
			this._persist            = (options && options.persist !== undefined) ? options.persist : true ;
			this._zeroTween          = {};
			this._finalTween         = {};
			this._isTweenable        = true;
			this._initialTweenPairSet = false;
			this._tweenBoundariesSet = false;
			this._activeTweenPair    = [];

			scrollElements.push(this);

		};


	scrollObject.prototype.at = function(scrollPosition, scrollState){


		if(typeof scrollPosition !== "number" || scrollPosition < 0)   throw new Error('Scroll position must be a number greater than 0');
		if(this._tweenPositionDefined(scrollPosition))                 throw new Error('Scroll position already defined for this element');
		if(Object.keys(scrollState).length === 0)                      throw new Error('Scroll state must have at least one value');


		// Each .at() invocation creates a breakpoint object with the properties provided in scrollState

		var breakpoint = {};

		for ( var value in scrollState ) {

			if( scrollState.hasOwnProperty( value ) ){

				breakpoint[ value ] = scrollState[ value ];

			}

		}

		// scrollPosition is set so we can reference the scroll value later on
		breakpoint['scrollPosition'] = scrollPosition;

		// add the breakpoint object to the object's tweenBreakpoint array
		this._tweenBreakpoints.push(breakpoint);


		//TODO is this needed?
		this._updateTweens();

	};


	scrollObject.prototype._sortCompareFunction = function(first, second){
		if(first.scrollPosition < second.scrollPosition) return -1;
		if(first.scrollPosition > second.scrollPosition) return 1;
		return 0;

	};


	scrollObject.prototype._updateTweens = function(){


		// Sort the breakpoints so we have them in order. The smallest values come first.
		this._tweenBreakpoints = this._tweenBreakpoints.sort(this._sortCompareFunction);

		// _cache the biggest and smallest breakpoint values
		if(!this._cache.absoluteTweenUpperBound || !this._cache.absoluteTweenLowerBound){
			this._cache.absoluteTweenUpperBound = this._tweenBreakpoints[this._tweenBreakpoints.length - 1].scrollPosition;
			this._cache.absoluteTweenLowerBound = this._tweenBreakpoints[0].scrollPosition;
		}

		for(var i = 0; i < this._tweenBreakpoints.length; i++){

			// The increment value is placed on the first tween value so we don't need to calculate it on the last tween object.
			if(this._tweenBreakpoints[i + 1]){

				// We then calculate the increment value for each pair, so we know how much to tween on each scroll
				this._calculateTweenIncrement(this._tweenBreakpoints[i], this._tweenBreakpoints[i + 1])

			}

		}

	};


	scrollObject.prototype._calculateTweenIncrement = function(firstTween, secondTween){


		var totalTraversal = secondTween.scrollPosition - firstTween.scrollPosition;

		// Always store the increment values on the first object
		if(!firstTween.increment) firstTween.increment = {};

		// If a value was defined in the firstTween but not in the secondTween, transfer the value to the secondTween.
		for ( var type  in firstTween  ){
			if(firstTween.hasOwnProperty(type) && type !== 'scrollPosition' && type !== 'increment' && secondTween[type] === undefined){
				secondTween[type] = firstTween[type];
			}
		}

		//TODO if value is in secondTween but not in firstTween, set value to 0 for firstTween
		for ( var value in secondTween ){

			if(secondTween.hasOwnProperty(value) && value !== 'increment'){
				firstTween.increment[value] = (secondTween[value] - firstTween[value]) / totalTraversal;
			}
		}


	};


	scrollObject.prototype._getActiveTweenPair = function(){



		//TODO if the lowest value in the breakpoints is greater than 0, make sure
		//TODO we're not trying to query its activeTweenPair[1] yet. Lets set it earlier maybe so its not empty?


		var offset = window.pageYOffset;
		if(offset < 0) return;
		if(offset < this._cache.activeTweenPairUpperBound && offset > this._cache.activeTweenPairLowerBound) return;

		if(!this._cache.breakpoints) this._cache.breakpoints = this._tweenBreakpoints.map(function(value){ return value.scrollPosition });
		var breakpoints = this._cache.breakpoints;


		if(!this._initialTweenPairSet || (this._activeTweenPair.length === 2)){

			if(this._activeTweenPair.length) this._activeTweenPair.splice(0);
			this._activeTweenPair.push(this._tweenBreakpoints[0], this._tweenBreakpoints[1]);
			this._cache['activeTweenPairUpperBound'] = breakpoints[1];
			this._cache['activeTweenPairLowerBound'] = breakpoints[0];

			this._initialTweenPairSet = true;

		}


		// TODO BUG: _activeTweenPair not set right when scrolled past highest value


		for(var i = 0; i < breakpoints.length; i++){


			if((offset > breakpoints[i] || breakpoints[i] === 0) && offset < breakpoints[i + 1]){
				console.log('New tweenPair');
				if(this._activeTweenPair.length) this._activeTweenPair.splice(0);
				this._activeTweenPair.push(this._tweenBreakpoints[i], this._tweenBreakpoints[i+1]);
				this._cache['activeTweenPairUpperBound'] = breakpoints[i + 1];
				this._cache['activeTweenPairLowerBound'] = breakpoints[i];
				return;
			}
		}


	};


	scrollObject.prototype._animateTweens = function(){


		//TODO gix issue with activeTweenPair not loading when the page is loaded at an offset > 0
		this._getActiveTweenPair();


		// If the element is not set to perist, and we've completed an animation cycle, remove the reference to it.

		if(window.pageYOffset >= this._cache.absoluteTweenUpperBound && !this._persist){
			this._dereferenceNullElement();
		}


		if(this._activeTweenPair[1] && window.pageYOffset <= this._activeTweenPair[1].scrollPosition && window.pageYOffset >= 0){
			this._isTweenable = true;

			var tweenState = {};

			for(var value in this._activeTweenPair[1]){

				if(this._activeTweenPair[1].hasOwnProperty(value) && value !== 'scrollPosition' && value !== 'increment'){


					// Set Tween Boundaries once so we know the lowest and highest scroll values for excess scrolls.

					//TODO this is not working
					if(!this._tweenBoundariesSet){
						this._setTweenBoundaries(this._tweenBreakpoints[this._tweenBreakpoints.length - 1], this._finalTween);
						this._setTweenBoundaries(this._tweenBreakpoints[0], this._zeroTween);
						this._tweenBoundariesSet  = true;
					}


					tweenState[value] = this._activeTweenPair[0][value] + (this._activeTweenPair[0].increment[value] * ( window.pageYOffset  - this._activeTweenPair[0].scrollPosition));
				}
			}

			this._tweenBoundariesSet = true;


			console.log(TweenLite.to(this.elem, 0.016, tweenState));

		}

		if(window.pageYOffset >=  this._tweenBreakpoints[this._tweenBreakpoints.length -1].scrollPosition && this._isTweenable){
			this._isTweenable = false;
			TweenLite.to(this.elem, 0.016, this._finalTween);

		}

		if(window.pageYOffset < 0 && this._isTweenable && this._tweenBreakpoints[0].scrollPosition === 0){
			this._isTweenable = false;
			TweenLite.to(this.elem, 0.016, this._zeroTween);
		}


	};


	scrollObject.prototype._setTweenBoundaries = function(src, target){

		for(var value in src){

			if(src.hasOwnProperty(value) && value !== 'increment' && value !== 'scrollPosition'){
				if(typeof src[value] === 'object') this._setTweenBoundaries(src[value], target[value]);
				target[value] = src[value];
			}
		}



	};


	scrollObject.prototype._tweenPositionDefined = function(scrollPosition){

		for(var i = 0; i < this._tweenBreakpoints.length; i++){
			var currentTween = this._tweenBreakpoints[i];
			if(currentTween[scrollPosition] !== undefined) return true;
		}

		return false;
	};


	scrollObject.prototype._dereferenceNullElement = function(){
		TweenLite.to(this.elem, 0.016, this.finalTween);
		scrollElements.splice(scrollElements.indexOf(this), 1);
	};

	// These are really just used in development at the moment

	scrollObject.prototype._getScrollElements         = function(){  return scrollElements    };


	scrollObject.prototype.__getTweenableElements     = function(){  return tweenableElements };



	// ONE EVENT LISTENER TO RULE THEM ALL!

	window.addEventListener('scroll', function(){
		for(var i = 0; i < scrollElements.length; i++){
			scrollElements[i]._animateTweens.apply(scrollElements[i]);
		}
	});
	window.addEventListener('DOMContentLoaded', function(){
		for(var i = 0; i < scrollElements.length; i++){
			scrollElements[i]._getActiveTweenPair.apply(scrollElements[i]);
		}

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



