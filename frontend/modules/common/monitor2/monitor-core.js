var Monitor = window.Monitor || {};
(function () {
    /**
     * Monitor Element Class
     *
     * @namespace Monitor.Element
     * @class Element
     * @constructor
     */
    Monitor.Element = function () {};
    Monitor.browser = {
        isIE: !-[1, ],
        isSafari: /safari/i.test(navigator.userAgent),
        isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)
    };
    /**
     * Constant for the default CSS class name that represents a Monitor
     * @property Monitor.Element.CSS_Monitor
     * @static
     * @final
     * @type String
     */
    /// Monitor.Element.CSS_Monitor = "Monitor-module";    
    Monitor.Element.prototype.fillBackground = true;
    Monitor.Element.prototype.showcorners = false;
    Monitor.Element.prototype.photoborder = true;
    Monitor.Element.prototype.polaroid = false;
    Monitor.Element.prototype._backgroundImg = null;
    Monitor.Element.prototype._cornerImg = null;
    /**
     * The object literal containing mouse position if clicked in an empty area (no image)
     * @property _groupSelector
     * @type object
     */
    Monitor.Element.prototype._groupSelector = null;
    /**
     * The array element that contains all the images of the Monitor
     * @property _aImages
     * @type object
     */
    Monitor.Element.prototype._aImages = null;
    /**
     * The element that references the Monitor interface implementation
     * @property _oContext
     * @type object
     */
    Monitor.Element.prototype._oContext = null;
    /**
     * The main element that contains the Monitor
     * @property _oElement
     * @type object
     */
    Monitor.Element.prototype._oElement = null;
    /**
     * The object literal containing config parameters
     * @property _oConfig
     * @type object
     */
    Monitor.Element.prototype._oConfig = null;
    /**
     * The object literal containing the current x,y params of the transformation
     * @property _currentTransform
     * @type object
     */
    Monitor.Element.prototype._currentTransform = null;
    /**
     * Init method
     * @method init
     * @param el {HTMLElement | String} Container element for the Monitor.
     * @param oConfig {Object} userConfig The configuration Object literal 
     */
    Monitor.Element.prototype.init = function (el, oConfig) {
        if (el === '') {
            return;
        }
        this._initElement(el, oConfig.root);
        this._initConfig(oConfig);
        this._createMonitorBackground();
        this._createContainer();
        this._loadMonitorIcons();
        if (!!oConfig.isAdmin) {
            this._initEvents();
            this._initCustomEvents();
        }
    };
    /**
     * The Monitor class's initialization method. This method is automatically 
     * called by the constructor, and sets up all DOM references for 
     * pre-existing markup, and creates required markup if it is not 
     * already present.
     * @method _initElement
     * @param el {HTMLElement | String} el The element representing the Monitor
     */
    Monitor.Element.prototype._initElement = function (el, root) {
        if (!!$(el).length || !!$('#' + el).length) {
            if (typeof el === 'string') {
                this._oElement = document.getElementById(el);
            } else {
                this._oElement = el;
            }
        } else {
            if (Monitor.browser.isIE) {
                var MonitorEl = exMonitor(document.createElement('Monitor'));
            } else {
                var MonitorEl = document.createElement('Monitor');
            }
            MonitorEl.id = el + '';
            root = typeof root === 'string' ? document.getElementById(root) : root;
            var oMonitor = !!root ? root.appendChild(MonitorEl) : document.body.insertBefore(MonitorEl, document.body.firstChild);
            this._oElement = document.getElementById(el + '');
        }
        // it contains the active image and the listeners
        this._oContextTop = this._oElement.getContext('2d');
    };
    /**
     * The custom events initialization method. 
     * @method _initCustomEvents
     */
    Monitor.Element.prototype._initCustomEvents = function () {
        this.onRotateStart = new Monitor.CustomEvent('onRotateStart');
        this.onRotateMove = new Monitor.CustomEvent('onRotateMove');
        this.onRotateComplete = new Monitor.CustomEvent('onRotateComplete');
        this.onDragStart = new Monitor.CustomEvent('onDragStart');
        this.onDragMove = new Monitor.CustomEvent('onDragMove');
        this.onDragComplete = new Monitor.CustomEvent('onDragComplete');
    };
    /**
     * For now we use an object literal without methods to store the config params
     * @method _initConfig
     * @param oConfig {Object} userConfig The configuration Object literal 
     * containing the configuration that should be set for this module. 
     * See configuration documentation for more details.
     */
    Monitor.Element.prototype._initConfig = function (oConfig) {
        this._oConfig = oConfig;
        this._oElement.width = this._oConfig.width;
        this._oElement.height = this._oConfig.height;
        this._oElement.style.width = this._oConfig.width + 'px';
        this._oElement.style.height = this._oConfig.height + 'px';
    };
    /**
     * Adds main mouse listeners to the whole Monitor
     * @method _initEvents
     * See configuration documentation for more details.
     */
    Monitor.Element.prototype._initEvents = function () {
        var _this = this;
        var start = 'mousedown';
        var end = 'mouseup';
        var move = 'mousemove';
        if (Monitor.browser.isMobile) {
            start = 'touchstart';
            end = 'touchend';
            move = 'touchmove';
        }
        $(this._oElement)
            .on(start, function (e) {
                _this.onMouseDown.call(_this, e);
            })
            .on(end, function (e) {
                _this.onMouseUp.call(_this, e);
            })
            .on(move, function (e) {
                _this.onMouseMove.call(_this, e);
            });
        // Monitor.Element.addEventListener("mousedown", function(evt) { startTransform(evt); }, false);
    };
    /**
     * It creates a secondary Monitor to contain all the images are not being translated/rotated/scaled
     * @method _createContainer
     */
    Monitor.Element.prototype._createContainer = function () {
        if (Monitor.browser.isIE) {
            var MonitorEl = exMonitor(document.createElement('canvas'));
        } else {
            var MonitorEl = document.createElement('canvas');
        }
        MonitorEl.id = this._oElement.id + '-Monitor-container';
        var oContainer = this._oElement.parentNode.insertBefore(MonitorEl, this._oElement);
        oContainer.width = this._oConfig.width;
        oContainer.height = this._oConfig.height;
        oContainer.style.width = this._oConfig.width + 'px';
        oContainer.style.height = this._oConfig.height + 'px';
        // this will contain all images that are not on the top
        this._clipContainer = oContainer;
        this._oContextContainer = oContainer.getContext('2d');
    };
    Monitor.Element.prototype._createMonitorBackground = function () {
        if (Monitor.browser.isIE) {
            var MonitorEl = exMonitor(document.createElement('canvas'));
        } else {
            var MonitorEl = document.createElement('canvas');
        }
        MonitorEl.id = this._oElement.id + '-Monitor-background';
        var oBackground = this._oElement.parentNode.insertBefore(MonitorEl, this._oElement);
        oBackground.width = this._oConfig.width;
        oBackground.height = this._oConfig.height;
        oBackground.style.width = this._oConfig.width + 'px';
        oBackground.style.height = this._oConfig.height + 'px';
        // this will contain the background
        this._oContextBackground = oBackground.getContext('2d');
    };
    Monitor.Element.prototype.setMonitorBackground = function (oImg) {
        this._backgroundImg = oImg;
        var originalImgSize = oImg.getOriginalSize();
        // this._oContextBackground.drawImage(oImg._oElement, 0, 0, originalImgSize.width, originalImgSize.height);
        this._oContextBackground.drawImage(oImg._oElement, 0, 0, this._oConfig.width, this._oConfig.height);
    };
    Monitor.Element.prototype._loadMonitorIcons = function () {
        if (!!this._oConfig.corners) {
            this._cornerImg = this._oConfig.corners;
        }
    };
    Monitor.Element.prototype.setMonitorIcons = function (context, oIcon) {

    };
    /**
     * Method that defines the actions when mouse is released on Monitor.
     * The method resets the currentTransform parameters, store the image corner
     * position in the image object and render the Monitor on top.
     * @method onMouseUp
     * @param e {Event} Event object fired on mouseup
     */
    Monitor.Element.prototype.onMouseUp = function (e) {
        if (this._aImages == null) {
            return;
        }
        if (this._currentTransform) {
            // determine the new coords everytime the image changes its position
            this._currentTransform.target.setImageCoords();
        }
        if (this._currentTransform != null && this._currentTransform.action == "rotate") {
            // fire custom rotate event handler
            this.onRotateComplete.fire(e);
        } else if (this._currentTransform != null && this._currentTransform.action == "drag") {
            // fire custom drag event handler
            this.onDragComplete.fire(e);
        }
        this._currentTransform = null;
        this._groupSelector = null;
        // this is to clear the selector box
        this.renderTop();
    };
    Monitor.Element.prototype.checkCollision = function (oPoint, oCircle) {
        var flag = false;
        var distanceFromCenter = Math.sqrt(Math.pow(oPoint.ex - oCircle.oCoords.tr.x, 2) + Math.pow(oPoint.ey - oCircle.oCoords.tr.y, 2));
        if (distanceFromCenter <= oCircle.cornersize) {
           flag = true;
       //   return;
        }
        return flag;
    },
    /**
     * Method that defines the actions when mouse is clicked on Monitor.
     * The method inits the currentTransform parameters and renders all the
     * Monitor so the current image can be placed on the top Monitor and the rest
     * in on the container one.
     * @method onMouseDown
     * @param e {Event} Event object fired on mousedown
     */
    Monitor.Element.prototype.onMouseDown = function (e) {
        var mp = this.findMousePosition(e);
        // ignore if something else is already going on
        if (this._currentTransform != null || this._aImages == null) {
            return;
        }
        // determine whether we clicked the image
        var oImg = this.findTargetImage(mp, false);
        if (!oImg) {
            return;
            this._groupSelector = {
                ex: mp.ex,
                ey: mp.ey,
                top: 0,
                left: 0
            };
        } else {
            // determine if it's a drag or rotate case
            // rotate and scale will happen at the same time
            var isColl = this.checkCollision(mp, oImg); //检测点击坐标跟辅助圆是否重合碰撞
            var action = (!!this.findTargetCorner(mp, oImg) || !!isColl) ? 'rotate' : 'drag';
            if (action == "rotate") {
                // fire custom rotate event handler
                this.onRotateMove.fire(e);
            } else if (action == "drag") {
                // fire custom drag event handler
                this.onDragMove.fire(e);
            }
            this._currentTransform = {
                target: oImg,
                action: action,
                scalex: oImg.scalex,
                offsetX: mp.ex - oImg.left,
                offsetY: mp.ey - oImg.top,
                ex: mp.ex,
                ey: mp.ey,
                left: oImg.left,
                top: oImg.top,
                theta: oImg.theta
            };
            // we must render all so the active image is placed in the Monitortop
            this.renderAll(false);
        }
    };
    /**
     * Method that defines the actions when mouse is hovering the Monitor.
     * The currentTransform parameter will definde whether the user is rotating/scaling/translating
     * an image or neither of them (only hovering). A group selection is also possible and would cancel
     * all any other type of action.
     * In case of an image transformation only the top Monitor will be rendered.
     * @method onMouseMove
     * @param e {Event} Event object fired on mousemove
     */
    Monitor.Element.prototype.onMouseMove = function (e) {
        var mp = this.findMousePosition(e);
        if (this._aImages == null) {
            return;
        }
        if (this._groupSelector != null) {
            // We initially clicked in an empty area, so we draw a box for multiple selection.
            this._groupSelector.left = mp.ex - this._groupSelector.ex;
            this._groupSelector.top = mp.ey - this._groupSelector.ey;
            this.renderTop();
        } else if (this._currentTransform == null) {
            // Here we are hovering the Monitor then we will determine
            // what part of the pictures we are hovering to change the caret symbol.
            // We won't do that while dragging or rotating in order to improve the
            // performance.
            var targetImg = this.findTargetImage(mp, true);
            // set mouse image
            this.setCursor(mp, targetImg);
        } else {
            if (this._currentTransform.action == 'rotate') {
              //  this.rotateImage(mp); //禁止旋转
                this.scaleImage(mp);
                this.onRotateMove.fire(e);
            } else {
                this.translateImage(mp);
                this.onDragMove.fire(e);
            }
            // only commit here. when we are actually moving the pictures
            this.renderTop();
        }
    };
    /**
     * Translate image
     * @method translateImage
     * @param e {Event} the mouse event
     */
    Monitor.Element.prototype.translateImage = function (mp) {
        this._currentTransform.target.left = mp.ex - this._currentTransform.offsetX;
        this._currentTransform.target.top = mp.ey - this._currentTransform.offsetY;
    };
    /**
     * Scale image
     * @method scaleImage
     * @param e {Event} the mouse event
     */
    Monitor.Element.prototype.scaleImage = function (mp) {
        var lastLen = Math.sqrt(Math.pow(this._currentTransform.ey - this._currentTransform.top, 2) + Math.pow(this._currentTransform.ex - this._currentTransform.left, 2));
        var curLen = Math.sqrt(Math.pow(mp.ey - this._currentTransform.top, 2) + Math.pow(mp.ex - this._currentTransform.left, 2));
        this._currentTransform.target.scalex = this._currentTransform.scalex * (curLen / lastLen);
        this._currentTransform.target.scaley = this._currentTransform.target.scalex;
    };
    /**
     * Rotate image
     * @method rotateImage
     * @param e {Event} the mouse event
     */
    Monitor.Element.prototype.rotateImage = function (mp) {
        var lastAngle = Math.atan2(this._currentTransform.ey - this._currentTransform.top, this._currentTransform.ex - this._currentTransform.left);
        var curAngle = Math.atan2(mp.ey - this._currentTransform.top, mp.ex - this._currentTransform.left);
        this._currentTransform.target.theta = (curAngle - lastAngle) + this._currentTransform.theta;
    };
    /**
     * Method to set the cursor image depending on where the user is hovering.
     * Note: very buggy in Opera
     * @method setCursor
     * @param e {Event} the mouse event
     * @param targetImg {Object} image that the mouse is hovering, if so.
     */
    Monitor.Element.prototype.setCursor = function (mp, targetImg) {
        if (!targetImg) {
            this._oElement.style.cursor = 'default';
        } else {
            var corner = this.findTargetCorner(mp, targetImg);
            if (!corner) {
                this._oElement.style.cursor = 'move';
            } else {
                if (corner == 'tr') {
                    this._oElement.style.cursor = 'ne-resize';
                } else if (corner == 'br') {
                    this._oElement.style.cursor = 'se-resize';
                } else if (corner == 'bl') {
                    this._oElement.style.cursor = 'sw-resize';
                } else if (corner == 'tl') {
                    this._oElement.style.cursor = 'nw-resize';
                } else {
                    this._oElement.style.cursor = 'default';
                }
            }
        }
    };
    /**
     * Method to add an image to the Monitor.
     * It actually only pushes the images in an array that will be rendered later in the Monitor.
     * @method addImage
     * @param oImg {Object} Image elment to attach
     */
    Monitor.Element.prototype.addImage = function (oImg) {
        // this._aImages[this._aImages.length] = oImg;
        if (!this._aImages) {
            this._aImages = [];
        }
        this._aImages.push(oImg);
        this.renderAll(false, true);
    };
    Monitor.Element.prototype.changeImage = function (oImg) {
        // this._aImages[this._aImages.length] = oImg;
        if (!this._aImages) {
            this._aImages = [];
        }
        this._aImages = [oImg];
        this.renderAll(false, true);
    };
    Monitor.Element.prototype.clipImage = function (oImg) {
        // this._aImages[this._aImages.length] = oImg;
        if (!this._aImages) {
            return null;
        }
        var containerMonitor = this._oContextContainer;
        containerMonitor.clearRect(0, 0, parseInt(this._oConfig.width), parseInt(this._oConfig.height));
        this._oContextContainer.shadowBlur = 10;
        this._oContextContainer.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this._oContextContainer.drawImage(this._backgroundImg._oElement, 0, 0, this._oConfig.width, this._oConfig.height);
        // we render the rest of images
        if (!!this._aImages) {
            for (var i = 0, l = this._aImages.length; i < l; i ++) {
                this.drawImageElement(containerMonitor, this._aImages[i]);
            }
        }
        return this._clipContainer;
        // we render the top context
    };
    Monitor.Element.prototype.clearContaier = function (oImg) {
        return this._oContextContainer.clearRect(0, 0, parseInt(this._oConfig.width), parseInt(this._oConfig.height));
    };
    /**
     * Method to render both the top Monitor and the secondary container Monitor.
     * @method renderAll
     * @param allOnTop {Boolean} Whether we want to force all images to be rendered on the top Monitor
     */
    Monitor.Element.prototype.renderAll = function (allOnTop, flag) {
        // when allOnTop equals true all images will be rendered in the top Monitor.
        // This is used for actions like toDataUrl that needs to take some actions on a unique Monitor.
        var containerMonitor = (allOnTop) ? this._oContextTop : this._oContextContainer;
        // this._oContextTop.clearRect(0, 0, parseInt(this._oConfig.width), parseInt(this._oConfig.height));
         containerMonitor.clearRect(0, 0, parseInt(this._oConfig.width), parseInt(this._oConfig.height));
        if (allOnTop) {
            var originalImgSize = this._backgroundImg.getOriginalSize();
            this._oContextTop.drawImage(this._backgroundImg._oElement, 0, 0, originalImgSize.width, originalImgSize.height);
        }
        // we render the rest of images
        for (var i = 0, l = this._aImages.length - 1; i < l; i += 1) {
            this.drawImageElement(containerMonitor, this._aImages[i]);
        }
        // we render the top context
        this.drawImageElement(this._oContextTop, this._aImages[this._aImages.length - 1]);
    };
    /**
     * Method to render only the top Monitor.
     * Also used to render the group selection box.
     * @method renderTop
     */
    Monitor.Element.prototype.renderTop = function () {
        // this.beforeRenderEvent.fire();  // placeholder
        this._oContextTop.clearRect(0, 0, parseInt(this._oConfig.width), parseInt(this._oConfig.height));
        // we render the top context
        this.drawImageElement(this._oContextTop, this._aImages[this._aImages.length - 1]);
        if (this._groupSelector != null) {
            this._oContextTop.fillStyle = "rgba(0, 0, 200, 0.5)";
            this._oContextTop.fillRect(this._groupSelector.ex - ((this._groupSelector.left > 0) ? 0 : -this._groupSelector.left), this._groupSelector.ey - ((this._groupSelector.top > 0) ? 0 : -this._groupSelector.top), Math.abs(this._groupSelector.left), Math.abs(this._groupSelector.top));
            this._oContextTop.strokeRect(this._groupSelector.ex - ((this._groupSelector.left > 0) ? 0 : Math.abs(this._groupSelector.left)), this._groupSelector.ey - ((this._groupSelector.top > 0) ? 0 : Math.abs(this._groupSelector.top)), Math.abs(this._groupSelector.left), Math.abs(this._groupSelector.top));
        }
    };
    /**
     * Method that finally uses the Monitor function to render the image
     * @method drawImageElement
     * @param context {Object} Monitor context where the image must be rendered
     * @param oImg {Object} the image object
     */
    Monitor.Element.prototype.drawImageElement = function (context, oImg, flag) {
        var offsetY = oImg.height / 2;
        var offsetX = oImg.width / 2;

       // context.shadowOffsetX=5;
       // context.shadowOffsetY=5;
        context.shadowBlur = 10;
        context.shadowColor = 'rgba(0,0,0,0.8)';
       // ctx.shadowColor="black";
    //    context.fillRect(20,20,100,80);

        context.save();
        context.translate(oImg.left, oImg.top);
        context.rotate(oImg.theta);
        context.scale(oImg.scalex, oImg.scaley);
        this.drawBorder(context, oImg, offsetX, offsetY);
        var originalImgSize = oImg.getOriginalSize();
        // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
        // A = oImg.width - oImg._oElement.width = oImg.borderwidth (if any)
        // B = oImg.height - oImg._oElement.height = oImg.borderwidth + oImg.polaroidheight
        // B - A = oImg.polaroidheight
        if (!flag) {
            var polaroidHeight = ((oImg.height - originalImgSize.height) - (oImg.width - originalImgSize.width)) / 2;
            context.drawImage(oImg._oElement, -originalImgSize.width / 2, -originalImgSize.height/ 2 - polaroidHeight, originalImgSize.width, originalImgSize.height);
            if (oImg.cornervisibility) {
                this.drawCorners(context, oImg, offsetX, offsetY);
            }
        } else {
            var fixWidth = 200;
            var fixHeight = 200;
            if (originalImgSize.width / originalImgSize.height > 1) {
                fixWidth = parseInt(fixWidth * (fixHeight/originalImgSize.height), 10);
            } else if (originalImgSize.width / originalImgSize.height < 1) {
                fixHeight = parseInt(fixHeight * (fixWidth/originalImgSize.width), 10);
            }
            context.drawImage(oImg._oElement, -fixWidth / 2, -fixHeight / 2, fixWidth, fixHeight);
        }
        context.restore();
    };
    /**
     * Method that returns an object with the image lines in it given the coordinates of the corners
     * @method _getImageLines
     * @param oCoords {Object} coordinates of the image corners
     */
    Monitor.Element.prototype._getImageLines = function (oCoords) {
        return {
            topline: {
                o: oCoords.tl,
                d: oCoords.tr
            },
            rightline: {
                o: oCoords.tr,
                d: oCoords.br
            },
            bottomline: {
                o: oCoords.br,
                d: oCoords.bl
            },
            leftline: {
                o: oCoords.bl,
                d: oCoords.tl
            }
        }
    };
    /**
     * Method that determines what picture are we clicking on
     * Applied one implementation of 'point inside polygon' algorithm
     * @method findTargetImage
     * @param e {Event} the mouse event
     * @param hovering {Boolean} whether or not we have the mouse button pressed
     */
    Monitor.Element.prototype.findTargetImage = function (mp, hovering) {
        // http://www.geog.ubc.ca/courses/klink/gis.notes/ncgia/u32.html
        // http://idav.ucdavis.edu/~okreylos/TAship/Spring2000/PointInPolygon.html
        for (var i = this._aImages.length - 1; i >= 0; i -= 1) {
            // we iterate through each image. If target found then return target
            var oEl = this._aImages[i];
            var iLines = this._getImageLines(oEl.oCoords);
            var xpoints = this._findCrossPoints(mp, iLines);
            // if xcount is odd then we clicked inside the image
            // For the specific case of square images xcount == 1 in all true cases

            var isColl = this.checkCollision(mp, oEl); //检测点击坐标跟辅助圆是否重合碰撞

            if ((xpoints % 2 == 1 && xpoints != 0) || !!isColl) {
                var target = oEl;
                //reorder array
                if (!hovering) {
                    this._aImages.splice(i, 1);
                    this._aImages.push(target);
                }
                return target;
            }
        }
        return false;
    };
    /**
     * Helper method to determine how many cross points are between the 4 image edges
     * and the horizontal line determined by the position of our mouse when clicked on Monitor
     * @method _findCrossPoints
     * @param ex {Number} x coordinate of the mouse
     * @param ey {Number} y coordinate of the mouse
     * @param oCoords {Object} Coordinates of the image being evaluated
     */
    Monitor.Element.prototype._findCrossPoints = function (mp, oCoords) {
        var b1, b2, a1, a2, xi, yi;
        var xcount = 0;
        var iLine = null;
        for (lineKey in oCoords) {
            iLine = oCoords[lineKey];
            // optimisation 1: line below dot. no cross
            if ((iLine.o.y < mp.ey) && (iLine.d.y < mp.ey)) {
                continue;
            }
            // optimisation 2: line above dot. no cross
            if ((iLine.o.y >= mp.ey) && (iLine.d.y >= mp.ey)) {
                continue;
            }
            // optimisation 3: vertical line case
            if ((iLine.o.x == iLine.d.x) && (iLine.o.x >= mp.ex)) {
                xi = iLine.o.x;
                yi = mp.ey;
            }
            // calculate the intersection point
            else {
                b1 = 0; //(y2-mp.ey)/(x2-mp.ex); 
                b2 = (iLine.d.y - iLine.o.y) / (iLine.d.x - iLine.o.x);
                a1 = mp.ey - b1 * mp.ex;
                a2 = iLine.o.y - b2 * iLine.o.x;
                xi = -(a1 - a2) / (b1 - b2);
                yi = a1 + b1 * xi;
            }
            // dont count xi < mp.ex cases
            if (xi >= mp.ex) {
                xcount += 1;
            }
            // optimisation 4: specific for square images
            if (xcount == 2) {
                break;
            }
        }
        return xcount;
    };
    /**
     * Determine which one of the four corners has been clicked
     * @method findTargetCorner
     * @param e {Event} the mouse event
     * @param oImg {Object} the image object
     */
    Monitor.Element.prototype.findTargetCorner = function (mp, oImg) {
        var xpoints = null;
        var corners = ['tl', 'tr', 'br', 'bl'];
        for (var i in oImg.oCoords) {
            xpoints = this._findCrossPoints(mp, this._getImageLines(oImg.oCoords[i].corner));
            if (xpoints % 2 == 1 && xpoints != 0 && i === 'tr') {
                return i;
            }
        }
        return false;
    };
    /**
     * Determine which one of the four corners has been clicked
     * @method findTargetCorner
     * @param e {Event} the mouse event
     * @param oImg {Object} the image object
     */
    Monitor.Element.prototype.getFixedPos = function (element) {
        return this.fixedPos || (this.fixedPos = function () {
            return {
                top: element.offset().top,
                left: element.offset().left
            }
        }());
    };
    Monitor.Element.prototype.findMousePosition = function (e) {
        // srcElement = IE
        if (Monitor.browser.isMobile) {
            var touch = e.originalEvent.targetTouches[0]
            var _x = touch.pageX;
            var _y = touch.pageY;
            return {
                ex: _x,
                ey: _y,
                screenX: e.screenX,
                screenY: e.screenY
            };
        } else {
            var parentNode = (e.srcElement) ? e.srcElement.parentNode : e.target.parentNode;
            var pos = this.getFixedPos($(parentNode));
            var isSafari2 = Monitor.browser.isSafari;
            var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var safariOffsetLeft = (isSafari2) ? e.target.ownerDocument.body.offsetLeft + scrollLeft : 0;
            var safariOffsetTop = (isSafari2) ? e.target.ownerDocument.body.offsetTop + scrollTop : 0;
            return {
               // ex: e.clientX + scrollLeft - parentNode.offsetLeft - safariOffsetLeft,
              //  ey: e.clientY + scrollTop - parentNode.offsetTop - safariOffsetTop,
                ex: e.clientX + scrollLeft - pos.left - safariOffsetLeft,
                ey: e.clientY + scrollTop - pos.top - safariOffsetTop,
                screenX: e.screenX,
                screenY: e.screenY
            };
        }
    };
    /**
     * Draw image border, if any. That includes both normal border and polaroid border
     * @method drawBorder
     * @param context {Object} context (layer) where the border will be drawn
     * @param oImg {Object} the Image object
     * @param offsetX {Number} The horizontal offset applied from the (0,0) of the Monitor axis
     * @param offsetY {Number} The vertical offset applied from the (0,0) of the Monitor axis
     */
    Monitor.Element.prototype.drawBorder = function (context, oImg, offsetX, offsetY) {
        var outlinewidth = 2;
        context.fillStyle = 'rgba(0, 0, 0, .3)';
        context.fillRect(-2 - offsetX, -2 - offsetY, oImg.width + (2 * outlinewidth), oImg.height + (2 * outlinewidth));
        context.fillStyle = '#fff';
        context.fillRect(-offsetX, -offsetY, oImg.width, oImg.height);
    };
    /**
     * Draw image corners to help visual understanding of the UI (if required)
     * @method drawCorners
     * @param context {Object} context (layer) where the corners will be drawn
     * @param oImg {Object} the Image object
     * @param offsetX {Number} The horizontal offset applied from the (0,0) of the Monitor axis
     * @param offsetY {Number} The vertical offset applied from the (0,0) of the Monitor axis
     */
    Monitor.Element.prototype.drawCorners = function (context, oImg, offsetX, offsetY) {
        context.fillStyle = "rgba(255, 255, 255, 1)";
        // 画圆
        var oCorner = this._cornerImg;
        if (!!oCorner) {
            var w = oCorner.width;
            var h = oCorner.height;
            var pie = oImg.scalex; //获取图片缩放比例,保持corner大小不变
            context.drawImage(oCorner.element, oImg.width - offsetX - (w/pie/2), -offsetY - h/pie/2, w/pie, h/pie);
        }
       // context.drawImage(oImg._oElement, -fixWidth / 2, -fixHeight / 2, fixWidth, fixHeight);
      /*  context.beginPath();  
        context.arc(oImg.width - offsetX, -offsetY, oImg.cornersize, 0, 2 * Math.PI);
        context.lineWidth = 2;  
        context.strokeStyle = '#333';
        context.fill();

        context.strokeStyle = '#a7a7a7';
        context.shadowBlur = 0;
        // 画箭头主线
        var x1 = oImg.width - offsetX,
            y1 = -offsetY,
            x2 = x1 + oImg.cornersize - 10,
            y2 = y1 - oImg.cornersize + 10;

        context.lineWidth = 1; 
        context.beginPath();
        context.moveTo(x1 + 1, y1 - 1);
        context.lineTo(x2, y2);
        context.stroke();

        var x3 = x1 - oImg.cornersize + 10,
            y3 = y1 + oImg.cornersize - 10;

        context.beginPath();
        context.moveTo(x1 - 1, y1 + 1);
        context.lineTo(x3, y3);
        context.stroke();

        context.lineWidth = 1; 
        //上箭头
        context.beginPath();
        context.translate(x2,y2);  
        var ang=(x2-x1)/(y2-y1);  
        ang=Math.atan(ang);  
        if (y2-y1 >= 0) {  
            context.rotate(-ang);  
        } else {  
            context.rotate(Math.PI-ang);//加个180度，反过来  
        }   
        context.lineTo(-3, -4);  
        context.lineTo(0, 0);   
        context.lineTo(3, -4);   
        context.stroke();
        /*
        // 下箭头
        context.beginPath();
        context.translate(x3,y3);  
        var ang=(x3-x1)/(y3-y1);  
        ang=Math.atan(ang);  
        if (y3-y1 >= 0) {  
            context.rotate(-ang);  
        } else {  
            context.rotate(Math.PI-ang);//加个180度，反过来  
        }   
        context.lineTo(-3, -4);  
        context.lineTo(0, 0);   
        context.lineTo(3, -4);   
        context.stroke();*/




       // context.fillRect(-offsetX, oImg.height - offsetY - oImg.cornersize, oImg.cornersize, oImg.cornersize);
       // context.fillRect(oImg.width - offsetX - oImg.cornersize, oImg.height - offsetY - oImg.cornersize, oImg.cornersize, oImg.cornersize);
    };
    /**
     * Export the specific Monitor element to an Image. Created and rendered on the browser.
     * Beware of crossbrowser support.
     * @method MonitorTo
     * @param format {String} the format of the output image. Either jpeg or png.
     */
    Monitor.Element.prototype.MonitorTo = function (format) {
        this.renderAll(true);
        if (format == 'jpeg' || format == 'png') {
            return this._oElement.toDataURL('image/' + format);
        }
    };
    /**
     * Hook onto "interesting moments" in the lifecycle of Monitor Element
     * @method subscribe
     * @param type {String} The type of event.
     * @param fn {Function} The handler function
     * @param scope {Object} An object to become the execution scope of the handler.
     */
    Monitor.Element.prototype.subscribe = function (type, fn, scope) {
        if (typeof this[type] == "undefined") {
            throw new Error("Invalid custom event name: " + type);
        }
        if (typeof fn != "function") {
            throw new Error("Invalid handler function.");
        }
        this[type].scope = scope || window;
        this[type].handler = fn;
    };
    Monitor.CustomEvent = function (type) {
        this.type = type;
        this.scope = null;
        this.handler = null;
        var self = this;
        this.fire = function (e) {
            if (this.handler != null) {
                self.handler.call(self.scope, e);
            }
        };
    };
}());
(function () {

    /**
     * Img (Image) Element Class
     *
     * @namespace Monitor.Img
     * @class Element
     * @constructor
     * @param el {HTMLElement | String} Container element for the Monitor.
     */
    Monitor.Img = function(el, oConfig) {
        /// this.rotateImage = new YAHOO.util.CustomEvent('rotateImage', this);
        this._initElement(el);
        this._initConfig(oConfig);
        this.setImageCoords();
    };
    
        
    /**
     * Constant for the default CSS class name that represents a Monitor
     * @property Monitor.Img.CSS_Monitor
     * @static
     * @final
     * @type String
     */
    Monitor.Img.CSS_Monitor = "Monitor-img";
    
    /**
     * Constant representing the Module's configuration properties
     * @property DEFAULT_CONFIG
     * @private
     * @final
     * @type Object
     */
    var DEFAULT_CONFIG = {  
        "TOP": { 
            key: "top", 
            value: 10
        },
        
        "LEFT": { 
            key: "left", 
            value: 10
        },
        
        "ANGLE": { 
            key: "angle", 
            value: 0  
        },
        
        "SCALE-X": { 
            key: "scalex", 
            value: 1
        },
        
        "SCALE-Y": { 
            key: "scaley", 
            value: 1
        },
        "CORNERSIZE": { 
            key: "cornersize", 
            value: 20
        },
        "BORDERWIDTH": { 
            key: "borderwidth", 
            value: 10
        },
        "POLAROIDHEIGHT": {
            key: "polaroidheight",
            value: 40
        },
        "RANDOMPOSITION": {
            key: "randomposition",
            value: false
        }
    };
    
    /**
     * The main element that contains the Monitor
     * @property _oElement
     * @type object
     */
    Monitor.Img.prototype._oElement = null;

    /**
     * The object literal containing config parameters
     * @property oConfig
     * @type object
     */
    Monitor.Img.prototype.top = null;
    Monitor.Img.prototype.left = null;
    Monitor.Img.prototype.maxwidth = null;
    Monitor.Img.prototype.maxheight = null;
    Monitor.Img.prototype.oCoords = null;
    Monitor.Img.prototype.angle = null;
    Monitor.Img.prototype.theta = null;
    Monitor.Img.prototype.scalex = null;
    Monitor.Img.prototype.scaley = null;
    Monitor.Img.prototype.cornersize = null;
    Monitor.Img.prototype.polaroidheight = null;
    Monitor.Img.prototype.randomposition = null;
    
    Monitor.Img.prototype.selected = false;
    Monitor.Img.prototype.bordervisibility = false;
    Monitor.Img.prototype.cornervisibility = false;
    
    /**
     * The Image class's initialization method. This method is automatically 
     * called by the constructor.
     * @method _initElement
     * @param {HTMLElement | String} el The element representing the image
     */
    Monitor.Img.prototype._initElement = function(el) {
        if(!$(el).length) {
            if(typeof el === 'string') {
                this._oElement = document.getElementById(el);
            } 
            else {
                this._oElement = el;
            }
            $(this._oElement).addClass(Monitor.Img.CSS_Monitor);
        }
        else if (typeof el === 'object') {
            this._oElement = el;
            // add element to the document: module.js
        }
    };

    /**
     * For now we use an object literal without methods to store the config params
     * It checks if the user has passed any values through oConfig. Otherwise,
     * it sets the values defined in DEFAULT_CONFIG
     * @method _initConfig
     * @param {Object} userConfig The configuration Object literal 
     * containing the configuration that should be set for this module. 
     * See configuration documentation for more details.
     */
    Monitor.Img.prototype._initConfig = function(oConfig) {
        var sKey;
        for (sKey in DEFAULT_CONFIG) {
            var defaultKey = DEFAULT_CONFIG[sKey].key;
            if (!oConfig.hasOwnProperty(defaultKey)) { // = !(defaultKey in oConfig)
                this[defaultKey] = DEFAULT_CONFIG[sKey].value;
            }
            else {
                this[defaultKey] = oConfig[defaultKey];
            }
        }
        
        if (this.bordervisibility) {
            this.currentBorder = this.borderwidth;
        }
        else {
            this.currentBorder = 0;
        }
        
        var normalizedSize = this.getNormalizedSize(this._oElement, parseInt(oConfig.maxwidth), parseInt(oConfig.maxheight));
        this._oElement.width = normalizedSize.width;
        this._oElement.height = normalizedSize.height;
        this.width = normalizedSize.width + (2 * this.currentBorder);
        this.height = normalizedSize.height + (2 * this.currentBorder);
        
        // set initial random position and angle if user hasnt specified them
        if (this.randomposition) {
            this._setRandomProperties(oConfig);
        }
        
        this.theta = this.angle * (Math.PI/180);
        
    };

    /**
     * Method that resizes an image depending on whether maxwidth and maxheight are set up.
     * Width and height have to mantain the same proportion in the final image as it was in the 
     * initial one.
     * @method getNormalizedSize
     * @param {Object} userConfig The configuration Object literal 
     * @param {Integer} maximum width of the image in px 
     * @param {Integer} maximum height of the image in px 
     */ 
    Monitor.Img.prototype.getNormalizedSize = function(oImg, maxwidth, maxheight) {
        if (maxheight && maxwidth && (oImg.width > oImg.height && (oImg.width / oImg.height) < (maxwidth / maxheight))) {
            // console.log('cas 2');
            // height is the constraining dimension.
            normalizedWidth = Math.floor((oImg.width * maxheight) / oImg.height);
            normalizedHeight = maxheight;
        }
        else if (maxheight && ((oImg.height == oImg.width) || (oImg.height > oImg.width) || (oImg.height > maxheight))) {
            // console.log('cas 1'); 
            // height is the constraining dimension.
            normalizedWidth = Math.floor((oImg.width * maxheight) / oImg.height);
            normalizedHeight = maxheight;
        }
        
        else if (maxwidth && (maxwidth < oImg.width)){ 
            // console.log('cas 3');
            // width is the constraining dimension.
            normalizedHeight = Math.floor((oImg.height * maxwidth) / oImg.width);
            normalizedWidth = maxwidth;
        }
        else {
            // console.log('cas 4');
            normalizedWidth = oImg.width;
            normalizedHeight = oImg.height;         
        }
        // console.log(normalizedWidth+":"+normalizedHeight);
        return { width: normalizedWidth, height: normalizedHeight }
    },
    
    Monitor.Img.prototype.getOriginalSize = function() {
        return { width: this._oElement.width, height: this._oElement.height }
    };
    
    /**
     * Sets random angle, top and left of the image if the user hasnt specified
     * specific ones.
     * @method _setRandomProperties
     * @param oConfig {Object} userConfig The configuration Object literal 
     * containing the configuration that should be set for this module. 
     * See configuration documentation for more details.
     */
    Monitor.Img.prototype._setRandomProperties = function(oConfig) {
        if (oConfig.angle == null) { // use YUI.lang
            this.angle = (Math.random() * 40) - 20;
        }
        
        if (oConfig.top == null) {
            this.top = this.height / 2 + Math.random() * 500;
        }
        
        if (oConfig.left == null) {
            this.left = this.width / 2 + Math.random() * 700;
        }
    };
    
    Monitor.Img.prototype.setBorderVisibility = function(showBorder) {
        // reset values
        this.width = this._oElement.width;
        this.height = this._oElement.height;
    
        if (showBorder) {
            this.currentBorder = this.borderwidth;
            this.width += (2 * this.currentBorder);
            this.height += (2 * this.currentBorder);
        }
        else {
            this.currentBorder = 0;
        }
        
        this.setImageCoords();
    };
    
    Monitor.Img.prototype.setCornersVisibility = function(visible) {
        this.cornervisibility = visible;
    };
    
    Monitor.Img.prototype.setPolaroidVisibility = function(showPolaroidFooter) {
        // reset values
        this.width = this._oElement.width;
        this.height = this._oElement.height;
        
        if (showPolaroidFooter) {
            // add borders and polaroid padding
            this.currentBorder = this.borderwidth;
            this.width += (2 * this.currentBorder);
            this.height += this.currentBorder + this.polaroidheight;
        }
        
        this.setImageCoords();
    };
    
    /**
     * It sets image corner position coordinates based on current angle,
     * width and height.
     * @method setImageCoords
     */
    Monitor.Img.prototype.setImageCoords = function() {
        this.left = parseInt(this.left);
        this.top = parseInt(this.top);
        
        this.currentWidth = parseInt(this.width) * this.scalex;
        this.currentHeight = parseInt(this.height) * this.scalex;
        this._hypotenuse = Math.sqrt(Math.pow(this.currentWidth / 2, 2) + Math.pow(this.currentHeight / 2, 2));
        this._angle = Math.atan(this.currentHeight / this.currentWidth);
        
        // offset added for rotate and scale actions
        var offsetX = Math.cos(this._angle + this.theta) * this._hypotenuse;
        var offsetY = Math.sin(this._angle + this.theta) * this._hypotenuse;
        var theta = this.theta;
        var sinTh = Math.sin(theta);
        var cosTh = Math.cos(theta);
        
        var tl = {
            x: this.left - offsetX,
            y: this.top - offsetY
        };
        var tr = {
            x: tl.x + (this.currentWidth * cosTh),
            y: tl.y + (this.currentWidth * sinTh)
        };
        var br = {
            x: tr.x - (this.currentHeight * sinTh),
            y: tr.y + (this.currentHeight * cosTh)
        };
        var bl = {
            x: tl.x - (this.currentHeight * sinTh),
            y: tl.y + (this.currentHeight * cosTh)
        };
        // clockwise
        this.oCoords = { tl: tl, tr: tr, br: br, bl: bl };
        
        // set coordinates of the draggable boxes in the corners used to scale/rotate the image
        this.setCornerCoords();         
    };

    /**
     * It sets the coordinates of the draggable boxes in the corners of
     * the image used to scale/rotate it.
     * @method setCornerCoords
     */ 
    Monitor.Img.prototype.setCornerCoords = function() {
        // Calculate the rotate boxes.
        var coords = this.oCoords;
        var theta = this.theta;
        var cosOffset = this.cornersize * this.scalex * Math.cos(theta);
        var sinOffset = this.cornersize * this.scalex * Math.sin(theta);
        coords.tl.corner = {
            tl: {
                x: coords.tl.x,
                y: coords.tl.y
            },
            tr: {
                x: coords.tl.x + cosOffset,
                y: coords.tl.y + sinOffset
            },
            bl: {
                x: coords.tl.x - sinOffset,
                y: coords.tl.y + cosOffset
            }
        };
        coords.tl.corner.br = {
            x: coords.tl.corner.tr.x - sinOffset,
            y: coords.tl.corner.tr.y + cosOffset
        };
        
        coords.tr.corner = {
            tl: {
                x: coords.tr.x - cosOffset,
                y: coords.tr.y - sinOffset
            },
            tr: {
                x: coords.tr.x + cosOffset,
                y: coords.tr.y - sinOffset
            },
            br: {
                x: coords.tr.x - sinOffset,
                y: coords.tr.y + cosOffset
            }
        };
        coords.tr.corner.bl = {
            x: coords.tr.corner.tl.x - sinOffset,
            y: coords.tr.corner.tl.y + cosOffset
        };
        
        coords.bl.corner = {
            tl: {
                x: coords.bl.x + sinOffset,
                y: coords.bl.y - cosOffset
            },
            bl: {
                x: coords.bl.x,
                y: coords.bl.y
            },
            br: {
                x: coords.bl.x + cosOffset,
                y: coords.bl.y + sinOffset
            }
        };
        coords.bl.corner.tr = {
            x: coords.bl.corner.br.x + sinOffset,
            y: coords.bl.corner.br.y - cosOffset
        };
        
        coords.br.corner = {
            tr: {
                x: coords.br.x + sinOffset,
                y: coords.br.y - cosOffset
            },
            bl: {
                x: coords.br.x - cosOffset,
                y: coords.br.y - sinOffset
            },
            br: {
                x: coords.br.x,
                y: coords.br.y
            }
        };
        coords.br.corner.tl = {
            x: coords.br.corner.bl.x + sinOffset,
            y: coords.br.corner.bl.y - cosOffset
        };
    };
    
    /**
     * Img (Image) Element Class
     *
     * @namespace Monitor.Img
     * @class Element
     * @constructor
     * @param el {HTMLElement | String} Container element for the Monitor.
     */
    Monitor.Line = function(el, oConfig) {
        /// this.rotateImage = new YAHOO.util.CustomEvent('rotateImage', this);
        this._initElement(el);
        this._initConfig(oConfig);
        this.setImageCoords();
    };
    Monitor.Line.prototype = Monitor.Img.prototype;

}());
