# maze-generator

studying various maze generator algorithms.

## Live Demo

http://wolfesoftware.com/maze-generator/

## What Counts as a Maze?

The mazes studied by this project are 2D grids of rooms that can have walls between the rooms.
Given any two rooms, there must be exactly one path that connects the two rooms.
This means that all rooms are accessible, and there are no loops in the maze.

An entrance and exit can be placed into one of these mazes, but this is not within the scope of this project.
Since there is only one path between any two points, it doesn't really matter where the entrance and exit are.

## The Algorithms

See Wikipedia's page on [maze generator algorithms](http://en.wikipedia.org/wiki/Maze_generation_algorithm).

### Kruskal

Start with all walls filled in.
Randomly iterate over every wall in the maze.
If the wall separates two areas that are closed off from each other, remove the wall, otherwise leave it alone.
Since we consider every wall, all rooms will eventually become accessible.
Since we never remove a wall between rooms that already have a path between them, there will never be any loops.

The algorithm to determine whether rooms have a path connecting them or not is fairly efficient.
See [Kruskal's algorithm](http://en.wikipedia.org/wiki/Kruskal%27s_algorithm).
