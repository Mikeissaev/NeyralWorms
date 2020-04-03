(() => {
  
  let meter = new FPSMeter({ theme: 'transparent', top: '5px', right: '5px', left: 'auto', maxFps: '100', });
  const cnv = document.getElementById('canvas');
  const ctx = cnv.getContext('2d');
  let bestGenom =  {
     "layers": [{
       "0": {},
       "1": {},
       "2": {},
       "3": {},
       "4": {},
       "5": {},
       "6": {},
       "7": {}
      }, {
       "0": {
         "bias": -0.18714835232437588,
         "weights": {
           "0": 0.11213242074065967,
           "1": 0.027806164952238047,
           "2": 0.05044802746272164,
           "3": -0.1651908216874217,
           "4": 0.012364573806505418,
           "5": -0.3428547504181833,
           "6": -0.19872322546880705,
           "7": -0.3579792223678776
         }
       },
       "1": {
         "bias": 0.44879558359703864,
         "weights": {
           "0": 1.2975984748652405,
           "1": 0.8359576986529169,
           "2": 0.11819660663704712,
           "3": -0.4319064078520114,
           "4": -0.8899485776570251,
           "5": -1.2383134343458704,
           "6": -1.6335843246268942,
           "7": -2.058239431023936
         }
       },
       "2": {
         "bias": -0.16989262396518354,
         "weights": {
           "0": -0.27779335321399723,
           "1": 0.004492207199043368,
           "2": -0.06066089382992712,
           "3": 0.08260593256750239,
           "4": -0.019929040554616063,
           "5": 0.08589294744789978,
           "6": 0.5208463295389794,
           "7": 0.7127348399138722
         }
       },
       "3": {
         "bias": -0.07491091120740741,
         "weights": {
           "0": -0.4361210244169603,
           "1": -0.20466629042611523,
           "2": -0.06711941045256554,
           "3": -0.03627172755589365,
           "4": 0.1742099265691022,
           "5": 0.3975768036973132,
           "6": 0.5124186626147177,
           "7": 0.637095075292753
         }
       }
      }, {
       "0": {
         "bias": 0.4287083114765806,
         "weights": {
           "0": -0.3767037170952746,
           "1": -3.588521175186891,
           "2": 0.9786638782384396,
           "3": 1.171408228985939
         }
       }
      }],
   };  //Для хранения генома с лучшим результатом
  let bestScore = 0; // Счётчик лучшего результата
  let totalSteps = 0; // Шаги с начала симуляции
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
    dotColor: "red",    // Цвет существ
    foodColor: "green", // Цвет еды
    dotSize: 2,         // Размер еды и существ
    dotsCount: 1,       // Стартовое количество существ
    cloningAge: 400,    // Возраст, при котором существа делятся
    deathAge: 390,      // Возраст, при котором существа погибают
    maxDotsCount: 100,  // Максимальное количество существ в симуляции
    foodCount: 500,     // Количество еды 
    foodEnergy: 200,    // Количество енергии от еденицы еды
    mutPercent: 5,     // Какой процент генов изменится при мутации
    mutSize: 5,         // На сколько гены изменятся при мутации
    viewRadius: 5,     // Радиус обзора существа
  }
  
  // Функция отрисовки
  function drawRect(color, x, y, w, h, shadowColor) {
    ctx.shadowColor = shadowColor || `rgb(0, 0, 0)`;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  // Описание свойств еденицы еды
  class Food {
    constructor() {
      let x = Math.trunc(Math.random() * cw);
      let y = Math.trunc(Math.random() * ch);
      this.pos = { x, y };
      this.color = cfg.foodColor;
    }
    // Подготовка данных для отресовки еды
    redrawFood() {
      let color = this.color;
      let size = cfg.dotSize;
      let x = this.pos.x - size / 2;
      let y = this.pos.y - size / 2;
      drawRect(color, x, y, size, size, color);
    }
  }

  let foodList = []; // Массив для хранения еды
  // Отрисовка еды в начале симуляции
  function drawFood() {
    for (; foodList.length < cfg.foodCount;) { addFood(); }
  }
  drawFood();

  // Описание свойств и методов существ
  class Dot {
    constructor(x, y, genom = bestGenom ? bestGenom : genomGenerate()) {
      this.pos = { x: x, y: y };
      this.dir = 0;
      this.step = 0;
      this.age = 0;
      this.genom = genom;
      this.foodScore = 0;
    }
    // Подготовка данных для отрисовки
    redrawDot() {
      let color = cfg.dotColor;
      let size = cfg.dotSize;
      let x = this.pos.x - size / 2;
      let y = this.pos.y - size / 2;

      drawRect(color, x, y, size, size, color);
    }
    // Функция перемещения существ
    moveDot() {
      if (this.pos.x > cw) {
        this.pos.x = 1;
      }
      if (this.pos.x < 0) {
        this.pos.x = cw;
      }
      if (this.pos.y > ch) {
        this.pos.y = 0;
      }
      if (this.pos.y < 0) {
        this.pos.y = ch;
      }
      
      this.age++;  // Увеличиваем возраст на 1 шаг
      this.step++; // Количество шагов до смерти
      
      this.pos.x += Math.round(dirsList[this.dir].x);
      console.log(this.pos);
      this.pos.y += Math.round(dirsList[this.dir].y);
    }

    // Функция смены направления движения
    changeDir() {
     let scan = foodScan(this.pos) // Сканируем местность на наличие еды
      // Отправляем в нейроную сеть данные сканирования и геном существа
      let nNetResp = nNet(scan, this.genom);
      this.dir = (Math.round(nNetResp[0] * 10)>8) ? 8 : Math.round(nNetResp[0] * 10);
      document.getElementById('scan').innerHTML = scan;
      
      //  this.dir = Math.trunc(Math.random()*8);
     // this.dir = Math.random() > 0.5 ? (this.dir + 1) % 8 : (this.dir + 7) % 8;
    }

    // Функция смерти и деления существа 
    killDot(id) {
      if (this.age >= cfg.cloningAge) {
        addDot(this.pos.x, this.pos.y, genomMutation(this.genom)); // Добавляем существо с мутацией
        addDot(this.pos.x, this.pos.y, this.genom); // Добавляем существо без мутации
        dotsList.splice(id, 1);
      }
      if (this.step == cfg.deathAge) {
        dotsList.splice(id, 1); // Убиваем существо
      }
    }
    
    // Функция поглощения еды
    getFood(id) {
      for (let i = 0; i < foodList.length; i++) {
        if (
          Math.trunc(dotsList[id].pos.x) > foodList[i].pos.x-3 && 
          Math.trunc(dotsList[id].pos.y) < foodList[i].pos.y+3 &&
          Math.trunc(dotsList[id].pos.x) < foodList[i].pos.x+3 &&
          Math.trunc(dotsList[id].pos.y) > foodList[i].pos.y-3
          ) {
          foodList.splice(i, 1);
          this.step -= cfg.foodEnergy;
          this.foodScore ++;
          if (this.foodScore > bestScore){
            bestScore = this.foodScore;
            bestGenom = this.genom;
            console.log(bestGenom);
          }
        }
      }
    }
  }
  
  // Создаем 8 направлений движения
  let dirsList = [];
  function createDirs() {
    for (let i = 0; i < 360; i += 45) {
      let x = Math.cos(i * Math.PI / 180);
      let y = Math.sin(i * Math.PI / 180);
      dirsList.push({ x: x, y: y });
    }
  }
  createDirs();
  // Функция добавления еды на поле
  function addFood() {
    if (foodList.length < cfg.foodCount) {
      foodList.push(new Food());
    }
  }
  
  // Функция для добавления существ 
  let dotsList = []; // Массив для хранения существ :
  function addDot(x = cx, y = cy, genom) {
    if (dotsList.length < cfg.maxDotsCount) {
      dotsList.push(new Dot(x, y, genom));
    }
  }
  // Обновление данных для отрисовки еды
  function refreshFood() {
    foodList.forEach((i) => {
      i.redrawFood();
    })
  }
  // Обновление данных для отрисовки существ
  function refreshDots() {
    dotsList.forEach((i, id) => {
      i.redrawDot();
      i.moveDot();
      i.changeDir();
      i.getFood(id);
      i.killDot(id);
    });
  }
  
  // Нейронная сеть
 
  function nNet(input, net) {
    for (let i = 1; i < net.layers.length; i++) {
      let layer = net.layers[i];
      var output = {};
  
      for (let id in layer) {
        let node = layer[id];
        let sum = node.bias;
  
        for (let iid in node.weights) {
          sum += node.weights[iid] * input[iid];
        }
        output[id] = (1 / (1 + Math.exp(-sum)));
      }
      input = output;
    }
    return output;
  }
  
  // Функция генерации нового генома
  function genomGenerate(){
    let bestGenom = { "layers": [{ "0": { "bias": 0.21825113309933905, "weights": { "0": 0.07560224594354947, "1": 0.16809978421211202, "2": 0.12878074058700317, "3": 0.014221078183548924, "4": 0.27958162738535103, "5": -0.11039566792716649, "6": 0.15677244207345753, "7": -0.0019963677098969596, "8": 0.32898852811920487 } }, "1": { "bias": 0.2331163493985023, "weights": { "0": -0.1945563377782536, "1": 0.22268576551495117, "2": -0.009287299886353826, "3": -0.0954746740962543, "4": 0.017080447122836573, "5": 0.19792993647285723, "6": 0.14834866579937822, "7": 0.07104596536920191, "8": 0.2650679509316736 } }, "2": { "bias": 0.23787563761765165, "weights": { "0": 0.0032594691925501296, "1": -0.021131266211040476, "2": 0.17145976604350135, "3": 0.05749660200553813, "4": -0.051531643540748684, "5": -0.14208891331217047, "6": 0.04211887074105744, "7": 0.1490872445024465, "8": 0.18831975054950043 } }, "3": { "bias": 0.13371504073061855, "weights": { "0": -0.045147491241197824, "1": 0.041959409286722926, "2": 0.31418186805249804, "3": -0.09068915057945333, "4": 0.29370041239222433, "5": 0.15259935663206958, "6": -0.13457169057585833, "7": 0.11118318379207706, "8": 0.3189241585095456 } } }, { "0": { "bias": -0.8982527814841518, "weights": { "0": -0.7270635702359959, "1": -0.5128692152637452, "2": -0.538411901180936, "3": -0.5669021412070667 } }, "1": { "bias": 1.0712737447236491, "weights": { "0": 0.5560418153308008, "1": 0.33378222330948465, "2": 0.44894638886894744, "3": 0.7275706463720644 } }, "2": { "bias": -1.025983355420471, "weights": { "0": -0.5224641192997191, "1": -0.6981258265061033, "2": -0.44798962061260433, "3": -0.49902559715638567 } } }] };
    for (let i = 0; i < 2; i++) {
      let layer = genom.layers[i];
      for (let id in layer) {
        let node = layer[id];
        //node.bias = Math.random() * 4 - 2;
        for (let iid in node.weights) {
          node.weights[iid] = Math.random() * 2 - 1;
         //console.log(node.weights[iid]);
        }
      }
    }
    console.log('genom generated');
    //console.log(genom);
    return genom;
  }
  
  // Функция мутации генома при делении
  function genomMutation(genom){
    for (let i = 0; i < genom.layers.length; i++) {
      let layer = genom.layers[i];
      for (let id in layer) {
        let node = layer[id];
        //node.bias = Math.random() < cfg.mutPercent /100 ? Math.random() * cfg.mutSize/100: 1;
        for (let iid in node.weights) {
          if (  Math.random() < cfg.mutPercent /100 ) {
            //console.log('weights mutated');
           // console.log(node.weights[iid])
           // node.weights[iid] *= node.weights[iid]/100*cfg.mutSize;
           // console.log(node.weights[iid]);
            
          }
        }
      }
    }
    console.log('genom mutated');
    //console.log(genom);
    return genom;
  }
  
  // Функция сканирования поля вокруг существа
  function foodScan(pos) {
    
    scan = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let fy = Math.trunc(pos.y) - cfg.viewRadius; fy <= Math.trunc(pos.y) + cfg.viewRadius; fy++) {
      for (let fx = Math.trunc(pos.x) - cfg.viewRadius; fx <= Math.trunc(pos.x) + cfg.viewRadius; fx++){
        for (let i=0; i< foodList.length; i++) {
          if (fx == foodList[i].pos.x && fy == foodList[i].pos.y) {
            //console.log(foodList[i].pos.x + ', '+ foodList[i].pos.y)
            let foodx = foodList[i].pos.x - pos.x;
            let foody = foodList[i].pos.y - pos.y;
            let angle = Math.acos(foodx / Math.sqrt(foodx * foodx + foody * foody)) * 180 / Math.PI; // Вычисляем угол на координаты еды относительно оси x
            if (foodx < 0 && foody < 0) { angle += 90 }
            if (foody < 0 && foodx >= 0) { angle = 360 - angle }
            let  vector = (angle < 22.5) ? 0 : (angle < 67.5) ? 1 : (angle < 112.5) ? 2 : (angle < 157.5) ? 3 : (angle < 202.5) ? 4 : (angle < 247.5) ? 5 : (angle < 292.5) ? 6 : (angle < 337.5) ? 7 : 0;
           //console.log();
            scan[vector] = 1; 
          }
        }
      }
    } 
    return scan;
  }
  
  // Фукция бесконечного цикла
  function loop() {
    drawRect(`rgba(0, 0, 0, 0.9)`, 0, 0, cw, ch);

    if (dotsList.length < cfg.dotsCount) {addDot(); }
    addFood();
    refreshFood();
    refreshDots();
    
    totalSteps++;
    document.getElementById('totalSteps').innerHTML = totalSteps;
    document.getElementById('countWorms').innerHTML = dotsList.length;
    document.getElementById('foodCount').innerHTML = foodList.length;
    document.getElementById('bestScore').innerHTML = bestScore;
    
    meter.tick();
    requestAnimationFrame(loop);
  }
  loop();

})();