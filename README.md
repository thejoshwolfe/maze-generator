# maze-generator

studying various maze generator algorithms.

## Live Demo

http://wolfesoftware.com/maze-generator/

## What Counts as a Maze?

The mazes studied by this project are 2D grids of rooms that can have walls between the rooms.
Given any two rooms anywhere in the grid, there must be one and only one path between them.
This means that all rooms are accessible, and there are no loops in the maze.

An entrance and exit can be placed into these mazes, but this is not within the scope of this project.
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

### Prim

Start with all walls filled in.
Choose a random starting room, and consider this the only room that's part of the maze so far.
Put all the walls of the starting room on a list of candidates for deletion.

Repeat the following process:
pick a random wall from the candidate list.
If the wall separates two rooms that are already part of the maze, leave the wall alone.
If the wall separates part of the maze from a room that's not part of the maze yet, open up the wall, and add the new room to the maze.
Add all the walls of this new room to the list of candidates for deletion.
Repeat this process until the candidate list is depleted.

All rooms will eventually be added to the maze, because every wall from every room in the maze will eventually be considered.
Since we never open up a wall that separates two rooms that are already in the maze, there will never be any loops.
