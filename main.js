(function() {
  var canvas = window.document.getElementById("canvas");
  var stepButton = window.document.getElementById("stepButton");
  var goButton = window.document.getElementById("goButton");

  var generator = new KruskalGenerator(5, 5);
  generator.render(canvas);

  stepButton.addEventListener("click", function() {
    step();
  });

  var animationInterval = null;
  goButton.addEventListener("click", function() {
    if (animationInterval == null) {
      // go
      animationInterval = setInterval(function() {
        step();
      }, 100);
      goButton.textContent = "Stop";
    } else {
      // stop
      clearInterval(animationInterval);
      animationInterval = null;
      goButton.textcontent = "Go";
    }
  });

  function step() {
    generator.step();
    generator.render(canvas);
  }
})();
