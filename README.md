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

### Depth-First Search

Start with all the walls filled in and all the rooms filled in (black).
Randomly walk through the rooms while opening walls and rooms to make the traversal possible.
Only open walls that lead to black rooms.
If there are no black rooms adjacent to our current position, back up until there are.
Keep track of the path traveled (blue) to get to this point to make the backtracking possible.
(Don't include the backtracking in the path to get to this point.)

Since we back up until we find adjacent black rooms, all rooms will eventually get explored.
Since we only open walls to black rooms, we never create loops.

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

### Kruskal

Start with all walls filled in.
Randomly iterate over every wall in the maze.
If the wall separates two areas that are closed off from each other, remove the wall, otherwise leave it alone.

Since we consider every wall, all rooms will eventually become accessible.
Since we never remove a wall between rooms that already have a path between them, there will never be any loops.

The algorithm to determine whether rooms have a path connecting them or not is fairly efficient.
See [Kruskal's algorithm](http://en.wikipedia.org/wiki/Kruskal%27s_algorithm).

### Ivy

Consider the "vertexes" of the maze, which is the joints in the walls.
If a room is a square and a wall is an edge, a vertex is a corner of the square.

Start with a big open space.
Choose a vertex location near a border of the room, and grow a wall out to it.
Continue choosing empty vertexes near non-empty vertexes and growing walls out to them, until every vertex has a wall touching it.

Since we never grow a wall to a vertex that already has a wall, we never close off any region making it inaccessible.
Every wall is connected by other walls to the outside border, we never create loops.

## Experiments

Some things I thought might be interesting to look at.

### Shave

Removes all the "hairs" from the maze, which are walls that connect to a vertex that doesn't have any other walls connecting to it.
This is a way of simplifying the overall shape of the maze by removing the most petty obstacles.

If this process is repeated, all the walls will eventually shrink back into the maze borders.
This bears somewhat of a resemblance to the Ivy algorithm in reverse.
