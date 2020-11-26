import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

import './Game.scss';

interface Position {
  /** Pixels from left edge of game world */
  x: number;
  /** Pixels from top edge of game world */
  y: number;
}

interface Velocity {
  /** Radians (180 deg = Math.PI radians) */
  angle: number;
  /** Speed in pixels-per-second */
  speed: number;
}

type ObjectType = 'flu' | 'covid';

const objectTypes: ObjectType[] = ['flu', 'covid'];

interface ObjectProps {
  position: Position;
  velocity: Velocity;
  type: ObjectType;
}

interface WorldProps {
  width: number;
  height: number;
}

export function Game() {
  // Right now the playfield dimensions are static. You can change the
  // dimensions here or make them dynamic by using the useState() hook.
  const { width, height }: WorldProps = { width: 1024, height: 576 };

  // We get a ref to the game world div so we can calculate mouse event
  // coordinates.
  const gameRef = useRef<HTMLDivElement>(null);

  // The useState() hook is used to maintain the state of the game world.
  // Updating the state will cause the world to re-render. We update the game
  // world state using the useAnimationFrame() hook below.
  const [objects, setObjects] = useState<ObjectProps[]>(() => {
    // Set object initial states in this function. If your app needs more state
    // than just the objects array, add more useState() functions with their
    // own initializer function.
    //
    // To get random integer between A and B inclusive. This could be extracted
    // to a function:
    //  Math.floor(Math.random() * (B - A + 1)) + A
    //
    // To get random float between 0 and A, exclusive (will never be equal to A):
    //  Math.random() * A
    //
    // If your game objects have more properties than position and velocity,
    // add initial values here. For example, size, value, type, etc.
    const initialObjects: ObjectProps[] = [];
    for (let i = 0; i < 10; i++) {
      initialObjects.push({
        position: {
          x: Math.floor(Math.random() * width + 1),
          y: Math.floor(Math.random() * height + 1),
        },
        velocity: {
          angle: Math.random() * Math.PI * 2,
          speed: Math.floor(Math.random() * 201) + 50,
        },
        type: _.sample(objectTypes) as ObjectType,
      });
    }

    // It's okay to do console.log here because this initializer should only
    // be called once until you reload the page manually.
    console.log('Initial game objects:', initialObjects);

    return initialObjects;
  });

  // The main game loop goes here. Each frame has a `delta` value which is the
  // number of seconds since the last frame. This can be used to make
  // performance consistent no matter what the frame-rate of the game is.
  //
  // In the game loop you should update the game state with new values for the
  // next frame:
  //
  //  - Update object positions
  //  - Update velocities (handle bouncing or collisions)
  //  - Add or remove objects to/from the game state.
  //
  useAnimationFrame(
    (delta) => {
      // Be careful putting console.log calls in this callback as they will
      // put output on the console on every animation frame, up to 60 times per
      // second.
      const updatedObjects = objects.map(({ position, velocity, type }) => {
        // Get change in position scaled by the animation frame time. This uses
        // vector component formulas from high-school physics to get delta-x and
        // delta-y values:
        // https://www.dummies.com/education/science/physics/how-to-find-vector-components/
        //
        // These functions makes objects move along their velocity vector, but
        // you can change the formulas to make objects move in different ways.
        const dx = velocity.speed * Math.cos(velocity.angle) * delta;
        const dy = velocity.speed * Math.sin(velocity.angle) * delta;

        // Update the position.
        const newPosition = {
          x: position.x + dx,
          y: position.y + dy,
        };

        return {
          position: newPosition,
          velocity,
          type,
        };
      });

      // Update the game world state with the new object data.
      setObjects(updatedObjects);
    },
    [objects]
  );

  // Handles mouse clicks on the game world. You can add similar event handling
  // for keyboard events and mouse movement events. When a mouse event happens
  // you can also update the game world state.
  //
  // If you add an event handler for mouse movement, consider debouncing the
  // event handler as frequent event-based re-rendering could cause the game to
  // become slow.
  //
  // You may want to do collission handling inside this event handler. Simple
  // collission handling of two circles can be calculated by seeing if the
  // distance between the center of the two objects is less than the sum of the
  // radii of the two objects. The distance between centres is calculated using
  // the Pythagorean theorem:
  //
  //   a^2 + b^2 = c^2
  //       or
  //   distance = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
  //
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (gameRef.current) {
        // This code runs when a click happens. The `position` variable contains
        // the x, y coordinates relative to the game world.
        const div = gameRef.current;
        const rect = div.getBoundingClientRect();
        const position: Position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };

        console.log('clicked', position);
      }
    }

    if (gameRef.current) {
      const div = gameRef.current;
      div.addEventListener('click', handleClick, false);

      return () => {
        div.removeEventListener('click', handleClick, false);
      };
    }
  }, [gameRef]);

  // Objects are rendered here with placeholder divs. You can replace this
  // with any type of component you want.
  //
  // Be careful putting console.log calls in this render code as they can be
  // output up to 60 times per second.

  return (
    <div className="game" style={{ width, height }} ref={gameRef}>
      {objects.map((object, index) => (
        <GameObject key={index} {...object} />
      ))}
    </div>
  );
}

function GameObject({ position, velocity, type }: ObjectProps) {
  switch (type) {
    case 'flu':
      return (
        <div
          className="flu"
          style={{
            color: '#fff',
            borderLeft: '20px solid rgba(100, 180, 220, 0.7)',
            borderRight: '20px solid transparent',
            borderTop: '7px solid transparent',
            borderBottom: '7px solid transparent',
            position: 'absolute',
            top: position.y - 7,
            left: position.x - 20,
            width: 0,
            height: 0,
            transform: `rotate(${velocity.angle}rad)`,
          }}
        />
      );
    case 'covid':
      return (
        <div
          className="covid"
          style={{
            color: '#fcba03',
            borderLeft: '20px solid rgba(252, 186, 3, 0.7)',
            borderRight: '20px solid transparent',
            borderTop: '7px solid transparent',
            borderBottom: '7px solid transparent',
            position: 'absolute',
            top: position.y - 7,
            left: position.x - 20,
            width: 0,
            height: 0,
            transform: `rotate(${velocity.angle}rad)`,
          }}
        />
      );
    default:
      return <div />;
  }
}
