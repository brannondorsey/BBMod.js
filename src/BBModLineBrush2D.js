/**
 * A 2D brush module for drawing contiguous lines in a stamp-like fashion.
 * @module BBModLineBrush2D
 * @extends BBModBaseBrush2D
 */
define(['./BBModBaseBrush2D', './BBModColor', "./BBModMathUtils"], 
function(  BBModBaseBrush2D,     BBModColor,     BBModMathUtils){

    var justReset = false;
    var controllerModuleHasIsDown = false;

    /**
     * A 2D brush module for drawing contiguous lines in a stamp-like fashion.
     * What makes BBModLineBrush2D fundamentally different from BBModBaseBrush
     * is that each new drawing instance is influenced by the previous position of
     * the brush (usually to adjust for drawing angle or brush width).
     * @class BBModLineBrush2D
     * @constructor
     * @extends BBModBaseBrush2D
     * @param {Object} [config] A optional config hash to initialize any of
     * BBModLineBrush2D's public properties.
     * @example <div><code> var lineBrush = new BBModLineBrush2D({ width: 100,
     * height: 100, variant: "soft" }); </code></div>
     */
    function BBModLineBrush2D(config) {

        BBModBaseBrush2D.call(this, config);

        /**
         * The brush's previous x position. This property is unique to
         * BBModLineBrush.
         * @property prevX
         * @type Number
         * @default null
         */
        this.prevX = null;

        /**
         * The brush's previous y position. This property is unique to
         * BBModLineBrush.
         * @property prevY
         * @type Number
         * @default null
         */
        this.prevY = null;

        /**
         * The type of brush. This property should be treated as read-only.
         * @property type
         * @type String
         * @default "line"
         */
        this.type = "line";

        /**
         * The current brush variant.
         * @property variant
         * @type String
         * @default solid
         */
        this.variant = "solid";

        /**
         * The brush's line weight.
         * @property weight
         * @type Number
         * @default 1
         */
        this.weight = 1;
    
        /**
         * An array of all supported variants.
         * @property variants
         * @type Array
         */
        this.variants = [
            'solid',
            'soft',
            'lines',
            'calligraphy'
        ];

        /**
         * Keeps track of wether or not the controllerModule passed into update
         * was made active (for instance if it was pressed) this frame.
         * @property variants
         * @protected
         * @type Boolean
         */
        this._lineStartedThisFrame = !this.hidden;

        if (config) {

            if (typeof config.variant === 'string') this.variant = config.variant;
            if (typeof config.weight === 'number') this.weight = config.weight;
        }   
    }

    BBModLineBrush2D.prototype = Object.create(BBModBaseBrush2D.prototype);
    BBModLineBrush2D.prototype.constructor = BBModLineBrush2D;

    /**
     * Update method. Usually called once per animation frame.
     * @method update
     * @param {Object} controllerModule An object with x and y properties and
     * optionally an isDown boolean (used for beginning and ending
     * strokeds/marks). 
     */
    BBModLineBrush2D.prototype.update = function(controllerModule) {
        
        BBModBaseBrush2D.prototype.update.call(this, controllerModule);

        if (controllerModule.hasOwnProperty('isDown')) {
            controllerModuleHasIsDown = true;
            this.hidden = (controllerModule.isDown === false);
        } else {
            controllerModuleHasIsDown = false;
        }
    }

    /**
     * Draws the brush to the context. Usually called once per animation frame.
     * @method draw
     * @param {Object} context The HTML5 canvas context you would like to draw
     * to.
     */
    BBModLineBrush2D.prototype.draw = function(context) {
        

        context = BBModBaseBrush2D.prototype.draw.call(this, context);

        context.save();

        context.lineJoin = "round";
        context.lineCap = "round";

        if (typeof this.variant !== 'string' ||
            this.variants.indexOf(this.variant) === -1) {
            throw new Error("BBModBaseBrush2D.draw: " + this.variant + " is not a valid variant for BBModImageBrush2D");
        }      

        // draw down here...
        if (!this.hidden) {

            if (controllerModuleHasIsDown) {
                
                if (this._lineStartedThisFrame) {
                    
                    context.beginPath();
                    context.moveTo(this.x, this.y);

                    this._lineStartedThisFrame = false;

                } else { // we are in the middle of the line

                    var r, g, b, alphaFloat;
                    if (this.color && this.color instanceof BBModColor) {
                        r = this.color.r;
                        g = this.color.g;
                        b = this.color.b;
                        alphaFloat = BBModMathUtils.map(this.color.a, 0, 255, 0.0, 1.0);
                    } else {
                        r = 255;
                        g = 255;
                        b = 255;
                        alphaFloat = 1.0;
                    }

                    if(this.variant == 'solid'){

                        var dx = (this.prevX > this.x) ? this.prevX - this.x : this.x - this.prevX;
                        var dy = (this.prevY > this.y) ? this.prevY - this.y : this.y - this.prevY;

                        this.weight = Math.abs(dx - dy);

                        if( this.weight > 100){ this.weight = 100 }

                        context.lineWidth = BBModMathUtils.map(this.weight, 0, 100, this.height / 2.5, this.height * 2.5);
                        context.lineTo(this.x, this.y);
                        context.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + alphaFloat + ")";
                        context.stroke();
                        context.closePath();
                        context.beginPath();
                        context.moveTo(this.x, this.y);

                    } else if(this.variant == 'soft'){
                        
                        var dist = BBModMathUtils.dist(this.prevX, this.prevY, this.x, this.y);
                        var angle = BBModMathUtils.angleBtw(this.prevX, this.prevY, this.x, this.y);
                        for (var i = 0; i < dist; i++) {
                            var x = this.prevX + (Math.sin(angle) * i);
                            var y = this.prevY + (Math.cos(angle) * i);
                            var gradient = context.createRadialGradient(x, y, this.width/6, x, y, this.height/2);
                            gradient.addColorStop(0, "rgba(" + r + ", " + g + ", " + b + ', 0.1)');
                            gradient.addColorStop(1, "rgba(" + r + ", " + g + ", " + b + ', 0)');
                            context.fillStyle = gradient;
                            context.fillRect(x - this.height/2, y - this.height/2, this.height, this.height);
                        };

                    } else if(this.variant == 'lines' || this.variant == 'calligraphy'){

                        if(this.variant == 'lines'){ context.lineWidth = (this.height < 1) ? 1 : this.height * 0.05; }
                        if(this.variant == 'calig'){ context.lineWidth = this.height * 0.2; }

                        context.strokeStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                        context.moveTo(this.prevX, this.prevY);
                        context.lineTo(this.x, this.y);
                        context.stroke();
                        context.moveTo(this.prevX - this.height * 0.2, this.prevY - this.height * 0.2);
                        context.lineTo(this.x - this.height * 0.2, this.y - this.height * 0.2);
                        context.stroke();
                        context.moveTo(this.prevX - this.height * 0.1, this.prevY - this.height * 0.1);
                        context.lineTo(this.x - this.height * 0.1, this.y - this.height * 0.1);
                        context.stroke();
                        context.moveTo(this.prevX + this.height * 0.1, this.prevY + this.height * 0.1);
                        context.lineTo(this.x + this.height * 0.1, this.y + this.height * 0.1);
                        context.stroke();
                        context.moveTo(this.prevX + this.height * 0.2, this.prevY + this.height * 0.2);
                        context.lineTo(this.x + this.height * 0.2, this.y + this.height * 0.2);
                        context.stroke();
                    }
                }

            } else { // this controller has no "button", so assume it is always pressed
                
            }

        } else {
            this._lineStartedThisFrame = true;
        }

        context.restore();

        this.prevX = this.x;
        this.prevY = this.y;
    }

    return BBModLineBrush2D;
});
