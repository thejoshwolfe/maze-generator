(function() {
  var rectangleTopologyButton = window.document.getElementById("rectangleTopologyButton");
  var outdoorTopologyButton = window.document.getElementById("outdoorTopologyButton");
  var cylinderTopologyButton = window.document.getElementById("cylinderTopologyButton");
  var torusTopologyButton = window.document.getElementById("torusTopologyButton");

  var sizeXTextbox = window.document.getElementById("sizeXTextbox");
  var sizeYTextbox = window.document.getElementById("sizeYTextbox");

  var depthFirstSearchAlgorithmButton = window.document.getElementById("depthFirstSearchAlgorithmButton");
  var primAlgorithmButton = window.document.getElementById("primAlgorithmButton");
  var kruskalAlgorithmButton = window.document.getElementById("kruskalAlgorithmButton");
  var ivyAlgorithmButton = window.document.getElementById("ivyAlgorithmButton");
  var depthFirstIvyAlgorithmButton = window.document.getElementById("depthFirstIvyAlgorithmButton");

  var mazeCanvas = window.document.getElementById("mazeCanvas");

  var mazeSerializationTextbox = window.document.getElementById("mazeSerializationTextbox");
  var generationGoButton = window.document.getElementById("generationGoButton");
  var generationStepButton = window.document.getElementById("generationStepButton");
  var generationBeDoneButton = window.document.getElementById("generationBeDoneButton");
  var generationResetButton = window.document.getElementById("generationResetButton");

  var longestPathGoButton = window.document.getElementById("longestPathGoButton");
  var longestPathStepButton = window.document.getElementById("longestPathStepButton");
  var longestPathBeDoneButton = window.document.getElementById("longestPathBeDoneButton");
  var longestPathResetButton = window.document.getElementById("longestPathResetButton");

  var shaveButton = window.document.getElementById("shaveButton");
  var caveInButton = window.document.getElementById("caveInButton");
  var resetExperimentsButton = window.document.getElementById("resetExperimentsButton");

  var doorsPerRoomCheckbox = window.document.getElementById("doorsPerRoomCheckbox");
  var doorsPerRoomCanvas = window.document.getElementById("doorsPerRoomCanvas");
  var doorsPerRoom = null;
  var doorsPerRoomHighlightIndex = null;
  var wallsPerVertexCheckbox = window.document.getElementById("wallsPerVertexCheckbox");
  var wallsPerVertexCanvas = window.document.getElementById("wallsPerVertexCanvas");
  var wallsPerVertex = null;
  var wallsPerVertexHighlightIndex = null;

  var previousTopology;
  var generator;
  var generatorOptions;
  var previousAlgorithm;
  var maze;
  var mazeSerialization = "";
  var mazeRenderer;

  var animationInterval = null;
  var wasDone = true;
  var longestPathAnimationInterval = null;

  var longestPathFinder;
  var longestPathHighlightMaze;
  var pathFinderPoints = [];
  var pathHighlightMaze = null;

  var doorsPerRoomHighlightMaze = null;
  var wallsPerVertexHighlightMaze = null;

  var experimentalMode = null;

  specifySerialization(getSerializationFromUrl());
  if (mazeSerialization === "") {
    // the url serialization was not present or didn't work.
    // start from scratch.
    initGenerator();
  }
  function initGenerator(refresh) {
    stopAnimation();
    var topology = (function() {
      switch (true) {
        case rectangleTopologyButton.checked: return Maze;
        case outdoorTopologyButton.checked: return OutdoorMaze
        case cylinderTopologyButton.checked: return CylinderMaze;
        case torusTopologyButton.checked: return TorusMaze;
      }
      throw new Error();
    })();
    var sizeX = parseInt(sizeXTextbox.value, 10) || 1;
    var sizeY = parseInt(sizeYTextbox.value, 10) || 1;
    var algorithmFunction = getAlgorithmFromUi();
    if (!refresh) {
      // if nothing's changed, don't reset.
      // this happens when using the arrow keys in the size boxes.
      if (previousTopology === topology &&
          previousAlgorithm === algorithmFunction &&
          maze.sizeX === sizeX &&
          maze.sizeY === sizeY) {
        return;
      }
    }
    previousAlgorithm = algorithmFunction;
    generator = new algorithmFunction(topology, sizeX, sizeY);
    generatorOptions = generator.getOptions();
    var newMaze = generator.maze;
    if (generatorOptions == null) {
      // well that was easy. we're already done.
      generator = null;
    }
    setMaze(newMaze);
  }
  function getAlgorithmFromUi() {
    switch (true) {
      case depthFirstSearchAlgorithmButton.checked: return DepthFirstSearchGenerator;
      case primAlgorithmButton.checked: return PrimGenerator;
      case kruskalAlgorithmButton.checked: return KruskalGenerator;
      case ivyAlgorithmButton.checked: return IvyGenerator;
      case depthFirstIvyAlgorithmButton.checked: return DepthFirstIvyGenerator;
    }
    throw new Error();
  }
  function setMaze(newMaze) {
    maze = newMaze;
    window._debug_maze = newMaze;
    previousTopology = maze.constructor;
    rectangleTopologyButton.checked = previousTopology === Maze;
    outdoorTopologyButton.checked = previousTopology === OutdoorMaze;
    cylinderTopologyButton.checked = previousTopology === CylinderMaze;
    torusTopologyButton.checked = previousTopology === TorusMaze;
    sizeXTextbox.value = maze.sizeX.toString();
    sizeYTextbox.value = maze.sizeY.toString();

    longestPathFinder = null;
    longestPathHighlightMaze = null;
    pathHighlightMaze = null;
    pathFinderPoints = [];
    doorsPerRoomHighlightMaze = null;
    wallsPerVertexHighlightMaze = null;

    experimentalMode = null;

    mazeRenderer = maze.makeRenderer(mazeCanvas);
    refreshDisplay();
  }

  function waitAndInitGenerator() {
    setTimeout(initGenerator, 0);
  }

  rectangleTopologyButton.addEventListener("click", waitAndInitGenerator);
  outdoorTopologyButton.addEventListener("click", waitAndInitGenerator);
  cylinderTopologyButton.addEventListener("click", waitAndInitGenerator);
  torusTopologyButton.addEventListener("click", waitAndInitGenerator);

  sizeXTextbox.addEventListener("keydown", waitAndInitGenerator);
  sizeYTextbox.addEventListener("keydown", waitAndInitGenerator);

  depthFirstSearchAlgorithmButton.addEventListener("click", waitAndInitGenerator);
  primAlgorithmButton.addEventListener("click", waitAndInitGenerator);
  kruskalAlgorithmButton.addEventListener("click", waitAndInitGenerator);
  ivyAlgorithmButton.addEventListener("click", waitAndInitGenerator);
  depthFirstIvyAlgorithmButton.addEventListener("click", waitAndInitGenerator);

  var heldDownMouseButton = null;
  var scrollDragAnchorX;
  var scrollDragAnchorY;
  mazeCanvas.addEventListener("mousedown", function(event) {
    if (event.shiftKey || event.ctrlKey || event.altKey) return;
    heldDownMouseButton = event.button;
    event.preventDefault();
    if (heldDownMouseButton === 0) {
      // left click
      // this only works on a done maze
      if (generator != null) return;
      var room = getRoomFromMouseEvent(event);
      if (room == null) return;
      // double click to clear
      if (pathFinderPoints[0] === room) {
        pathFinderPoints = [];
      } else {
        // this is the start point
        pathFinderPoints = [room];
      }
      renderPath();
    } else {
      // right or middle click
      scrollDragAnchorX = eventToMouseX(event, mazeCanvas);
      scrollDragAnchorY = eventToMouseY(event, mazeCanvas);
    }
  });
  function eventToMouseX(event, canvas) { return event.clientX - canvas.getBoundingClientRect().left; }
  function eventToMouseY(event, canvas) { return event.clientY - canvas.getBoundingClientRect().top; }
  // why on the window instead of the canvas? see http://stackoverflow.com/questions/5418740/jquery-mouseup-outside-window-possible/5419564#5419564
  window.addEventListener("mouseup", function() {
    heldDownMouseButton = null;
  });
  mazeCanvas.addEventListener("mousemove", function(event) {
    if (heldDownMouseButton === 0) {
      // left-click drag
      // this only works on a done maze
      if (generator != null) return;
      var room = getRoomFromMouseEvent(event);
      if (room == null) return;
      if (pathFinderPoints.length === 0) {
        // dragged in from out of bounds or dragging after double-click to clear.
        return;
      }
      if (pathFinderPoints[pathFinderPoints.length - 1] === room) {
        // dragging around, but hasn't left the inital room yet.
        return;
      }
      // this is the end point
      pathFinderPoints[1] = room;
      renderPath();
    } else if (heldDownMouseButton === 2) {
      // right- or middle-click drag
      var x = eventToMouseX(event, mazeCanvas);
      var y = eventToMouseY(event, mazeCanvas);
      var deltaX = x - scrollDragAnchorX;
      var deltaY = y - scrollDragAnchorY;
      scrollDragAnchorX = x;
      scrollDragAnchorY = y;
      mazeRenderer.scroll(deltaX, deltaY);
      refreshDisplay();
    }
  });
  function getRoomFromMouseEvent(event) {
    var roomLocation = mazeRenderer.getRoomLocationFromPixelLocation(eventToMouseX(event, mazeCanvas), eventToMouseY(event, mazeCanvas));
    if (roomLocation == null) return null;
    return maze.getRoomFromLocation(roomLocation.x, roomLocation.y);
  }
  mazeCanvas.addEventListener("contextmenu", function(event) {
    if (event.shiftKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
  });

  var PATH_HILIGHT = "#ffaaaa";
  function renderPath() {
    if (pathFinderPoints.length === 0) {
      pathHighlightMaze = null;
    } else {
      pathHighlightMaze = new (maze.constructor)(maze.sizeX, maze.sizeY);
      if (pathFinderPoints.length === 1) {
        pathHighlightMaze.roomColors[pathFinderPoints[0]] = PATH_HILIGHT;
      } else {
        var path = dijkstraSearch(maze, pathFinderPoints[0], pathFinderPoints[1]);
        if (path != null) {
          while (true) {
            var room = path.pop();
            pathHighlightMaze.roomColors[room] = PATH_HILIGHT;
            if (path.length === 0) break;
            var edge = path.pop();
            pathHighlightMaze.edgeColors[edge] = PATH_HILIGHT;
          }
        }
      }
    }

    refreshDisplay();
  }

  generationStepButton.addEventListener("click", function() {
    stepGenerator();
    refreshDisplay();
  });

  function getAnimationSpeed() {
    return 1 + Math.floor(1000 / Math.max(maze.sizeX, maze.sizeY));
  }

  generationGoButton.addEventListener("click", function() {
    if (generator == null) initGenerator(true);
    if (animationInterval == null) {
      // go
      var animationSpeed = getAnimationSpeed();
      animationInterval = setInterval(function() {
        stepGenerator();
        refreshDisplay();
      }, animationSpeed);
      generationGoButton.textContent = "Stop";
    } else {
      stopAnimation();
    }
  });
  function stopAnimation() {
    if (animationInterval == null) return;
    clearInterval(animationInterval);
    animationInterval = null;
    generationGoButton.textContent = "Go";
  }
  generationBeDoneButton.addEventListener("click", function() {
    stopAnimation();
    if (generator == null) initGenerator(true);
    while (generator != null) {
      stepGenerator();
    }
    refreshDisplay();
  });
  generationResetButton.addEventListener("click", function() {
    initGenerator(true);
  });

  mazeSerializationTextbox.addEventListener("keydown", function() {
    setTimeout(function() {
      specifySerialization(mazeSerializationTextbox.value);
    }, 0);
  });

  longestPathGoButton.addEventListener("click", function() {
    if (longestPathAnimationInterval == null) {
      // go
      var animationSpeed = getAnimationSpeed();
      longestPathAnimationInterval = setInterval(function() {
        longestPathStep();
        refreshDisplay();
      }, animationSpeed);
      longestPathGoButton.textContent = "Stop";
    } else {
      longestPathStopAnimation();
    }
  });
  longestPathStepButton.addEventListener("click", function() {
    longestPathStep();
    refreshDisplay();
  });
  longestPathBeDoneButton.addEventListener("click", function() {
    longestPathStep();
    while (longestPathFinder != null) {
      longestPathStep();
    }
    refreshDisplay();
  });
  longestPathResetButton.addEventListener("click", function() {
    longestPathStopAnimation();
    longestPathFinder = null;
    longestPathHighlightMaze = null;
    refreshDisplay();
  });
  function longestPathStopAnimation() {
    if (longestPathAnimationInterval == null) return;
    clearInterval(longestPathAnimationInterval);
    longestPathAnimationInterval = null;
    longestPathGoButton.textContent = "Go";
  }
  function longestPathStep() {
    if (longestPathFinder == null) {
      longestPathFinder = new LongestPathFinder(maze);
      longestPathHighlightMaze = longestPathFinder.roomHighlightMaze;
    } else {
      longestPathFinder.step();
    }
    var endPoints = longestPathFinder.getEndPoints();
    if (endPoints === LongestPathFinder.NOT_DONE_YET) return;
    // done
    longestPathStopAnimation();
    longestPathFinder = null;
    if (endPoints === LongestPathFinder.IMPOSSIBLE) return;
    longestPathHighlightMaze = new (maze.constructor)(maze.sizeX, maze.sizeY);
    longestPathHighlightMaze.roomColors[endPoints[0]] = "#ff4444";
    longestPathHighlightMaze.roomColors[endPoints[1]] = "#ff4444";
  }

  shaveButton.addEventListener("click", function() {
    experimentalMode = "shave";
    maze.shave();
    refreshDisplay();
  });
  caveInButton.addEventListener("click", function() {
    experimentalMode = "caveIn";
    maze.caveIn();
    refreshDisplay();
  });
  resetExperimentsButton.addEventListener("click", function() {
    generator = null;
    setMaze(Maze.fromSerialization(mazeSerialization));
  });

  doorsPerRoomCheckbox.addEventListener("click", function() {
    setTimeout(updateStatistics, 0);
  });
  doorsPerRoomCanvas.addEventListener("mousemove", function(event) {
    doorsPerRoomHighlightIndex = getHistogramRowIndex(doorsPerRoom, eventToMouseY(event, doorsPerRoomCanvas));
    updateDoorsPerRoomHighlightMaze();
    renderMaze();
    renderHistogram(doorsPerRoomCanvas, doorsPerRoom, doorsPerRoomHighlightIndex);
  });
  doorsPerRoomCanvas.addEventListener("mouseout", function() {
    doorsPerRoomHighlightMaze = null;
    doorsPerRoomHighlightIndex = null;
    renderMaze();
    renderHistogram(doorsPerRoomCanvas, doorsPerRoom, doorsPerRoomHighlightIndex);
  });
  function updateDoorsPerRoomHighlightMaze() {
    if (doorsPerRoomHighlightIndex != null) {
      doorsPerRoomHighlightMaze = new (maze.constructor)(maze.sizeX, maze.sizeY);
      doorsPerRoom[doorsPerRoomHighlightIndex].values.forEach(function(i) {
        doorsPerRoomHighlightMaze.roomColors[i] = "#ff4444";
      });
    } else {
      doorsPerRoomHighlightMaze = null;
    }
  }
  wallsPerVertexCheckbox.addEventListener("click", function() {
    setTimeout(updateStatistics, 0);
  });
  wallsPerVertexCanvas.addEventListener("mousemove", function(event) {
    wallsPerVertexHighlightIndex = getHistogramRowIndex(wallsPerVertex, eventToMouseY(event, wallsPerVertexCanvas));
    updateWallsPerVertexHighlightMaze();
    renderMaze();
    renderHistogram(wallsPerVertexCanvas, wallsPerVertex, wallsPerVertexHighlightIndex);
  });
  wallsPerVertexCanvas.addEventListener("mouseout", function() {
    wallsPerVertexHighlightMaze = null;
    wallsPerVertexHighlightIndex = null;
    renderMaze();
    renderHistogram(wallsPerVertexCanvas, wallsPerVertex, wallsPerVertexHighlightIndex);
  });
  function updateWallsPerVertexHighlightMaze() {
    if (wallsPerVertexHighlightIndex != null) {
      wallsPerVertexHighlightMaze = new (maze.constructor)(maze.sizeX, maze.sizeY);
      wallsPerVertex[wallsPerVertexHighlightIndex].values.forEach(function(i) {
        wallsPerVertexHighlightMaze.vertexColors[i] = "#ff4444";
      });
    } else {
      wallsPerVertexHighlightMaze = null;
    }
  }

  function stepGenerator() {
    if (generatorOptions != null) {
      // let's do something
      var index = util.randomInt(generatorOptions.values.length);
      generator.doOption(index);
    }
    generatorOptions = generator.getOptions();
    if (generatorOptions == null) {
      // and now we're done
      generator = null;
      stopAnimation();
    }
  }

  function refreshDisplay() {
    updateStatistics();
    updateDoorsPerRoomHighlightMaze();
    updateWallsPerVertexHighlightMaze();
    renderMaze();
  }
  function renderMaze() {
    var context = mazeCanvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);
    if (longestPathHighlightMaze != null) {
      mazeRenderer.render(longestPathHighlightMaze);
    }
    if (pathHighlightMaze != null) {
      mazeRenderer.render(pathHighlightMaze);
    }
    mazeRenderer.render(maze);
    if (doorsPerRoomHighlightMaze != null) {
      mazeRenderer.render(doorsPerRoomHighlightMaze, {roomSpacing:mazeRenderer.cellSize / 2});
    }
    if (wallsPerVertexHighlightMaze != null) {
      mazeRenderer.render(wallsPerVertexHighlightMaze, {vertexThickness:mazeRenderer.cellSize / 2});
    }

    var nowDone = generator == null;
    if (nowDone !== wasDone) {
      setEnabled(generationStepButton, !nowDone);

      mazeSerialization = nowDone ? maze.getSerialization() : "";
      mazeSerializationTextbox.value = mazeSerialization;
    }
    if (!nowDone) {
      setEnabled(longestPathGoButton, false);
      setEnabled(longestPathStepButton, false);
      setEnabled(longestPathBeDoneButton, false);
      setEnabled(longestPathResetButton, false);
      setEnabled(shaveButton, false);
      setEnabled(caveInButton, false);
      setEnabled(resetExperimentsButton, false);
    } else {
      setEnabled(longestPathGoButton, experimentalMode == null);
      setEnabled(longestPathStepButton, experimentalMode == null);
      setEnabled(longestPathBeDoneButton, experimentalMode == null);
      setEnabled(longestPathResetButton, longestPathHighlightMaze != null);
      setEnabled(shaveButton, experimentalMode == null || experimentalMode === "shave");
      setEnabled(caveInButton, experimentalMode == null || experimentalMode === "caveIn");
      setEnabled(resetExperimentsButton, experimentalMode != null);
    }
    wasDone = nowDone;
  }

  function updateStatistics() {
    doorsPerRoom = null;
    if (doorsPerRoomCheckbox.checked) {
      doorsPerRoom = [
        {label: "0", values: []},
        {label: "1", values: []},
        {label: "2", values: []},
        {label: "3", values: []},
        {label: "4", values: []},
        {label: "?", values: []},
      ];
      var roomCount = maze.getRoomCount();
      for (var i = 0; i < roomCount; i++) {
        var doorCount = maze.roomToVectors(i).filter(function(vector) {
          return maze.edgeColors[vector.edge] === Maze.OPEN;
        }).length;
        if (doorCount < 5) {
          doorsPerRoom[doorCount].values.push(i);
        } else {
          // outdoor rooms can have an arbitrary number of rooms
          // we'll need another for outdoor cylinders
          doorsPerRoom[5].values.push(i);
          doorsPerRoom[5].label = doorCount.toString();
        }
      }
      if (doorsPerRoom[5].values.length === 0) {
        // usually blank, so don't show it
        doorsPerRoom.pop();
      }
    }
    renderHistogram(doorsPerRoomCanvas, doorsPerRoom, doorsPerRoomHighlightIndex);

    wallsPerVertex = null;
    if (wallsPerVertexCheckbox.checked) {
      wallsPerVertex = [
        {label: "0", values: []},
        {label: "1", values: []},
        {label: "2", values: []},
        {label: "3", values: []},
        {label: "4", values: []},
      ];
      var vertexCount = maze.getVertexCount();
      for (var i = 0; i < vertexCount; i++) {
        var wallCount = maze.vertexToEdges(i).filter(function(edge) {
          return maze.edgeColors[edge] === Maze.FILLED;
        }).length;
        wallsPerVertex[wallCount].values.push(i);
      }
    }
    renderHistogram(wallsPerVertexCanvas, wallsPerVertex, wallsPerVertexHighlightIndex);
  }

  var histogramFontHeight = 16;
  // this is a guess. as of writing this,
  // the api to get the height including low-hanging glyphs like "g" are not supported yet
  // (except for ExperimentalCanvasFeatures in chrome).
  var moreRealisticHistorgramTextHeight = histogramFontHeight * 1.2;
  function renderHistogram(canvas, data, highlightRowIndex) {
    if (data == null) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    // figure out how big everything's going to be
    var font = histogramFontHeight + "px sans-serif";
    var measuringContext = canvas.getContext("2d");
    measuringContext.font = font;
    var maxLabelWidth = 0;
    var longestPossibleBar = 0;
    for (var i = 0; i < data.length; i++) {
      var textMetrics = measuringContext.measureText(data[i].label);
      // it's too bad this TextMetrics object doesn't have a .height property too.
      maxLabelWidth = Math.max(maxLabelWidth, textMetrics.width);
      longestPossibleBar += data[i].values.length;
    }
    var graphWidth = Math.max(300, maxLabelWidth + 200);
    canvas.height = data.length * moreRealisticHistorgramTextHeight;
    canvas.width = graphWidth;

    // reget the context after resizing the canvas?
    var context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = font;
    context.textBaseline = "top";
    context.textAlign = "right";
    context.strokeStyle = "#000000";
    for (var i = 0; i < data.length; i++) {
      context.strokeText(data[i].label, maxLabelWidth, moreRealisticHistorgramTextHeight * i);
    }
    var maxBarLength = graphWidth - maxLabelWidth;
    context.textAlign = "left";
    for (var i = 0; i < data.length; i++) {
      if (i === highlightRowIndex) {
        context.fillStyle = "#ff8888";
      } else {
        context.fillStyle = "#8888ff";
      }
      var barWidth = maxBarLength * data[i].values.length / longestPossibleBar;
      var x = maxLabelWidth;
      var y = moreRealisticHistorgramTextHeight * i;
      context.fillRect(x, y, barWidth, moreRealisticHistorgramTextHeight);
      context.strokeText(data[i].values.length, x + 3, y);
    }
  }
  function getHistogramRowIndex(histogramData, pixelY) {
    // if we get mouse events for a hidden histogram for some reason.
    if (histogramData == null) return null;
    var index = Math.floor(pixelY / moreRealisticHistorgramTextHeight);
    // bounds check
    if (!(0 <= index && index < histogramData.length)) return null;
    return index;
  }

  function setEnabled(button, value) {
    if (value) {
      button.removeAttribute("disabled");
    } else {
      button.setAttribute("disabled", "");
    }
  }

  function specifySerialization(newSerialization) {
    if (mazeSerialization === newSerialization) return;
    var candidateMaze = Maze.fromSerialization(newSerialization);
    if (candidateMaze == null) return;
    generator = null;
    // make sure we think this new maze is a cool new idea
    wasDone = false;
    setMaze(candidateMaze);
    // The algorithm is not stored in the data, so read the algorithm from the ui.
    // This prevents resetting the maze if you click on the already-selected default algorithm radio button
    // after loading the page with a serialization data url.
    previousAlgorithm = getAlgorithmFromUi();
  }
  function getSerializationFromUrl() {
    var match = /#data=(.*)/.exec(location.hash);
    if (match == null) return "";
    return match[1];
  }
})();
