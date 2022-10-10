class Ragdoll {
    constructor(x, y, bounds, customOption, starttime, generation) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.starttime = starttime;
        this.generation = generation;
        this.deathtime;
        this.xScore = 0;
        this.yScore = 0;
        this.brain = new NeuralNetwork([9, 8, 2]);

        this.torso = new Box(this.x, this.y, 20, 60, bounds, customOption);
        this.head = new Head(this.x, this.y - 50, 18, bounds, customOption);
        this.rhand = new Box(this.x + 25, this.y - 10, 30, 4, bounds, customOption);
        this.lhand = new Box(this.x - 25, this.y - 10, 30, 4, bounds, customOption);
        this.rleg = new Box(this.x + 10, this.y + 50, 8, 40, bounds, customOption);
        this.lleg = new Box(this.x - 10, this.y + 50, 8, 40, bounds, customOption);

        this.inferenceMode = false;

        this.torsoToHead = Constraint.create({
            bodyA: this.torso.body,
            bodyB: this.head.body,
            pointA: { x: 0, y: -30 },
            pointB: { x: 0, y: 18 },
            stiffness: 1,
        });

        this.torsoToHeadA = Constraint.create({
            bodyA: this.torso.body,
            bodyB: this.head.body,
            pointA: { x: 0, y: 0 },
            pointB: { x: 0, y: 0 },
            stiffness: 1,
        });

        this.torsoToRhand = Constraint.create({
            bodyA: this.torso.body,
            bodyB: this.rhand.body,
            pointA: { x: 10, y: -10 },
            pointB: { x: -15, y: 0 },
            stiffness: 0.6,
        });
        this.torsoToLhand = Constraint.create({
            bodyA: this.torso.body,
            bodyB: this.lhand.body,
            pointA: { x: -10, y: -10 },
            pointB: { x: 15, y: 0 },
            stiffness: 0.6,
        });

        this.torsoToRleg = Constraint.create({
            bodyA: this.torso.body,
            bodyB: this.rleg.body,
            pointA: { x: 10, y: 30 },
            pointB: { x: 0, y: -20 },
            stiffness: 0.6,
        });
        this.torsoToLleg = Constraint.create({
            bodyA: this.torso.body,
            bodyB: this.lleg.body,
            pointA: { x: -10, y: 30 },
            pointB: { x: 0, y: -20 },
            stiffness: 0.6,
        });

        this.legToLeg = Constraint.create({
            bodyA: this.lleg.body,
            bodyB: this.rleg.body,
            stiffness: 0.01,
        });

        this.fullbody = Composite.add(world, [
            this.torsoToHead, this.torsoToHeadA, this.torsoToRhand, this.torsoToLhand, this.torsoToRleg, this.torsoToLleg, this.legToLeg
        ]
        );

        this.resetTransparency();
    }

    setTransparency(alpha) {
        this.torso.transparency = alpha;
        this.head.transparency = alpha;
        this.rhand.transparency = alpha;
        this.lhand.transparency = alpha;
        this.rleg.transparency = alpha;
        this.lleg.transparency = alpha;
    }

    setColor(color) {
        this.torso.color = color;
        this.head.color = color;
        this.rhand.color = color;
        this.lhand.color = color;
        this.rleg.color = color;
        this.lleg.color = color;
    }

    resetTransparency() {
        if (this.torso.transparency != 150) {
            this.setTransparency(150);
        }
    }

    control(rotateLleg, rotateRleg) {
        if (!this.dead) {
            rotateRleg = rotateRleg / Math.pow(10, 1) * 5;
            rotateLleg = rotateLleg / Math.pow(10, 1) * 5;

            var xRval = (this.rleg.body.vertices[0].x + this.rleg.body.vertices[1].x) / 2;
            var yRval = (this.rleg.body.vertices[0].y + this.rleg.body.vertices[1].y) / 2;
            Body.rotate(this.rleg.body, rotateRleg, { x: xRval, y: yRval });

            var xLval = (this.lleg.body.vertices[0].x + this.lleg.body.vertices[1].x) / 2;
            var yLval = (this.lleg.body.vertices[0].y + this.lleg.body.vertices[1].y) / 2;
            Body.rotate(this.lleg.body, rotateLleg, { x: xLval, y: yLval });
        }
    }

    update() {
        if (this.head.collided || this.torso.collided || this.kill(40)) {
            this.dead = true;

            this.deadtime = new Date();

            this.torso.body.isStatic = true;
            this.head.body.isStatic = true;
            this.rhand.body.isStatic = true;
            this.lhand.body.isStatic = true;
            this.rleg.body.isStatic = true;
            this.lleg.body.isStatic = true;

            this.torso.color = 0;
            this.head.color = 0;
            this.rhand.color = 0;
            this.lhand.color = 0;
            this.rleg.color = 0;
            this.lleg.color = 0;

            this.setTransparency(50);
        }

        if (!this.dead) {
            this.xScore = this.torso.body.position.x - this.x;
            this.yScore = this.torso.body.position.y;
            if(this.yScore < 438){
                this.yScore = 0;
            }
            const outputs = NeuralNetwork.feedForward([roundTo(this.lleg.angle, 2), roundTo(this.lleg.angularSpeed, 2), this.lleg.collided ? 1 : 0, roundTo(this.lleg.distanceToGround, 2), roundTo(this.torso.angle, 2), roundTo(this.rleg.angle, 2), roundTo(this.rleg.angularSpeed, 2), this.rleg.collided ? 1 : 0, roundTo(this.rleg.distanceToGround, 2)], this.brain)
            //console.log(this.brain.layers[0].inputs);
            this.control(outputs[0], outputs[1]);
        }

        this.torso.show();

        this.rhand.show();
        this.lhand.show();
        this.rleg.show();
        this.lleg.show();
        this.head.show();
    }

    removeFromWorld() {
        this.deadtime = new Date();
        Composite.remove(world, [this.torso.body, this.head.body, this.rhand.body, this.lhand.body, this.rleg.body, this.lleg.body, this.torsoToHead, this.torsoToHeadA, this.torsoToRhand, this.torsoToLhand, this.torsoToRleg, this.torsoToLleg, this.legToLeg]);
    }

    getLog() {
        return { "xScore": this.xScore, "yScore": this.yScore, "time": (this.deadtime - this.starttime) / 1000, "generation": this.generation };
    }

    kill(seconds) {
        var time = new Date();
        var kill = ((time.getTime() - this.starttime.getTime()) / 1000) >= seconds;
        if (kill && !this.inferenceMode) {
            this.dead = true;
            return true;
        }
        return false;
    }
}

function roundTo(float, decimalPlaces) {
    var multiplier = Math.pow(10, decimalPlaces);
    return Math.round(float * multiplier) / multiplier;
}
