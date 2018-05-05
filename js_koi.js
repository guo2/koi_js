var flock = [];
var sep, ali, coh, rep, att;
var tempV;
var MAX_SEG = 24;
var MARGIN = 120;
var AVG_SIZE = 20;
var repeller;
var attractor;
var ripples = [];
var mousePos;
var offsetX = 0, offsetY = 120;

window.onmousedown = coordHandler;
window.onmousemove = coordHandler;
window.ontouchstart = coordHandler;
window.ontouchmove = coordHandler;

function coordHandler(event) {
    switch (event.type) {
        case 'mousedown':
            mousePos.set(event.clientX, event.clientY);
            refreshAttRep();
            ripples.push(new Ripple(mousePos, random(165, 205)));
            break;
        case 'mousemove':
            mousePos.set(event.clientX, event.clientY);
            refreshAttRep();
            if(random()<0.1)
                ripples.push(new Ripple(mousePos, random(85, 125)));
            break;
        case 'touchstart':
            mousePos.set(event.touches[0].clientX, event.touches[0].clientY);
            refreshAttRep();
            ripples.push(new Ripple(mousePos, random(165, 205)));
            break;
        case 'touchmove':
            mousePos.set(event.touches[0].clientX, event.touches[0].clientY);
            refreshAttRep();
            if(random()<0.1)
                ripples.push(new Ripple(mousePos, random(85, 125)));
            break;
    }
}

function refreshAttRep(){
    attractor.life = 240;
    attractor.loc.set(mousePos);
    repeller.life = 120;
    repeller.loc.set(mousePos);
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    ellipseMode(CENTER);
    tempV = createVector(0, 0);
    sep = createVector(0, 0);
    ali = createVector(0, 0);
    coh = createVector(0, 0);
    rep = createVector(0, 0);
    att = createVector(0, 0);
    mousePos = createVector(0, 0);
    lastMousePos = createVector(0, 0);

    var startL = createVector(random(width*0.2, width*0.8), random(height*0.3, height*0.7));
    var spawn = startL.copy();
    for(var i = 0; i < 15; i++){
        flock.push(new Koi(spawn, createVector(random(-2, 2), random(-2, 2)), color(232, 146, 117), 0));
        spawn.set(startL.x + random(AVG_SIZE * -6, AVG_SIZE * 6), startL.y + random(AVG_SIZE * -6, AVG_SIZE * 6));
    }
    flock.push(new Koi(spawn, createVector(random(-2, 2), random(-2, 2)), color(232, 146, 117), 2));

    startL.set(random(width*0.2, width*0.8), random(height*0.3, height*0.7));
    spawn.set(startL);
    for(var i = 0; i < 15; i++){
        flock.push(new Koi(spawn, createVector(random(-2, 2), random(-2, 2)), color(255), 1));
        spawn.set(startL.x + random(AVG_SIZE * -6, AVG_SIZE * 6), startL.y + random(AVG_SIZE * -6, AVG_SIZE * 6));
    }
    flock.push(new Koi(spawn, createVector(random(-2, 2), random(-2, 2)), color(255), 2));

    repeller = new Attrepller(createVector(event.clientX, event.clientY), 0);
    attractor = new Attrepller(createVector(event.clientX, event.clientY), 0);
}

function draw() {
    background(225);
    if(repeller.life > 0){
        repeller.update();
        //fill(255, 125);
        //noStroke();
        //ellipse(repeller.loc.x, repeller.loc.y, 300, 300);
    }

    if(attractor.life > 0){
        attractor.update();
        //if(random()<0.02)
        //    ripples.push(new Ripple(attractor.loc, 155 * attractor.life / 300));
    }

    for(var i = 0; i < flock.length; i++){
        flock[i].update();
        flock[i].renderShadow();
    }

    if(random()<0.05)
        ripples.push(new Ripple(createVector(random(width), random(height)), random(125, 165)));

    for(var i = ripples.length - 1; i >= 0; i--)
        ripples[i].renderShadow();

    for(var i = 0; i < flock.length; i++)
        flock[i].render();
    for(var i = ripples.length - 1; i >= 0; i--){
        ripples[i].render();
        ripples[i].update();
        if(ripples[i].dead)
            ripples.splice(i, 1);
    }
}


function Attrepller(l, hp){
    this.loc = l.copy();
    this.life = hp;
}

Attrepller.prototype.update = function(){
    this.life--;
}
