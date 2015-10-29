var canvas     = document.getElementById('canvas');
var ctx        = canvas.getContext('2d');
var gravity    = new BB.Vector2();
var mouseInput = new BB.MouseInput(canvas);

var WIDTH, HEIGHT, balls = [];

function setup() {
    
    window.onresize = function() {
        WIDTH = canvas.width = window.innerWidth;
        HEIGHT = canvas.height = window.innerHeight;
    }
    
    window.onresize();

    var amount = 50; //gui -name amount
    for (var i = 0; i < amount; i++) {
        
        var ball = new BB.Agent2D({
            position: new BB.Vector2( Math.random()*WIDTH, Math.random()*HEIGHT ),
            velocity: new BB.Vector2( BB.MathUtils.randomFloat(-1,1), BB.MathUtils.randomFloat(-5,5) ),
            radius: BB.MathUtils.randomInt(15, 30),
            elasticity: 0.1 //gui -name elasticity -min 0.0 -max 0.5 -steps 0.01
        });

        balls.push( ball );
    };
}

function update() {
    
    requestAnimationFrame(update);

    gravity.y = 0; //gui -name gravity.y -max 0.5 -steps 0.1

    mouseInput.update();

    var mouse = new BB.Vector2(mouseInput.x, mouseInput.y);

    for (var i = 0; i < balls.length; i++) {

        balls[i].seek(mouse, 0.1, 100);

        balls[i].applyForce(gravity);

        balls[i].update();
    };

    draw();
}

function draw() {
    ctx.clearRect(0,0,WIDTH,HEIGHT);

    for (var i = 0; i < balls.length; i++) {
        ctx.fillStyle = "#cc3399";
        ctx.beginPath();
        ctx.arc( balls[i].position.x, balls[i].position.y, balls[i].radius, 0, Math.PI*2 );
        ctx.closePath();
        ctx.fill();
    };
}


setup();
update();