const bounce = {
  duration: 3,
  slowdownOnContact: 2,// > 1
  restDuration: 0.2,
  startPoint: { x: 2 * canvasSize.width / 3, y: canvasSize.height / 3 },
  endPoint: { x: canvasSize.width / 3, y: 2 * canvasSize.height / 3 },
  wallX: canvasSize.width,
  floorY: canvasSize.height,
  RBlobDog: canvasSize.height / 8,
  blobDogSquishedRCoefficient: 0.7,
  blobDogSquishedR: undefined,
  startSpeed: { x: 1, y: 1 },//will be calculated at setup
  isAirborne: true,
  setup() {
    backgroundColor = 'green';
    blobDog.reset();
    blobDog.body.d = 2* this.RBlobDog;
    blobDog.pos.x = this.startPoint.x;
    blobDog.pos.y = this.startPoint.y;
    this.startSpeed = precalculateAirborneSpeedForBounce();
    blobDog.speed.x = this.startSpeed.x;
    blobDog.speed.y = this.startSpeed.y;
    drawStage = bounce.draw;
    this.blobDogSquishedR = this.RBlobDog * this.blobDogSquishedRCoefficient;
  },
  draw() {
    background(backgroundColor);
    text("FASTER", width / 2, height / 4);
    blobDog.draw();
  },
  moveDog() {
    blobDog.pos.x = blobDog.pos.x + blobDog.speed.x * lp.step;
    blobDog.pos.y = blobDog.pos.y + blobDog.speed.y * lp.step;
  },
  restingUntil: null,
  update() {
    const isTouchingWall = blobDog.pos.x + this.RBlobDog > this.wallX;
    const isTouchingFloor = blobDog.pos.y + this.RBlobDog > this.floorY;
    if (this.isAirborne) {      
      if (isTouchingWall || isTouchingFloor) {
        this.isAirborne = false;
        blobDog.speed.x = blobDog.speed.x / this.slowdownOnContact;
        blobDog.speed.y = blobDog.speed.y / this.slowdownOnContact;
        //also the squish rotation should be changed.
      }
    }
    
    if (!this.isAirborne) {
      const isResting = this.restingUntil !== null;
      const isSquishedToTheWall = blobDog.pos.x + this.blobDogSquishedR > this.wallX;
      const isSquishedToTheFloor = blobDog.pos.y + this.blobDogSquishedR > this.floorY;
      const shouldStartResting = !isResting && (isSquishedToTheWall || isSquishedToTheFloor);
      if (shouldStartResting) {
        this.restingUntil = lp.seconds + this.restDuration;
      }

      const shouldStopResting = isResting && (this.restingUntil < lp.seconds);
      if (shouldStopResting) {
        this.restingUntil = null;
        if (isSquishedToTheFloor) { blobDog.speed.y = - this.startSpeed.y / this.slowdownOnContact }
        if (isSquishedToTheWall) { blobDog.speed.x = - this.startSpeed.x / this.slowdownOnContact }
      }
      
      const shouldBecomeAirborne = !(isTouchingFloor || isTouchingWall);
      if(shouldBecomeAirborne){
        this.isAirborne = true;
        blobDog.speed.x = blobDog.speed.x * this.slowdownOnContact;
        blobDog.speed.y = blobDog.speed.y * this.slowdownOnContact;
      }
    }

    

    const notResting = this.restingUntil === null;
    if (notResting) { this.moveDog(); };
  }
}


/** |     start  |the preview is broken. Better right-click the function and go to definition
 *  |         \  |the path of the bounces is depicted.
 *  |          \ |this is a primitive physics simulation.
 *  |           \|
 *  |    end    /|It returns an object with x and y values. Both are positive.
 *  |       \  / |
 *  |        \/  |
 */
