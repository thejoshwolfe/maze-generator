(function() {
  var rectangleTopologyButton = window.document.getElementById("rectangleTopologyButton");
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

  var goButton = window.document.getElementById("goButton");
  var stepButton = window.document.getElementById("stepButton");
  var beDoneButton = window.document.getElementById("beDoneButton");
  var resetButton = window.document.getElementById("resetButton");
  var mazeSerializationTextbox = window.document.getElementById("mazeSerializationTextbox");

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
  var wallsPerVertexCheckbox = window.document.getElementById("wallsPerVertexCheckbox");
  var wallsPerVertexCanvas = window.document.getElementById("wallsPerVertexCanvas");
  var wallsPerVertex = null;

  var previousTopology;
  var generator;
  var previousAlgorithm;
  var maze;
  var mazeSerialization;
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

  initGenerator();
  function initGenerator(refresh) {
    stopAnimation();
    var topology = (function() {
      switch (true) {
        case rectangleTopologyButton.checked: return Maze;
        case cylinderTopologyButton.checked: return CylinderMaze;
        case torusTopologyButton.checked: return TorusMaze;
      }
      throw new Error();
    })();
    var sizeX = parseInt(sizeXTextbox.value, 10) || 1;
    var sizeY = parseInt(sizeYTextbox.value, 10) || 1;
    var algorithmFunction = (function() {
      switch (true) {
        case depthFirstSearchAlgorithmButton.checked: return DepthFirstSearchGenerator;
        case primAlgorithmButton.checked: return PrimGenerator;
        case kruskalAlgorithmButton.checked: return KruskalGenerator;
        case ivyAlgorithmButton.checked: return IvyGenerator;
        case depthFirstIvyAlgorithmButton.checked: return DepthFirstIvyGenerator;
      }
      throw new Error();
    })();
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
    previousTopology = topology;
    previousAlgorithm = algorithmFunction;
    generator = new algorithmFunction(topology, sizeX, sizeY);
    setMaze(generator.maze);
  }
  function setMaze(newMaze) {
    maze = newMaze;
    previousTopology = maze.constructor;
    rectangleTopologyButton.checked = previousTopology === Maze;
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
    // only normal left clicking
    if (event.shiftKey || event.ctrlKey || event.altKey) return;
    heldDownMouseButton = event.button;
    event.preventDefault();
    if (heldDownMouseButton === 0) {
      // left click
      // this only works on a done maze
      if (generator != null) return;
      var room = getRoomFromMouseEvent(event);
      if (room == null) return;
      pathFinderPoints.push(room);
      if (pathFinderPoints.length > 2) pathFinderPoints.shift();
      // double click to clear
      if (pathFinderPoints.length === 2 && pathFinderPoints[0] === pathFinderPoints[1]) pathFinderPoints = [];
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
      if (pathFinderPoints.length < 2) {
        pathFinderPoints.push(room);
      } else {
        pathFinderPoints[1] = room;
      }
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

  stepButton.addEventListener("click", function() {
    stepGenerator();
    refreshDisplay();
  });

  function getAnimationSpeed() {
    return 1 + Math.floor(1000 / Math.max(maze.sizeX, maze.sizeY));
  }

  goButton.addEventListener("click", function() {
    if (generator == null) initGenerator(true);
    if (animationInterval == null) {
      // go
      var animationSpeed = getAnimationSpeed();
      animationInterval = setInterval(function() {
        stepGenerator();
        refreshDisplay();
      }, animationSpeed);
      goButton.textContent = "Stop";
    } else {
      stopAnimation();
    }
  });
  function stopAnimation() {
    if (animationInterval == null) return;
    clearInterval(animationInterval);
    animationInterval = null;
    goButton.textContent = "Go";
  }
  beDoneButton.addEventListener("click", function() {
    stopAnimation();
    if (generator == null) initGenerator(true);
    while (generator != null) {
      stepGenerator();
    }
    refreshDisplay();
  });
  resetButton.addEventListener("click", function() {
    initGenerator(true);
  });

  mazeSerializationTextbox.addEventListener("keydown", function() {
    setTimeout(function() {
      if (mazeSerialization === mazeSerializationTextbox.value) return;
      var candidateMaze = Maze.fromSerialization(mazeSerializationTextbox.value);
      if (candidateMaze == null) return;
      generator = null;
      setMaze(candidateMaze);
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
    var row = getHistogramRow(doorsPerRoom, eventToMouseY(event, doorsPerRoomCanvas));
    if (row == null) return;
    doorsPerRoomHighlightMaze = new (maze.constructor)(maze.sizeX, maze.sizeY);
    row.values.forEach(function(i) {
      doorsPerRoomHighlightMaze.roomColors[i] = "#ff4444";
    });
    renderMaze();
  });
  doorsPerRoomCanvas.addEventListener("mouseout", function() {
    doorsPerRoomHighlightMaze = null;
    renderMaze();
  });
  wallsPerVertexCheckbox.addEventListener("click", function() {
    setTimeout(updateStatistics, 0);
  });
  wallsPerVertexCanvas.addEventListener("mousemove", function(event) {
    var row = getHistogramRow(wallsPerVertex, eventToMouseY(event, wallsPerVertexCanvas));
    if (row == null) return;
    wallsPerVertexHighlightMaze = new (maze.constructor)(maze.sizeX, maze.sizeY);
    row.values.forEach(function(i) {
      wallsPerVertexHighlightMaze.vertexColors[i] = "#ff4444";
    });
    renderMaze();
  });
  wallsPerVertexCanvas.addEventListener("mouseout", function() {
    wallsPerVertexHighlightMaze = null;
    renderMaze();
  });

  function stepGenerator() {
    generator.step();
    if (generator.isDone()) {
      generator = null;
      stopAnimation();
    }
  }

  function refreshDisplay() {
    renderMaze();
    updateStatistics();
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
      setEnabled(stepButton, !nowDone);

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
      ];
      var roomCount = maze.getRoomCount();
      for (var i = 0; i < roomCount; i++) {
        var doorCount = maze.roomToVectors(i).filter(function(vector) {
          return maze.edgeColors[vector.edge] === Maze.OPEN;
        }).length;
        doorsPerRoom[doorCount].values.push(i);
      }
    }
    renderHistogram(doorsPerRoomCanvas, doorsPerRoom);

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
    renderHistogram(wallsPerVertexCanvas, wallsPerVertex);
  }

  var histogramFontHeight = 16;
  // this is a guess. as of writing this,
  // the api to get the height including low-hanging glyphs like "g" are not supported yet
  // (except for ExperimentalCanvasFeatures in chrome).
  var moreRealisticHistorgramTextHeight = histogramFontHeight * 1.2;
  function renderHistogram(canvas, data) {
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
    context.fillStyle = "#8888ff";
    context.textAlign = "left";
    for (var i = 0; i < data.length; i++) {
      var barWidth = maxBarLength * data[i].values.length / longestPossibleBar;
      var x = maxLabelWidth;
      var y = moreRealisticHistorgramTextHeight * i;
      context.fillRect(x, y, barWidth, moreRealisticHistorgramTextHeight);
      context.strokeText(data[i].values.length, x + 3, y);
    }
  }
  function getHistogramRow(histogramData, pixelY) {
    // if we get mouse events for a hidden histogram for some reason.
    if (histogramData == null) return null;
    return histogramData[Math.floor(pixelY / moreRealisticHistorgramTextHeight)];
  }
  function setStatisticsHighlight(mazeStructure, historgramRow) {
  }

  function setEnabled(button, value) {
    if (value) {
      button.removeAttribute("disabled");
    } else {
      button.setAttribute("disabled", "");
    }
  }
})();
