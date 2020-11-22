# silverorange Retreat 2020 Hackathon

In this hackathon you are part of a group of three and need to develop a game
like the Mario Paint flyswatter game: https://www.youtube.com/watch?v=vAQXJbfihxo

Instead of flys, you will be eliminating COVID-19 viruses!

The rules of the game are intentionally loosly defined. There should be viruses
on the screen that you need to disinfect. Appearance, quantity, movement,
score, sound effects, etc, are all up to your team.

TODO

## Assets

There are some predefined assets in the `src/images` and `src/audio` folders.
You can use these or create your own new assets

TODO

## Getting Started

A basic game framework is provided using Create React App and TypeScript. The
game framework uses the [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
API to smoothly update the game world in a performant way.

Objects in the game world can be rendered as React components using any
features of HTML and CSS.

You can run the game with:

```sh
yarn install
yarn start
```

### Movement

The `requestAnimationFrame` API is wrapped in a hook that is called once for
each frame. You can update the game state inside the callback function and
change object positions.

The basic framework updates object positions based on a velocity vector. The
x,y position of the element is updated on each frame with the x,y components of
the velocity vector. This is one way movement can be done, but it is not
required that objects move this way.

The callback receives a `delta` parameter which is the number of seconds that
have elapsed since the last update. When things are running smoothly at 60
frames-per-second the delta value will be 0.016 seconds. If things slow down,
the delta value could be much higher. This value can be used to scale updates
so movement remains smooth even if the frame rate becomes inconsistent.

### Sound Effects

There are no sound effects in the game engine, but you can add sounds using
the HTML5 audio API. You can do this with `useEffect()` and direct use of the
[Audio API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio),
or by creating hidden `<audio />` elements using a React component.

```js
import beepFile from './sounds/beep.ogg';

const beepSound = new Audio(beepFile);
beepSound.volume = 0.8;
beepSound.play();
```

### Collisions

There are two places you may want to check for collisions. First, you may
check in the per-frame update function. You could check if objects have
collided during or after moving all the objects. Depending on how you design
your game, this may be useful.

Second, you may want to do collision detection based on mouse events. There
is a simple mouse click handler that can be extended to add keyboard and mouse
movement events. You may want to check for collisions in the event handler.

In both cases, knowing if two objects have collided can be done in a variety
of ways. The simplest to implement is to treat every object as a circle with
a defined radius. Collisions happen when the distance between the two centers
is less than the sum of the two radii.

```js
const distance = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
if (distance < a.radius + b.radius) {
  console.log('a and b are intersecting!');
}
```

Detecting collisions of polygons is a bit more complicated, but can be done.
[There may be NPM packages available](https://www.npmjs.com/package/collider2d)
to detect point-in-polygon or polygon-intersecting-polygon if you want this for
your game.

TODO
