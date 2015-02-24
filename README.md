# scroll.js
scroll.js is a small utility that allows you to Tween animations between scroll states. It utilizes the GSAP animation library and (for the moment) lodash.

# Usage

Create a scrollJS object using the `scrollJS` function.

```js
var elementToTween = scrollJS(selector, options);
```

`selector` is a CSS3 selector and uses `querySelector` to find the corresponding DOM element.
`options` is an optional object containing overrides for the default configuration options. The
settings available are:

##### `persist`
Default is set to true. If false, the animation will only complete one cycle. After the window
has been scroll to or past the largest offset value provided the element is removed from
the list of  tween objects and will no longer be queried in anyway.


#Documentation

### `at`
Example:
`elementToTween.at(scrollPosition, scrollState);`

###### Description:
   `at` is the only method scrollJS uses. It takes the scroll position (`pageYOffset`) and the scroll state (an object with properties to tween).
    At the moment the first `at` call should set the state at scroll position 0. You can chain as many scroll states together as you'd like.

   This potential real-world example would set your logo to `-400` on the `x-axis`, and the `opacity` to `0`. Scrolling from 0 to 100 would fade and slide
    the logo over to position `0` on the `x-axis`, while also moving it `200` up the `y-axis`.
```js
 var logo = scrollJS('.logo');
 logo.at(0, {x: -400, y: 0,  opacity: 0});
 logo.at(100, {x: 0, y: 200, opacity: 1});
```

