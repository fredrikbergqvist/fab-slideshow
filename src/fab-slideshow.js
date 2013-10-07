/*! Copyright (c) 2013 Fredrik Bergqvist
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.0.0
 *
 */
;(function ($, window, document, undefined) {
    "use strict";

    var fabSlideshow = function(elem, options){
      this.elem = elem;
      this.$elem = $(elem);
      this.options = options;
    },
    _this;

    fabSlideshow.prototype = {
        defaults: {
            autoRotate: true,
            slideInterval: 5000
        },
        init: function() {
            //Set variables
            _this = this;
            _this.config = $.extend({}, _this.defaults, _this.options);
            _this.slideItems = _this.$elem.find(".fab-slideshow-item");
            _this.selectedSlideIndex = 0;
            _this.slideshow.setSlideCssClasses();
            //init the slideshow
            _this.slideshow.init();

            return _this;
        },
        slideshow:{
            init: function(){
                //Set first slide
                _this.$selectedItem = $(_this.slideItems.get(0));
                _this.$selectedItem.addClass("selected").css("display", "block");

                //Register handlers
                _this.slideshow.handlers.slideMouseover();
                _this.slideshow.handlers.slideMouseout();

                //render preview window
                _this.previewWindow.init();

                //Start rotating the slides
                if(_this.config.autoRotate){
                    _this.slideshow.startSlideshow();
                }
            },
            setSlideCssClasses : function(){
                //Mark first item as selected
                //Set slide numbers
                var i, $slide;
                for (i = 0;i<_this.slideItems.length;i++){
                    $slide = $(_this.slideItems.get(i));
                    $slide.attr("data-slide", i).addClass("slide-" + i).css("display", "none");
                }
            },
            startSlideshow: function(){
                //Start rotating the slides
                _this.$elem.trigger("fabSlideshowStarted");
                _this.slideRotator = setInterval(
                    function () {
                        _this.slideshow.setSlideAsSelected(_this.slideshow.getNextSlide(), true);
                    }, _this.config.slideInterval);
                _this.$elem.removeClass("stopped").addClass("playing");
            },
            stopSlideshow: function(){
                //Stop rotating the slides
                _this.$elem.trigger("fabSlideshowStopped");
                clearInterval(_this.slideRotator);
                _this.$elem.removeClass("playing").addClass("stopped");
            },
            setSlideAsSelected: function($slide, isAutomated){
                if($slide.hasClass("selected")){return;}

                //Remove selected css class on current slide
                _this.slideshow.deselectCurrentSlide(isAutomated);


                //Set slide as selected
                var slideNumber = $slide.data("slide");
                _this.$selectedItem = $slide;
                _this.$selectedItem.addClass("selected");
                _this.selectedSlideIndex = slideNumber;
                if(isAutomated){
                    _this.$selectedItem.fadeIn(1000);
                }else{
                    _this.$selectedItem.css("display", "block");
                }

                //Set preview as selected
                _this.previewWindow.gui.setPreviewItemAsSelected(slideNumber);
                _this.$elem.trigger("fabSlideshowSlideSelected", [slideNumber, isAutomated]);

            },
            deselectCurrentSlide: function(isAutomated){
                _this.$selectedItem.removeClass("selected");
                _this.$elem.trigger("fabSlideshowSlideUnSelected", [_this.selectedSlideIndex, isAutomated]);
                if(isAutomated){
                    _this.$selectedItem.fadeOut(1000);
                }else{
                    _this.$selectedItem.css("display", "none");
                }
            },

            getNextSlide: function(){
                var nextSlideId = (_this.selectedSlideIndex + 1);
                if(nextSlideId >= _this.slideItems.length){
                    nextSlideId = 0;
                }
                _this.selectedSlideIndex = nextSlideId;
                return $(_this.slideItems.get(nextSlideId));
            },
            getPreviousSlide: function(){
                var prevSlideId = (_this.selectedSlideIndex - 1);
                if(prevSlideId < 0){
                    prevSlideId = (_this.slideItems.length - 1);
                }
                return $(_this.slideItems.get(prevSlideId));
            },

            handlers:{
                slideMouseover: function(){
                    _this.$elem.mouseover(_this.slideshow.stopSlideshow);
                },
                slideMouseout: function(){
                    _this.$elem.mouseout(_this.slideshow.callbacks.slideMouseout);
                }
            },

            callbacks:{
                slideMouseout: function(){
                    if (_this.config.autoRotate) {
                        _this.slideRotator = null;
                        _this.slideshow.startSlideshow();
                    }
                }
            }
        },

        previewWindow: {
            init: function(){
                _this.previewWindow.gui.renderPreviewWindow();
                _this.previewWindow.handlers.previewItemMouseOver();
            },
            $previewWindow: {},
            gui: {
                renderPreviewWindow: function(){
                    var items = _this.previewWindow.gui.generatePreviewItem(),
                        previewBlock = "<nav class='fab-slideshow-preview'><ul class='fab-slideshow-preview-container'>{0}</ul></nav>";
                    _this.$elem.append(previewBlock.format(items));
                    _this.previewWindow.$previewWindow = _this.$elem.find(".fab-slideshow-preview");
                },
                generatePreviewItem: function(){
                    var item, i, imgSrc, name,
                        itemTemplate = "<li class='fab-slideshow-preview-item slide-{2} {3}' data-slide='{2}'><img src='{0}' alt='{1}' /><div class='fab-slideshow-preview-item-text'><h3>{1}</h3></div></li>",
                        items = "",
                        selectedClass = "";
                    for(i = 0; i < _this.slideItems.length; i++){
                        item = $(_this.slideItems.get(i));
                        imgSrc = item.find("img").attr("src");
                        name = item.find("h3").text();
                        selectedClass = i === 0 ? "selected"  : "";

                        items += itemTemplate.format(imgSrc, name, i, selectedClass);
                    }
                    return items;
                },
                setPreviewItemAsSelected: function(slideNumber){
                    _this.$elem.find(".fab-slideshow-preview .selected").removeClass("selected");
                    _this.previewWindow.$previewWindow.find(".slide-" + slideNumber).addClass("selected");
                }
            },
            handlers:{
                previewItemMouseOver: function(){
                    _this.$elem.on("mouseover", ".fab-slideshow-preview-item", _this.previewWindow.callbacks.previewItemMouseOver);
                }
            },
            callbacks:{
                previewItemMouseOver: function(){
                    var $this = $(this),
                        slideNumber = $this.data("slide"),
                        $slide = $(_this.slideItems.get(slideNumber));

                    _this.slideshow.setSlideAsSelected($slide, false);
                }
            }
        }
    };
    fabSlideshow.defaults = fabSlideshow.prototype.defaults;


    $.fn.fabSlideshow = function(options) {
        return this.each(function() {
            new fabSlideshow(this, options).init();
        });
    };

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] !== 'undefined' ? args[number] : match;
            });
        };
    }

}(jQuery, window, document, undefined));