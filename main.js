(function() {
  var canvas = window.document.getElementById("canvas");
  var stepButton = window.document.getElementById("stepButton");
  var goButton = window.document.getElementById("goButton");
  var beDoneButton = window.document.getElementById("beDoneButton");

  var generator = new KruskalGenerator(15, 15);
  generator.render(canvas);
  var done = false;

  stepButton.addEventListener("click", function() {
    step();
  });

  var animationInterval = null;
  goButton.addEventListener("click", function() {
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
    clearInterval(animationInterval);
    animationInterval = null;
    goButton.textContent = "Go";
  }
  beDoneButton.addEventListener("click", function() {
    if (animationInterval != null) {
      stopIt();
    }
    while (!done) {
      done = !generator.step();
    }
    generator.render(canvas);
  });

  function step() {
    done = !generator.step();
    generator.render(canvas);
    if (done && animationInterval != null) {
      stopIt();
    }
  }
})();