function precalculateAirborneSpeedForBounce() {
  const time = bounce.duration;//the whole time getting from start to end will take
  const restTime = bounce.restDuration; //in the middle of the bounce
  const bounceNum = 2; //how many bounces happen
  const startX = bounce.startPoint.x;
  const startY = bounce.startPoint.y;
  const endX = bounce.endPoint.x;
  const endY = bounce.endPoint.y;
  const wallX = bounce.wallX;
  const floorY = bounce.floorY;
  const slowdown = bounce.slowdownOnContact; // > 1


  const movingTime = time - restTime * bounceNum;
  const blobDogSquishedR = bounce.RBlobDog * bounce.blobDogSquishedRCoefficient;
  const padding = blobDogSquishedR;
  const distanceX = (wallX - startX) - padding + (wallX - endX) - padding;
  const distanceY = (floorY - startY) - padding + (floorY - endY) - padding;
  //the number 2 is here because we account for touchdown as well as takeoff
  const slowDistance = bounceNum * (bounce.RBlobDog - blobDogSquishedR) * 2;
  //let's pretend that the whole distance will be crossed at the airborne speed,
  //but the time is unchanged, so the distance stretches.
  const normalizedDistance = {
    x: distanceX - slowDistance + slowDistance * slowdown,
    y: distanceY - slowDistance + slowDistance * slowdown
  }
  const airborneSpeed = {
    x: normalizedDistance.x / movingTime,
    y: normalizedDistance.y / movingTime
  }
  return airborneSpeed;
}

const bounceSetup = lp.createForce().at(0).do(()=>{bounce.setup();});

const bounceLoop = lp.createForce().after(bounceSetup).for(bounce.duration).do(()=>{bounce.update();});



const kickSetup = lp.createForce().afterPrevious().do(() => {
  backgroundColor = color('maroon');
  blobDog.reset();
  textAlign(CENTER, CENTER);
  textSize(40);
  drawStage = function () {
    background(backgroundColor);
    text("STRONGER", width / 2, height / 4);
    blobDog.draw();
  }
});

const kick = {
  //face her
  //get close
  //  (but a little lower then her)
  //smooch (lift your face)
  keyFrames: [
    {
      name: "start Pos",
      at: 0,
      posX: canvasSize.width / 3,
      posY: canvasSize.height / 2,
      bodRot: 0,
      leftHeading: 0//so not looking left
    },
    {
      name: "face your opponent",
      after: 0.2,
      leftHeading: 0.2,
      posX: canvasSize.width / 3,
      skew: 0,
    },
    {
      name: "contact",
      after: 0.3,
      posX: 2 * canvasSize.width / 3,
      skew: 0,
      curve(start, end, amt) {//todo: implement curves
        return lerp(start, end, amt);
      },
    },
    {
      name: "make her wait for it",
      after: 0.2,
      posX: 2 * canvasSize.width / 3,
      bodRot: 0,
      skew: 0
    },
    {
      name: "peck",
      after: 0.1,
      bodRot: -Math.PI / 10,
      skew: -Math.PI / 12,
    },
    {
      name: "savor",
      after: 0.15,
      bodRot: -Math.PI / 10,
      skew: -Math.PI / 12,
    },
    {
      name: "unPeck",
      after: 0.1,
      bodRot: 0,
      posX: 2 * canvasSize.width / 3,
      skew: 0,
    },
    {
      name: "return",
      after: 0.2,
      posX: canvasSize.width / 3,
      bodRot: 0,
    }
  ]
}

const kickSceneDuration = durationFromKeyFrames(kick.keyFrames);
const kickLoop = lp.createForce().after(kickSetup).for(kickSceneDuration).do(
  () => {
    let now = lp.seconds - kickLoop._start;
    blobDog.pos.x = getValueFromKeyFrames(now, 'posX', kick.keyFrames);
    blobDog.pos.y = getValueFromKeyFrames(now, 'posY', kick.keyFrames);
    blobDog.skew = getValueFromKeyFrames(now, "skew", kick.keyFrames);
    blobDog.pose.heading.horizontal =
      getValueFromKeyFrames(now, "leftHeading", kick.keyFrames);
    blobDog.rot = getValueFromKeyFrames(now, "bodRot", kick.keyFrames);
  }
);

//hop
const highHopSetup = lp.createForce().afterPrevious().do(
  () => {
    backgroundColor = color("indigo");
    blobDog.reset();
    blobDog.pos = createVector(0.2 * width, 1.1 * height);
    blobDog.body.d = canvasSize.height / 3;
    drawStage = function () {
      background(backgroundColor);
      text("BETTER", width / 2, height / 4);
      blobDog.draw();
    }
  }
)

const hopSettings = {
  lowPoint: 1.5 * canvasSize.height,
  duration: 3,
  highPoint: 0.4 * canvasSize.height,
  startX: canvasSize.width * 0.2,
  endX: canvasSize.width * 0.8
};


