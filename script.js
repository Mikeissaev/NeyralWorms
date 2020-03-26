(() => {

  var meter = new FPSMeter({ theme: 'transparent', top: '5px', right: '5px', left: 'auto', maxFps: '100', });
  const cnv = document.getElementById('canvas');
  const ctx = cnv.getContext('2d');

  let totalSteps = 0;
  let cw, ch, cx, cy;

  function resizeCanvas() {
    cw = cnv.width = innerWidth;
    ch = cnv.height = innerHeight;
    cx = cw / 2;
    cy = ch / 2;
  }
  resizeCanvas();
  window.addEventListener(`resize`, resizeCanvas);

  const cfg = {
    dotColor: "red",
    foodColor: "green",
    dotSize: 1,
    dotsCount: 1,
    cloningAge: 400,
    deathAge: 350,
    maxDotsCount: 5000,
    foodCount: 1000,
    foodEnergy: 100

  }

  function drawRect(color, x, y, w, h, shadowColor) {
    ctx.shadowColor = shadowColor || `rgb(0, 0, 0)`;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  class Food {
    constructor() {
      let x = Math.random() * cw;
      let y = Math.random() * ch;
      this.pos = { x, y };
      this.color = cfg.foodColor;
    }

    redrawFood() {
      let color = this.color;
      let size = cfg.dotSize;
      let x = this.pos.x - size / 2;
      let y = this.pos.y - size / 2;
      drawRect(color, x, y, size, size, color);
    }
  }

  let foodList = [];

  function drawFood() {
    for (; foodList.length < cfg.foodCount;) { addFood(); }
  }
  drawFood();


  class Dot {
    constructor(x, y, genom = { "layers": [{ "0": { "bias": 0.21825113309933905, "weights": { "0": 0.07560224594354947, "1": 0.16809978421211202, "2": 0.12878074058700317, "3": 0.014221078183548924, "4": 0.27958162738535103, "5": -0.11039566792716649, "6": 0.15677244207345753, "7": -0.0019963677098969596, "8": 0.32898852811920487 } }, "1": { "bias": 0.2331163493985023, "weights": { "0": -0.1945563377782536, "1": 0.22268576551495117, "2": -0.009287299886353826, "3": -0.0954746740962543, "4": 0.017080447122836573, "5": 0.19792993647285723, "6": 0.14834866579937822, "7": 0.07104596536920191, "8": 0.2650679509316736 } }, "2": { "bias": 0.23787563761765165, "weights": { "0": 0.0032594691925501296, "1": -0.021131266211040476, "2": 0.17145976604350135, "3": 0.05749660200553813, "4": -0.051531643540748684, "5": -0.14208891331217047, "6": 0.04211887074105744, "7": 0.1490872445024465, "8": 0.18831975054950043 } }, "3": { "bias": 0.13371504073061855, "weights": { "0": -0.045147491241197824, "1": 0.041959409286722926, "2": 0.31418186805249804, "3": -0.09068915057945333, "4": 0.29370041239222433, "5": 0.15259935663206958, "6": -0.13457169057585833, "7": 0.11118318379207706, "8": 0.3189241585095456 } } }, { "0": { "bias": -0.8982527814841518, "weights": { "0": -0.7270635702359959, "1": -0.5128692152637452, "2": -0.538411901180936, "3": -0.5669021412070667 } }, "1": { "bias": 1.0712737447236491, "weights": { "0": 0.5560418153308008, "1": 0.33378222330948465, "2": 0.44894638886894744, "3": 0.7275706463720644 } }, "2": { "bias": -1.025983355420471, "weights": { "0": -0.5224641192997191, "1": -0.6981258265061033, "2": -0.44798962061260433, "3": -0.49902559715638567 } } }] }) {
      this.pos = { x: x, y: y };
      this.dir = 0;
      this.step = 0;
      this.age = 0;
      this.genom = genom;
      
    }

    redrawDot() {
      let color = cfg.dotColor;
      let size = cfg.dotSize;
      let x = this.pos.x - size / 2;
      let y = this.pos.y - size / 2;

      drawRect(color, x, y, size, size, color);
    }

    moveDot() {

      if (this.pos.x >= cw) {
        this.pos.x = cw - 3;
      }
      if (this.pos.x <= 3) {
        this.pos.x = 3;
      }
      if (this.pos.y >= ch) {
        this.pos.y = ch - 3;
      }
      if (this.pos.y <= 3) {
        this.pos.y = 3;
      }

      this.age++;
      this.step++;
      this.pos.x += dirsList[this.dir].x;
      this.pos.y += dirsList[this.dir].y;
    }

    changeDir() {
      this.dir = Math.random() > 0.5 ? (this.dir + 1) % 8 : (this.dir + 7) % 8;
    }


    killDot(id) {

      if (this.age >= cfg.cloningAge) {
        addDot(this.pos.x, this.pos.y);
        addDot(this.pos.x, this.pos.y);
        dotsList.splice(id, 1);
      }
      if (this.step == cfg.deathAge) {
        dotsList.splice(id, 1);
      }
    }

    getFood(id) {
      for (let i = 0; i < foodList.length; i++) {
        if (Math.trunc(dotsList[id].pos.x) == Math.trunc(foodList[i].pos.x) && Math.trunc(dotsList[id].pos.y) == Math.trunc(foodList[i].pos.y)) {
          foodList.splice(i, 1);
          this.step -= cfg.foodEnergy;
        }
      }
    }
  }

  let dirsList = [];

  function createDirs() {
    for (let i = 0; i < 360; i += 45) {
      let x = Math.cos(i * Math.PI / 180);
      let y = Math.sin(i * Math.PI / 180);
      dirsList.push({ x: x, y: y });
    }
  }
  createDirs();

  function addFood() {
    if (foodList.length < cfg.foodCount) {
      foodList.push(new Food());
    }
  }
  let dotsList = [];

  function addDot(x = cx, y = cy, genom) {
    if (dotsList.length < cfg.maxDotsCount) {
      dotsList.push(new Dot(x, y, genom));
    }

  }

  function refreshFood() {
    foodList.forEach((i) => {
      i.redrawFood();
    })
  }

  function refreshDots() {
    dotsList.forEach((i, id) => {
      i.redrawDot();
      i.moveDot();
      i.changeDir();
      i.getFood(id);
      i.killDot(id);
    });

  }

  //console.log(neyralNet(vector, net));
  function neyralNet(input, net) {
    for (var i = 0; i < 2; i++) {
      var layer = net.layers[i];
      var output = {};
      for (var id in layer) {
        var node = layer[id];
        console.log("bias: " + node.bias);
        var sum = node.bias;
        for (var iid in node.weights) {
          console.log("weight[" + iid + "]: " + node.weights[iid]);
          sum += node.weights[iid] * input[iid];
        }
        output[id] = (1 / (1 + Math.exp(-sum)));
      }
      input = output;
    }
    return output;
  }


  function loop() {
    drawRect(`rgba(0, 0, 0, 0.1)`, 0, 0, cw, ch);

    if (dotsList.length < cfg.dotsCount) { addDot(); }
    addFood();
    refreshFood();
    refreshDots();

    totalSteps++;
    document.getElementById('totalSteps').innerHTML = totalSteps;
    document.getElementById('countWorms').innerHTML = dotsList.length;
    document.getElementById('foodCount').innerHTML = foodList.length;

    meter.tick();
    requestAnimationFrame(loop);
  }
  loop();

})();