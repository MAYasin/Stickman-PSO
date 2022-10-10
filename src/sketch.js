// module aliases
var Engine = Matter.Engine,
    Runner = Matter.Runner,
    // Render = Matter.Render,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Common = Matter.Common,
    Composite = Matter.Composite,
    Collision = Matter.Collision,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Constraint = Matter.Constraint;

var engine;
var world;
var runner;
var mConstraint;
var bounds = [];

let img;
let modetext;
let gentext;
let customOption;
let slider;
let h3;

let stickmen;
let genCount = 0;

let starttime;

let writer;

let stoppingAlgo;

let logP1 = [];
let bestStickmanP1;
let brainModelStorageP1;

let logP2 = [];
let bestStickmanP2;
let brainModelStorageP2;

let loadModel;

function generateStickmen(count, time) {
    const stickmen = [];
    for (let i = 0; i < count; i++) {
        stickmen.push(new Ragdoll(80, height / 1.4, bounds, customOption, time, genCount));
    }

    bestStickmanP1 = stickmen[0];
    bestStickmanP2 = stickmen[0];
    return stickmen;
}

//preload resources
function preload() {
    img = loadImage("assets/landscape.jpg");
    loadModel = loadStrings('assets/Model.json');
}

//initialisation of the sketch
function setup() {
    discardModel();
    stoppingAlgo = false;
    starttime = new Date();
    genCount = 0;
    //creating the canvas
    var canvas = createCanvas(1100, 600);
    img.resize(1100, 600);

    //slider
    slider = select('#slider');
    h3 = select('h3');

    //creating the engine
    engine = Engine.create();

    //creating the renderer
    // var render = Render.create({
    //     element: document.body,
    //     engine: engine,
    //     options: {
    //         width: 1100,
    //         height: 600,
    //         showAngleIndicator: true
    //     }
    // });

    world = engine.world;

    // run the renderer
    // Render.run(render);

    runner = Runner.create();
    Runner.run(runner, engine);

    customOption = {
        collisionFilter: {
            group: Body.nextGroup(true),
        }
    };

    modetext = "Idle";
    gentext = "Gen: undefined";

    //ground
    bounds.push(new Boundary(width / 2, height, width, width / 6));
    //walls
    bounds.push(new Boundary(0, height / 2, 20, height));
    bounds.push(new Boundary(width, height / 2, 20, height));
    //ceiling
    bounds.push(new Boundary(width / 2, 0, width, 20));

    //mouse constraint
    var canvasmouse = Mouse.create(canvas.elt);
    canvasmouse.pixelRatio = pixelDensity();
    var options = {
        mouse: canvasmouse
    }

    mConstraint = MouseConstraint.create(engine, options);
    Composite.add(world, mConstraint);
}

//drawing the canvas
function draw() {
    h3.html(slider.value() == 0 ? 2 : slider.value());
    //Engine.update(engine)
    image(img, 0, 0);
    textSize(27);
    fill(207, 57, 83);
    strokeWeight(0);
    text(modetext, 10, 40);
    text(gentext, 850, 40);

    if (stickmen != null) {
        if (modetext != "Inference") {
            stickmen.forEach(stickman => stickman.resetTransparency());
            bestStickmanP1 = stickmen.find(s => s.xScore == Math.max(...stickmen.map(s => s.xScore)));
            bestStickmanP2 = stickmen.find(s => s.yScore == Math.min(...stickmen.map(s => s.yScore)));

            bestStickmanP1.setTransparency(255);

            stickmen.forEach(stickman => stickman.update());

            var alldead = stickmen.every(s => s.dead || s.yScore > 455);

            if (bestStickmanP1.xScore > 950) {
                alldead = true;
                if (bestStickmanP1.yScore < 450) {
                    stoppingAlgo = true;
                }
            }

            if (alldead) {
                genCount += 1;

                saveModel();
                resetModel();

                if (!stoppingAlgo) {
                    stickmen = generateStickmen(slider.value() == 0 ? 2 : slider.value(), new Date());

                    if (brainModelStorageP1 != undefined && brainModelStorageP2 != undefined) {
                        var stickmenCount = stickmen.length / 2;
                        stickmen.forEach((element, index) => {
                            if (index < stickmenCount) {
                                element.brain = JSON.parse(brainModelStorageP1);
                                if (index != 0) {
                                    NeuralNetwork.mutate(element.brain, 0.01);
                                }
                            } else {
                                element.setColor(color(255, 255, 0));
                                element.brain = NeuralNetwork.crossover(JSON.parse(brainModelStorageP1), JSON.parse(brainModelStorageP2));
                                if (index != stickmenCount) {
                                    NeuralNetwork.mutate(element.brain, 0.01);
                                }
                            }
                        });
                    }
                } else {
                    stoppingAlgo = false;
                    genCount = 0;
                    modetext = "Idle";
                    saveLog();
                    saveModelObj();
                    discardModel();
                }
            }
        }else{
            stickmen[0].update();
            if (stickmen[0].xScore > 950) {
                stickmen[0].dead = true;
            }

            if (stickmen[0].dead) {
                clickInference();
            }
        }
    }

    gentext = "Gen: " + (stickmen == null ? "undefined" : genCount);

    for (const bound of bounds) {
        bound.show();
    }

    strokeWeight(10);
    stroke(0, 255, 0);
    line(80, 400, 80, 510);

    stroke(255, 0, 0);
    line(1030, 400, 1030, 510);
}

//html utils
function saveModel() {
    brainModelStorageP1 = JSON.stringify(bestStickmanP1.brain);
    brainModelStorageP2 = JSON.stringify(bestStickmanP2.brain);

    logP1.push(bestStickmanP1.getLog());
    logP2.push(bestStickmanP2.getLog());
}

function discardModel() {
    brainModelStorageP1 = undefined;
    brainModelStorageP2 = undefined;
}

function resetModel() {
    if (stickmen != null) {
        for (let i = 0; i < stickmen.length; i++) {
            stickmen[i].removeFromWorld();
        }
    }

    stickmen = undefined;
}

function clickReset() {
    discardModel();
    genCount = 0;
    modetext = "Idle";

    resetModel();
}

function clickTrain() {
    discardModel();
    genCount = 0;

    resetModel();

    stickmen = generateStickmen(slider.value() == 0 ? 2 : slider.value(), new Date());

    modetext = "Training... " + stickmen.length + " stickmen";
}

function clickInference() {
    resetModel();
    modetext = "Inference";
    genCount = undefined;

    stickmen = generateStickmen(1, new Date());
    stickmen[0].brain = JSON.parse(loadModel);
    stickmen[0].setTransparency(255);
    stickmen[0].inferenceMode = true;
}

function saveLog() {
    writer = createWriter('Log.json');
    var log = {"p1": logP1, "p2": logP2};
    writer.write(JSON.stringify(log));
    writer.close();
}

function saveModelObj() {
    writer = createWriter('Model.json');
    writer.write(brainModelStorageP2);
    writer.close();
}