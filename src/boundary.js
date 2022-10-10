function Boundary(x, y, w, h) {
    var options = {
        isStatic: true,
    }
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.w = w;
    this.h = h;
    Composite.add(world, this.body);

    this.show = function () {
        var pos = this.body.position;
        var angle = this.body.angle;

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);
        fill(0, 0, 0, 150);
        rect(0, 0, this.w, this.h);
        pop();
    }
}