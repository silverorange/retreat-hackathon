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
const SPRITE_RADIUS = 30;
const BUG_COUNT = 20;

interface ObjectProps {
  position: Position;
  velocity: Velocity;
  type: ObjectType;
  health: number;
  points: number;
  timeAlive: number;
  timesSplit: number;
}

const bugDefaults: {
  [type: string]: { health: number; points: number; doublingTime: number };
} = {
  flu: {
    health: 10,
    points: 10,
    doublingTime: 3000,
  },
  covid: {
    health: 20,
    points: 20,
    doublingTime: 5000,
  },
};

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

  const [score, setScore] = useState<number>(0);
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
    for (let i = 0; i < BUG_COUNT; i++) {
      const type = _.sample(objectTypes) as ObjectType;
      initialObjects.push({
        position: {
          x: Math.floor(Math.random() * width + 1),
          y: Math.floor(Math.random() * height + 1),
        },
        velocity: {
          angle: Math.random() * Math.PI * 2,
          speed: Math.floor(Math.random() * 101),
        },
        type,
        health: bugDefaults[type].health,
        points: bugDefaults[type].points,
        timeAlive: 0,
        timesSplit: 0,
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
      const updatedObjects = objects.map((obj) => {
        const { position, velocity } = obj;
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
          ...obj,
          position: newPosition,
          velocity,
          timeAlive: obj.timeAlive + delta,
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

        objects.forEach((obj, index) => {
          const distance = Math.sqrt(
            Math.pow(obj.position.x - position.x, 2) +
              Math.pow(obj.position.y - position.y, 2)
          );
          if (distance <= SPRITE_RADIUS) {
            const newObjects = _.cloneDeep(objects);
            newObjects.splice(index, 1);
            setObjects(newObjects);
            setScore((score) => score + obj.points);
          }
        });
      }
    }

    if (gameRef.current) {
      const div = gameRef.current;
      div.addEventListener('click', handleClick, false);

      return () => {
        div.removeEventListener('click', handleClick, false);
      };
    }
  }, [gameRef, objects]);

  // Objects are rendered here with placeholder divs. You can replace this
  // with any type of component you want.
  //
  // Be careful putting console.log calls in this render code as they can be
  // output up to 60 times per second.

  return (
    <div className="game" style={{ width, height }} ref={gameRef}>
      <span className="score">Score: {score}</span>
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
          className="flu-sprite"
          style={{
            position: 'absolute',
            top: position.y - SPRITE_RADIUS,
            left: position.x - SPRITE_RADIUS,
            transform: `rotate(${velocity.angle}rad)`,
          }}
        />
      );
    case 'covid':
      return (
        <div
          className="covid-sprite"
          style={{
            position: 'absolute',
            top: position.y - SPRITE_RADIUS,
            left: position.x - SPRITE_RADIUS,
            transform: `rotate(${velocity.angle}rad)`,
          }}
        />
      );
    default:
      return <div />;
  }
}