const highHopLoop = lp.createForce().after(highHopSetup).for(3).do(
  () => {
    blobDog.savePrePos();//will be used later to calculate speed

    const sT = highHopLoop._start;//start time
    const progress = 2 * ((lp.seconds - sT) % hopSettings.duration) / hopSettings.duration - 1;
    //so, progress starts at -1, becomes 0 at the middle and ends at 1
    const parabolaInterpolation = progress * progress;
    const s = hopSettings;
    blobDog.pos.y = s.highPoint + (s.lowPoint - s.highPoint) * parabolaInterpolation;

    blobDog.pos.x = lerp(s.startX, s.endX, 0.5 + progress / 2);//0 to 1
    //blobDog
    blobDog.speed.x = (s.endX - s.startX) / s.duration;
    blobDog.speed.y = (s.lowPoint - s.highPoint) * progress * 2;
    //derivative of x^2 is x*2

    blobDog.squeezeRot = blobDog.speed.heading();
    blobDog.squeeze = 1;
    if (abs(progress) > 0.3) {
      blobDog.squeeze = 1 + 0.1 * (abs(progress) - 0.3);
    }

    blobDog.rot = -progress * Math.PI / 24;
    const turningPoint = 0.35;
    const lowEars = Math.PI / 3
    const highEars = -Math.PI / 12;
    if (progress < -turningPoint) {
      blobDog.ears.angle = lowEars;
    } else if (progress < turningPoint) {
      const linearInterpolation = (progress + turningPoint) / (2 * turningPoint);
      blobDog.ears.angle = lerp(lowEars, highEars, linearInterpolation);
    } else {
      blobDog.ears.angle = highEars;
    }

  }
)

//weightlifting
const weightliftingSetup = lp.createForce().afterPrevious().do(() => {
  backgroundColor = color("midnightBlue");
  blobDog.reset();
  blobDog.pos.x = canvasSize.width / 2;
  barbell.centerX = blobDog.pos.x;
  blobDog.body.d = canvasSize.height / 3;
  barbell.setSize(blobDog.body.d * 2);
  drawStage = function () {
    background(backgroundColor);
    text("HARDER", width / 2, height / 4);
    blobDog.draw();
    barbell.draw();
    blobDog.drawPaws();//they are on the barbell, so they have to be drawn on after it
  }
});


const weightliftingSettings = {
  highPoint: 1,//all length values are in relation to blobDog size
  lowPoint: 0.8,
  period: 60 / song.bpm,
  barbellAmplitude: 0.05,
  crouchingOffset: Math.PI,
  barbellSwingOffset: Math.PI / 6,
  barbellEndsFollowupTime: 1,
  blobDogStandsOnPoint: { x: canvasSize.width / 2, y: 2 * canvasSize.height / 3 },
}

const weightLiftingLoop = lp.createForce().after(weightliftingSetup).for(3).do(
  () => {
    const wlLoop = weightLiftingLoop;
    const wl = weightliftingSettings;
    const angle = wlLoop._start + (2 * Math.PI * lp.seconds / wl.period);
    const progress = (1 - cos(angle)) / 2;
    const crouching = wl.lowPoint + (wl.highPoint - wl.lowPoint) * progress;
    blobDog.squeeze = crouching;
    //keep the dog anchored
    blobDog.pos.y = wl.blobDogStandsOnPoint.y - (blobDog.body.d / 2) * crouching * crouching;

    const barbellPath = cos(angle - Math.PI / 6) * wl.barbellAmplitude * width;

    //I chose the the top point to be the center of barbell's sinusoid
    const topOfDogHead = blobDog.getYofHeadTop();
    //double squeeze because of how the squeeze is applied now, consider creating a 
    barbell.holdsY = topOfDogHead + barbellPath;

    const barbellEndsPath = cos(angle - Math.PI / 6 - Math.PI / 6) * wl.barbellAmplitude * width / 2;
    barbell.endsY = barbell.holdsY + barbellEndsPath;

    //take hold of the bar
    const rightHoldX = barbell.getRightHoldX();
    const leftHoldX = barbell.getLeftHoldX();
    blobDog.takeHoldLeft(leftHoldX, barbell.holdsY);
    blobDog.takeHoldRight(rightHoldX, barbell.holdsY);
  }
);