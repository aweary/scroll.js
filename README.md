# scroll.js
scroll.js is a small utility that allows you to Tween animations between scroll states. It utilizes the GSAP animation library and (for the moment) lodash.

# Usage

Invoke scroll.js via the createSVGReference function. It takes two parameters: the CSS3 identifier for the DOM element, and
a configuration object.


```js
var elementToTween = scrollJS(selector, options)
```

`selector` is a CSS3 selector and uses `querySelector` to find the corresponding DOM element.
`options` is an object containing the parameters for initializing your scrollJS object. The parameters are as follows:


#Documentation

### `init`
Example:
`init: {x: 0, y: 200, opacity: 1}`

###### Description:
   `init` is the initialization object. It will Tween the element to the specified location on load.
   The parameters can be any parameters Tweenable by GSAP's TweenMax utility.


### `scrollBegin`
Example:
`scrollBegin: 0`

###### Description:
   `scrollBegin` specifies the `pageYOffset` value at which you'd like the animation to begin


### `scrollEnd`
Example:
`scrollEnd: 200`

###### Description:
 `scrollEnd` specifies the `pageYOffset` value at which you'd like the animation to end.



### `persist`
Example:
`persist: false`

###### Description:
 Boolean value which sets whether you'd like the animation to persist after its completed a full cycle.
 If set to false (defaults to true) the animation will not trigger on subsequent up/down scrolls after completing once.

