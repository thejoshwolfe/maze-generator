(function() {
  var algorithmCombobox = window.document.getElementById("algorithmCombobox");
  var sizeXTextbox = window.document.getElementById("sizeXTextbox");
  var sizeYTextbox = window.document.getElementById("sizeYTextbox");
  var canvas = window.document.getElementById("canvas");
  var stepButton = window.document.getElementById("stepButton");
  var goButton = window.document.getElementById("goButton");
  var beDoneButton = window.document.getElementById("beDoneButton");
  var resetButton = window.document.getElementById("resetButton");

  var algorithms = {
    "KruskalGenerator": KruskalGenerator,
    "PrimGenerator": PrimGenerator,
    "DepthFirstSearchGenerator": DepthFirstSearchGenerator,
    "IvyGenerator": IvyGenerator,
  };
  var generator;
  var done;
  initGenerator();
  function initGenerator(refresh) {
    stopIt();
    var algorithmFunction = algorithms[algorithmCombobox.value];
    var sizeX = parseInt(sizeXTextbox.value, 10) || 1;
    var sizeY = parseInt(sizeYTextbox.value, 10) || 1;
    if (!refresh && generator != null) {
      // if nothing's changed, don't reset
      if (generator.constructor === algorithmFunction &&
          generator.sizeX === sizeX &&
          generator.sizeY === sizeY) {
        return;
      }
    }
    generator = new algorithmFunction(sizeX, sizeY);
    canvas.width = generator.getCanvasWidth();
    canvas.height = generator.getCanvasHeight();
    generator.render(canvas);
    done = false;
  }

  algorithmCombobox.addEventListener("change", function() {
    setTimeout(initGenerator, 0);
  });
  sizeXTextbox.addEventListener("keydown", function() {
    setTimeout(initGenerator, 0);
  });
  sizeYTextbox.addEventListener("keydown", function() {
    setTimeout(initGenerator, 0);
  });

  stepButton.addEventListener("click", function() {
    step();
  });

  var animationInterval = null;
  goButton.addEventListener("click", function() {
    if (done) initGenerator(true);
    if (animationInterval == null) {
      // go
      animationInterval = setInterval(function() {
        step();
      }, 1);
      goButton.textContent = "Stop";
    } else {
      stopIt();
    }
  });
  function stopIt() {
    if (animationInterval == null) return;
    clearInterval(animationInterval);
    animationInterval = null;
    goButton.textContent = "Go";
  }
  beDoneButton.addEventListener("click", function() {
    stopIt();
    if (done) initGenerator(true);
    while (!done) {
      done = !generator.step();
    }
    generator.render(canvas);
  });
  resetButton.addEventListener("click", function() {
    initGenerator(true);
  });

  function step() {
    done = !generator.step();
    generator.render(canvas);
    if (done && animationInterval != null) {
      stopIt();
    }
  }
})();
