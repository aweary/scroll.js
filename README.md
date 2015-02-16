# scroll.js
scroll.js is a small utility that allows you to Tween animations between scroll states. It utilizes the GSAP animation library and (for the moment) lodash.

# Usage

Invoke scroll.js via the createSVGReference function. It takes two parameters: the CSS3 identifier for the DOM element, and
a configuration object.


```js

var elementToTween = createSVGReference('.element-class', {

   init: {x: 0, y: 200, opacity: 0},
   beginScroll: 0,
   endScroll: 200,
   endScrollState: {x: -200, y: 0, opacity: 1}

})
```
