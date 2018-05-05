function Koi(l, v, c, g){
    this.acc = createVector(0, 0);
    this.loc = l.copy();
    this.vel = v.copy();
    this.maxSpeed = 3;
    var variance = random(-0.2, 0.2);
    this.maxSteer = 0.05 * (1 - variance);
    this.desiredSep = 60.0 * (1 + variance);
    this.neighborDist = 120.0 * (1 + variance);
    this.size = AVG_SIZE * (1 + variance);
    this.opacity = random(45, 60);

    this.color = c;
    this.group = g;

    this.incre_1 = this.size / 5;
    this.widest = this.size * 1.5;
    this.incre_2 = this.size / 13;

    this.lastL = [];
    for(var i = 0; i < MAX_SEG; i++){
        this.lastL[i] = l.copy();
    }

    this.flag = false;
}

Koi.prototype.update = function(){
    this.setSep();
    this.setAliCoh();
    this.setRep();
    this.setAtt();

    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);
    rep.mult(4.0);
    att.mult(0.8);

    this.acc.set(0, 0);
    this.acc.add(sep);
    this.acc.add(ali);
    this.acc.add(coh);
    this.acc.add(rep);
    this.acc.add(att);
    this.acc.limit(this.maxSteer);

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.loc.add(this.vel);

    if(frameCount % 2 == 0) {
        this.lastL.shift();
        this.lastL.push(this.loc.copy());
    }

    if(this.loc.x >= -MARGIN && this.loc.x <= width + MARGIN && this.loc.y >= -MARGIN && this.loc.y <= height + MARGIN)
        return;

    if(this.loc.x > width + MARGIN){
        this.loc.x = -MARGIN;
        for(var i = 0; i < MAX_SEG; i++)
            this.lastL[i].x -= width + 2 * MARGIN;
    }
    if(this.loc.x < -MARGIN){
        this.loc.x =  width + MARGIN;
        for(var i = 0; i < MAX_SEG; i++)
            this.lastL[i].x += width + 2 * MARGIN;
    }
    if(this.loc.y > height + MARGIN){
        this.loc.y = -MARGIN;
        for(var i = 0; i < MAX_SEG; i++)
            this.lastL[i].y -= height + 2 * MARGIN;
    }
    if(this.loc.y < -MARGIN){
        this.loc.y = height + MARGIN;
        for(var i = 0; i < MAX_SEG; i++)
            this.lastL[i].y += height + 2 * MARGIN;
    }
}

Koi.prototype.render = function(){
    var w = this.size;
    var b = false;
    noStroke();
    //stroke(232, 146, 117, this.opacity);

    for(var i = MAX_SEG - 1; i >= 0; i--){
        fill(red(this.color), green(this.color), blue(this.color), this.opacity);
        if(this.flag)
            fill(35, this.opacity);
        ellipse(this.lastL[i].x, this.lastL[i].y, w, w);
        if(!b){
            w += this.incre_1;
            if (w > this.widest) b = true;
        }
        else w -= this.incre_2;
    }
}

Koi.prototype.renderShadow = function(){
    var w = this.size;
    var b = false;
    noStroke();

    for(var i = MAX_SEG - 1; i >= 0; i--){
        fill(210, 45);
        ellipse(this.lastL[i].x + offsetX, this.lastL[i].y + offsetY, w, w);
        if(!b){
            w += this.incre_1;
            if (w > this.widest) b = true;
        }
        else w -= this.incre_2;
    }
}

Koi.prototype.setSep = function(){
    var count = 0;
    var d2 = 0;
    var ds2 = sq(this.desiredSep);
    sep.set(0, 0);

    for(var i = 0; i < flock.length; i++){
        d2 = sq(flock[i].loc.x - this.loc.x) + sq(flock[i].loc.y - this.loc.y);
        if (d2 > 0 && d2 < ds2){
            tempV = p5.Vector.sub(this.loc, flock[i].loc);
            tempV.setMag(1/d2); //hmmmmm....
            if(flock[i].group != this.group)
              tempV.mult(2.0);
            sep.add(tempV);
            count++;
        }
    }

    if(count > 0){
        sep.setMag(this.maxSpeed); //setMag()?
        sep.sub(this.vel);
        sep.limit(this.maxSteer);
    }
}

Koi.prototype.setAliCoh = function(){
    var count = 0;
    var d2 = 0;
    var nd2 = sq(this.neighborDist);
    var nearest = -1;
    var nearestDis2 = Infinity;
    ali.set(0, 0);
    coh.set(0, 0);

    for(var i = 0; i < flock.length; i++){
        //if(flock[i].group != this.group)
        //    continue;
        d2 = sq(flock[i].loc.x - this.loc.x) + sq(flock[i].loc.y - this.loc.y);

        if (d2 > 0){ //not self
            if(d2 < nd2){
              if(flock[i].group == this.group){
                ali.add(flock[i].vel);
                coh.add(flock[i].loc);
              }
              else{
                ali.sub(flock[i].vel);
                coh.sub(flock[i].loc);
              }
                count++;
            }
            else if(d2 < nearestDis2 && flock[i].group == this.group){
                nearest = i;
                nearestDis2 = d2;
            }
        }
    }

    if(count > 0){
        ali.setMag(this.maxSpeed);
        ali.sub(this.vel);
        ali.limit(this.maxSteer);
        coh.div(count);
    }
    else coh = flock[nearest].loc.copy(); //no neighbors :(

    this.flag = false;

    coh.sub(this.loc);
    coh.setMag(this.maxSpeed);
    //lol looks like this works
    if(count == 1 && Math.abs(coh.heading() - this.vel.heading()) < 0.5){
        coh.rotate(2);
        //this.flag = true;
    }
    coh.sub(this.vel);
    coh.limit(this.maxSteer);
}

Koi.prototype.setRep = function(){
    if(repeller.life <= 0){
        rep.set(0, 0);
        return;
    }

    rep.set(this.loc.x - repeller.loc.x, this.loc.y - repeller.loc.y);
    var d = rep.mag();
    if (d < 150){
        rep.setMag(this.maxSpeed);
        rep.sub(this.vel);
        //rep.div(d);
        rep.limit(this.maxSteer);
    }
    else
        rep.set(0, 0);
}

Koi.prototype.setAtt = function(){
    if(attractor.life <= 0){
        att.set(0, 0);
        return;
    }

    att.set(attractor.loc.x - this.loc.x, attractor.loc.y - this.loc.y);
    var d = att.mag();
    if (d > 250){
        att.setMag(this.maxSpeed); //setMag()?
        att.sub(this.vel);
        //att.div(d);
        att.limit(this.maxSteer);
    }
    else
        att.set(0, 0);
}
