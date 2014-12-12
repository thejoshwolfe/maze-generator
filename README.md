# maze-generator

studying various maze generator algorithms.

## Live Demo

http://wolfesoftware.com/maze-generator/

## What Counts as a Maze?

The mazes studied by this project are 2D grids of rooms that can have walls between the rooms.
Given any two rooms anywhere in the grid, there must be one and only one path between them.
This means that all rooms are accessible, and there are no loops in the maze.

Any two rooms in the maze could be chosen as the entrance and exit, and there would only be one path between them.
The Longest Path section below describes one attempt at choosing an entrance and exit that isn't boring.


## Topology

### Rectangle

The rectangle topology is what we're all used to.
It's got a border of walls around it.

### Torus

A torus topology is what you find in [Asteroids](http://en.wikipedia.org/wiki/Asteroids_%28video_game%29).
The right and left sides are connected together, so a maze traversal could go off one side and show up on the other side.
The same is true for up and down.

But that's the simple understanding of a toroidal topology.
A more correct understanding loses the distinction between the "right side" and the "left side".
Try right-click dragging a torus maze, and see that the entire thing repeats itself seamlessly in all directions.
There is no center; in fact, there is no specific location that is special in any way.

Toroidal topologies are difficult to understand, but are actually more mathematically elegant.
Since there are no border walls, there are fewer exceptions to questions like "how many open doors can a room have?"

Currently, the Ivy and Depth-First Ivy generators do not work properly in a torus topology.
They will both always create a maze with 2 loops.


## Maze Generating Algorithms

See Wikipedia's page on [maze generator algorithms](http://en.wikipedia.org/wiki/Maze_generation_algorithm).
I've also added some of my own here.

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
Since every vertex is connected by a chain of walls to the outside border, we never create a loop, which would necessitate either an "island" of walls or a 2x2 open space, i.e. a vertex with no walls.

This algorithm is to vertexes, walls, and the border as the Prim algorithm is to rooms, doorways, and a random starting room.

### Depth-First Ivy

Like the Ivy algorithm above, but instead of randomly selecting among the vertexes adjacent to existing walls, traverse the open space like the Depth-First Search algorithm above.

The reasons why this creates a correct maze are the same as for the Ivy algorithm.

This algorithm is to vertexes, walls, and a random starting point on the border as the Depth-First Search algorithm is to rooms, doorways, and a random starting room.


## Longest Path

In a randomly generated maze, there isn't always an obvious entrance and exit.
In most mazes people are used to, the entracne and exit are points on the border of the maze,
ususally represented as doorways to the outside of the maze.
Picking an entrance and exit so as to make the maze "fun" is a difficult challenge,
especially with the constraint that the entrance and exit must be on the border.

In this project, there is an algorithm to find the two points in the maze that have the longest path between them.
These points are often inside the maze, rather than on the border.
(In fact, in Depth-First Ivy mazes, the points along the border is always connected by an obvious path,
so picking entrance and exit points along the border would be very boring.)

The two points this algorithm chooses is the recommended start and end point.
Picking which of the two is the start and which is the end is outside the scope of this project.
The path between the points is the same regardless of which direction you travel.

### The Algorithm

The algorithm follows the Cave In experiment below.
Start a traversal at every dead end (room with only 1 door).
Step all traversals forward in parallel at every step of the way.
Each traversal should fill in each room it enters.
When a traversal encounters a fork in the road, the traversal stops in failure.
When there's only two traversals left, and they meet, they combine to form the longest path.

The reason this works is that an intersection of paths will be visited multiple times.
Whichever traversal took the longest path to get to the intersection must have traveled the longest path to get there.
Therefore, any traversals that arrive too soon are failures.


## Path Finding

You can click two points on the maze to find the path between them.
This uses an [A* search algorithm](http://en.wikipedia.org/wiki/A*_search_algorithm).
You can also click and drag.

See also [issue 5](https://github.com/thejoshwolfe/maze-generator/issues/5).


## Experiments

Some things I thought might be interesting to look at.

### Shave

Removes all the "hairs" from the maze, which are walls that connect to a vertex that doesn't have any other walls connecting to it.
This is a way of simplifying the overall shape of the maze by removing the most petty obstacles.

If this process is repeated, all the walls will eventually shrink back into the maze borders.
This resembles the Ivy algorithm in reverse.

### Cave In

Fills in any room with only one open door (or no open doors).
This fills in all the dead ends in the maze.

Since there is no designated entrance and exit, all paths inevitably lead to dead ends.
This means repeating the Cave In process will eventually fill in the entire maze.
If there were a designated entrance and exit which were preserved from being filled in,
repeating this process would leave only a direct path from the entrance to the exit.
