function Ripple(l, o){
    this.loc = l.copy();
    this.d = 2;
    this.opacity = o;
    //this.thickness = this.opacity / 64.0;
    this.dead = false;
}

Ripple.prototype.update = function(){
    this.d += 3;
    //this.thickness *= 0.99;
    this.opacity -= 1.2;
    if(this.opacity <= 0)
        this.dead = true;
}

Ripple.prototype.render = function(){
    noFill();
    strokeWeight(1.5);
    //fg.stroke(166, 196, 175, this.opacity);
    stroke(255, this.opacity);
    ellipse(this.loc.x, this.loc.y, this.d, this.d);
}

Ripple.prototype.renderShadow = function(){
    noFill();
    strokeWeight(1.5);
    stroke(210, this.opacity);
    ellipse(this.loc.x+offsetX, this.loc.y+offsetY, this.d, this.d);
}
