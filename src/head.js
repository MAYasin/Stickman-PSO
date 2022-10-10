function Head(x, y, r, bounds, customOption) {
    this.body = Bodies.circle(x, y, r, { isStatic: false, density: 0.0001, collisionFilter: customOption.collisionFilter});
    this.x = x;
    this.y = y;
    this.r = r;
    this.bounds = bounds;
    this.collided = false;
    this.color = 255;
    this.transparency = 255;

    Composite.add(world, this.body);

    this.show = function () {
        var pos = this.body.position;
        var angle = this.body.angle;

        for (const bound of bounds) {
            var collision = Collision.collides(this.body, bound.body);
            if (collision !== null) {
                this.collided = true;
                break;
            } else {
                this.collided = false;
            }
        }

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        ellipseMode(CENTER);
        strokeWeight(2);
        stroke(0, this.transparency);
        fill(this.color, this.transparency);
        ellipse(0, 0, this.r * 2);
        pop();
    }
}