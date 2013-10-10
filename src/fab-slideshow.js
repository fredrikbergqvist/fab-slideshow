/*! Copyright (c) 2013 Fredrik Bergqvist (fredrik (at) bergqvist dot it)
 *  Download here: http://github.com/fredrikbergqvist/fab-slideshow
 *
 *  Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 *  and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 *  Version: 1.0.0
 *
 */
;(function ($, window, document, undefined) {
    "use strict";

    var fabSlideshow = function(elem, options){
      this.elem = elem;
      this.$elem = $(elem);
      this.options = options;
    },
    self;

    fabSlideshow.prototype = {
        defaults: {
            autoRotate: true,
            slideInterval: 5000,
            showPreviewWindow : true
        },
        init: function() {
            //Set variables
            self = this;
            self.config = $.extend({}, self.defaults, self.options);
            self.slideItems = self.$elem.find(".fab-slideshow-item");
            self.selectedSlideIndex = 0;
            self.slideshow.setSlideCssClasses();
            //init the slideshow
            self.slideshow.init();

            return self;
        },
        slideshow:{
            init: function(){
                //Set first slide
                self.$selectedItem = $(self.slideItems.get(0));
                self.$selectedItem.addClass("selected").css("display", "block");

                //Register handlers
                self.slideshow.handlers.slideMouseover();
                self.slideshow.handlers.slideMouseout();

                //render preview window
                self.previewWindow.init();

                //Start rotating the slides
                if(self.config.autoRotate){
                    self.slideshow.startSlideshow();
                }
            },
            setSlideCssClasses : function(){
                //Set slide numbers
                var i, $slide;
                for (i = 0;i<self.slideItems.length;i++){
                    $slide = $(self.slideItems.get(i));
                    $slide.attr("data-slide", i).addClass("slide-" + i).css("display", "none").attr("aria-selected", false);
                }

                //Set css classes if we only have one item or more then 4 slides.
                if (self.slideItems.length === 1) {
                    self.$elem.addClass("single-item");
                    self.config.autoRotate = false;
                }else if (self.slideItems.length > 4) {
                    self.$elem.addClass("scroll-items");
                }
            },
            startSlideshow: function(){
                //Start rotating the slides
                self.$elem.trigger("fabSlideshowStarted");
                self.slideRotator = setInterval(
                    function () {
                        self.slideshow.setSlideAsSelected(self.slideshow.getNextSlide(), true);
                    }, self.config.slideInterval);
                self.$elem.removeClass("stopped").addClass("playing");
            },
            stopSlideshow: function(){
                //Stop rotating the slides
                self.$elem.trigger("fabSlideshowStopped");
                clearInterval(self.slideRotator);
                self.$elem.removeClass("playing").addClass("stopped");
            },
            setSlideAsSelected: function($slide, isAutomated){
                if($slide.hasClass("selected")){return;}

                //Remove selected css class on current slide
                self.slideshow.deselectCurrentSlide(isAutomated);


                //Set slide as selected
                var slideNumber = $slide.data("slide");
                self.$selectedItem = $slide;
                self.$selectedItem.addClass("selected");
                self.$selectedItem.attr("aria-selected", true);
                self.$selectedItem.attr("tab-index", 0);
                self.selectedSlideIndex = slideNumber;
                if(isAutomated){
                    self.$selectedItem.fadeIn(1000);
                }else{
                    self.$selectedItem.css("display", "block");
                }

                //Set preview as selected
                self.previewWindow.gui.setPreviewItemAsSelected(slideNumber);

                self.$elem.trigger("fabSlideshowSlideSelected", [slideNumber, isAutomated]);

            },
            deselectCurrentSlide: function(isAutomated){
                self.$selectedItem.removeClass("selected");
                self.$selectedItem.attr("aria-selected", false);
                self.$selectedItem.attr("tab-index", -1);
                self.$elem.trigger("fabSlideshowSlideUnSelected", [self.selectedSlideIndex, isAutomated]);
                if(isAutomated){
                    self.$selectedItem.fadeOut(1000);
                }else{
                    self.$selectedItem.css("display", "none");
                }
            },

            getNextSlide: function(){
                var nextSlideId = (self.selectedSlideIndex + 1);
                if(nextSlideId >= self.slideItems.length){
                    nextSlideId = 0;
                }
                self.selectedSlideIndex = nextSlideId;
                return $(self.slideItems.get(nextSlideId));
            },
            getPreviousSlide: function(){
                var prevSlideId = (self.selectedSlideIndex - 1);
                if(prevSlideId < 0){
                    prevSlideId = (self.slideItems.length - 1);
                }
                return $(self.slideItems.get(prevSlideId));
            },

            handlers:{
                slideMouseover: function(){
                    self.$elem.mouseover(self.slideshow.stopSlideshow);
                },
                slideMouseout: function(){
                    self.$elem.mouseout(self.slideshow.callbacks.slideMouseout);
                }
            },

            callbacks:{
                slideMouseout: function(){
                    if (self.config.autoRotate) {
                        self.slideRotator = null;
                        self.slideshow.startSlideshow();
                    }
                }
            }
        },
        //TODO: Move previewWindow to its own module
        previewWindow: {
            init: function(){
                //Hide preview window if:
                //  - There's only one slide
                //  - User has disabled the preview window
                if (self.slideItems.length <= 1 || !self.config.showPreviewWindow) {
                    return;
                }
                self.previewWindow.gui.renderPreviewWindow();
                self.previewWindow.handlers.previewItemMouseEvent();
                self.previewWindow.handlers.previewScrollMouseEvent();
                self.previewWindow.handlers.previewWindowMouseScrollEvent();
                self.previewWindow.handlers.slideChangeEvent();
            },
            $previewWindow: {},
            gui: {
                renderPreviewWindow: function(){
                    var items = self.previewWindow.gui.generatePreviewItem(),
                        previewBlock = "<nav class='fab-slideshow-preview'><a href='#' class='fab-slideshow-preview-scroll-up'><span>Scroll up</span></a><ul class='fab-slideshow-preview-container'>{0}</ul><a href='#' class='fab-slideshow-preview-scroll-down'><span>Scroll down</span></a></nav>";
                    self.$elem.append(previewBlock.format(items));
                    self.previewWindow.$previewWindow = self.$elem.find(".fab-slideshow-preview");
                },
                generatePreviewItem: function(){
                    var item, i, imgSrc, name,
                        itemTemplate = "<li id='fab-slide-{2}' class='fab-slideshow-preview-item slide-{2} {3}' data-slide='{2}'><img src='{0}' alt='{1}' /><div class='fab-slideshow-preview-item-text'><h3>{1}</h3></div></li>",
                        items = "",
                        selectedClass = "";
                    for(i = 0; i < self.slideItems.length; i++){
                        item = $(self.slideItems.get(i));
                        imgSrc = item.find("img").attr("src");
                        name = item.find("h3").text();
                        selectedClass = i === 0 ? "selected"  : "";

                        items += itemTemplate.format(imgSrc, name, i, selectedClass);
                    }
                    return items;
                },
                setPreviewItemAsSelected: function(slideNumber){
                    self.$elem.find(".fab-slideshow-preview .selected").removeClass("selected");
                    self.previewWindow.$previewWindow.find(".slide-" + slideNumber).addClass("selected");
                }
            },
            handlers:{
                previewItemMouseOver: function(){
                    self.$elem.on("mouseover", ".fab-slideshow-preview-item", self.previewWindow.callbacks.previewItemMouseOver);
                },

                previewItemMouseEvent: function(){
                    self.$elem.on("mouseover", ".fab-slideshow-preview-item", self.previewWindow.callbacks.previewItemMouseOver);
                },
                previewScrollMouseEvent: function() {
                    self.$elem.on("mouseover", ".fab-slideshow-preview-scroll-up", self.previewWindow.callbacks.previewScrollUpMouseOver);
                    self.$elem.on("mouseout", ".fab-slideshow-preview-scroll-up", self.previewWindow.callbacks.previewScrollUpMouseOut);
                    self.$elem.on("mouseover", ".fab-slideshow-preview-scroll-down", self.previewWindow.callbacks.previewScrollDownMouseOver);
                    self.$elem.on("mouseout", ".fab-slideshow-preview-scroll-down", self.previewWindow.callbacks.previewScrollDownMouseOut);
                },
                previewWindowMouseScrollEvent: function() {
                    self.$elem.find(".fab-slideshow-preview-container").bind('DOMMouseScroll', self.previewWindow.callbacks.previewWindowMouseScroll);
                    self.$elem.find(".fab-slideshow-preview-container").bind('mousewheel', self.previewWindow.callbacks.previewWindowMouseScroll);
                },
                slideChangeEvent: function() {
                    self.$elem.on("fabSlideshowSlideSelected", self.previewWindow.callbacks.slideChange);
                }
            },
            callbacks:{
                slideChange : function(e, slideNumber, isAuto) {
                    //scrolls the preview window when slides change automatically
                    if (isAuto) {
                        var $previewContainer = self.$elem.find(".fab-slideshow-preview-container"),
                            $slide = self.$elem.find("#fab-slide-" + slideNumber),
                            positionOfSlide = $previewContainer.scrollTop() - $previewContainer.offset().top + $slide.offset().top;
                        $previewContainer.scrollTop(positionOfSlide);
                    }
                },
                previewWindowMouseScroll: function(e) {
                    //Handles mousewheel scrolling in the preview window
                    var scrollElem = $(this),
                        scrollDelta = e.detail? e.detail*(-120) : e.wheelDelta,
                        top = scrollElem.scrollTop();
                    if (typeof(scrollDelta) === "undefined") {
                        scrollDelta = e.originalEvent.detail? e.originalEvent.detail*(-120) : e.originalEvent.wheelDelta;
                    }
                    if (scrollDelta/120 > 0){
                        if (top > 49) {
                            top -= 50;
                        } else if(top > 0) {
                            top = 0;
                        }
                    } else {
                        top += 50;
                    }
                    scrollElem.scrollTop((top));
                    e.preventDefault();
                    e.stopPropagation();
                },
                previewItemMouseOver: function(){
                    var $this = $(this),
                        slideNumber = parseInt($this.attr("data-slide"), 10),
                        $slide = $(self.slideItems.get(slideNumber));
                    self.slideshow.setSlideAsSelected($slide, false);
                },
                previewScrollUpMouseOver : function() {
                    var scrollElem = self.$elem.find(".fab-slideshow-preview-container"),
                        top = scrollElem.scrollTop();

                    self.scrollUpRepeater = setInterval(function() {
                        top += 2;
                        scrollElem.scrollTop((top));
                    }, 10);
                },
                previewScrollUpMouseOut : function() {
                    clearInterval(self.scrollUpRepeater);
                },
                previewScrollDownMouseOver : function() {
                    var scrollElem = self.$elem.find(".fab-slideshow-preview-container"),
                        top = scrollElem.scrollTop();

                    self.scrollDownRepeater = setInterval(function() {
                        if (top > 1) {
                            top -= 2;
                            scrollElem.scrollTop((top));
                        }
                    }, 10);
                },
                previewScrollDownMouseOut : function() {
                    clearInterval(self.scrollDownRepeater);
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