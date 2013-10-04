;(function ($, window, document, undefined) {
    "use strict";

    var fabSlideshow = function(elem, options){
      this.elem = elem;
      this.$elem = $(elem);
      this.options = options;
    },
    thisPlugin;

    fabSlideshow.prototype = {
        defaults: {
            autoRotate: true,
            slideInterval: 5000
        },
        init: function() {
            //Set variables
            thisPlugin = this;
            thisPlugin.config = $.extend({}, this.defaults, this.options);
            thisPlugin.slideItems = this.$elem.find(".fab-slideshow-item");
            thisPlugin.selectedSlideIndex = 0;

            thisPlugin.slideshow.setSlideCssClasses();

            //init the slideshow
            thisPlugin.slideshow.init();

            return thisPlugin;
        },
        slideshow:{
            init: function(){
                //Set first slide
                thisPlugin.$selectedItem = $(thisPlugin.slideItems.get(0));
                thisPlugin.$selectedItem.addClass("selected").css("display", "block");

                //Register handlers
                thisPlugin.slideshow.handlers.slideMouseover();
                thisPlugin.slideshow.handlers.slideMouseout();

                //render preview window
                thisPlugin.previewWindow.init();

                //Start rotating the slides
                if(thisPlugin.config.autoRotate){
                    thisPlugin.slideshow.startSlideshow();
                }
            },
            setSlideCssClasses : function(){
                //Mark first item as selected
                //Set slide numbers
                var i, $slide;
                for (i = 0;i<thisPlugin.slideItems.length;i++){
                    $slide = $(thisPlugin.slideItems.get(i));
                    $slide.attr("data-slide", i).addClass("slide-" + i).css("display", "none");
                }
            },
            startSlideshow: function(){
                //Start rotating the slides
                thisPlugin.$elem.trigger("fabSlideshowStarted");
                thisPlugin.slideRotator = setInterval(
                    function () {
                        thisPlugin.slideshow.setSlideAsSelected(thisPlugin.slideshow.getNextSlide(), true);
                    }, thisPlugin.config.slideInterval);
                thisPlugin.$elem.removeClass("stopped").addClass("playing");
            },
            stopSlideshow: function(){
                //Stop rotating the slides
                thisPlugin.$elem.trigger("fabSlideshowStopped");
                clearInterval(thisPlugin.slideRotator);
                thisPlugin.$elem.removeClass("playing").addClass("stopped");
            },
            setSlideAsSelected: function($slide, isAutomated){
                if($slide.hasClass("selected")){return;}

                //Remove selected css class on current slide
                thisPlugin.slideshow.deselectCurrentSlide(isAutomated);


                //Set slide as selected
                var slideNumber = $slide.data("slide");
                thisPlugin.$selectedItem = $slide;
                thisPlugin.$selectedItem.addClass("selected");
                thisPlugin.selectedSlideIndex = slideNumber;
                if(isAutomated){
                    thisPlugin.$selectedItem.fadeIn(1000);
                }else{
                    thisPlugin.$selectedItem.css("display", "block");
                }

                //Set preview as selected
                thisPlugin.previewWindow.gui.setPreviewItemAsSelected(slideNumber);
                thisPlugin.$elem.trigger("fabSlideshowSlideSelected", [slideNumber, isAutomated]);

            },
            deselectCurrentSlide: function(isAutomated){
                thisPlugin.$selectedItem.removeClass("selected");

                if(isAutomated){
                    thisPlugin.$selectedItem.fadeOut(1000);
                }else{
                    thisPlugin.$selectedItem.css("display", "none");
                }
            },

            getNextSlide: function(){
                var nextSlideId = (thisPlugin.selectedSlideIndex + 1);
                if(nextSlideId >= thisPlugin.slideItems.length){
                    nextSlideId = 0;
                }
                thisPlugin.selectedSlideIndex = nextSlideId;
                return $(thisPlugin.slideItems.get(nextSlideId));
            },
            getPreviousSlide: function(){
                var prevSlideId = (thisPlugin.selectedSlideIndex - 1);
                if(prevSlideId < 0){
                    prevSlideId = (thisPlugin.slideItems.length - 1);
                }
                return $(thisPlugin.slideItems.get(prevSlideId));
            },

            handlers:{
                slideMouseover: function(){
                    thisPlugin.$elem.mouseover(thisPlugin.slideshow.stopSlideshow);
                },
                slideMouseout: function(){
                    thisPlugin.$elem.mouseout(thisPlugin.slideshow.callbacks.slideMouseout);
                }
            },

            callbacks:{
                slideMouseout: function(){
                    if (thisPlugin.config.autoRotate) {
                        thisPlugin.slideRotator = null;
                        thisPlugin.slideshow.startSlideshow();
                    }
                }
            }
        },

        previewWindow: {
            init: function(){
                thisPlugin.previewWindow.gui.renderPreviewWindow();
                thisPlugin.previewWindow.handlers.previewItemMouseOver();
            },
            $previewWindow: {},
            gui: {
                renderPreviewWindow: function(){
                    var items = thisPlugin.previewWindow.gui.generatePreviewItem(),
                        previewBlock = "<nav class='fab-slideshow-preview'><ul class='fab-slideshow-preview-container'>{0}</ul></nav>";
                    thisPlugin.$elem.append(previewBlock.format(items));
                    thisPlugin.previewWindow.$previewWindow = thisPlugin.$elem.find(".fab-slideshow-preview");
                },
                generatePreviewItem: function(){
                    var item, i, imgSrc, name,
                        itemTemplate = "<li class='fab-slideshow-preview-item slide-{2} {3}' data-slide='{2}'><img src='{0}' alt='{1}' /><div class='fab-slideshow-preview-item-text'><h3>{1}</h3></div></li>",
                        items = "",
                        selectedClass = "";
                    for(i = 0; i < thisPlugin.slideItems.length; i++){
                        item = $(thisPlugin.slideItems.get(i));
                        imgSrc = item.find("img").attr("src");
                        name = item.find("h3").text();
                        selectedClass = i === 0 ? "selected"  : "";

                        items += itemTemplate.format(imgSrc, name, i, selectedClass);
                    }
                    return items;
                },
                setPreviewItemAsSelected: function(slideNumber){
                    thisPlugin.previewWindow.$previewWindow.find(".selected").removeClass("selected");
                    thisPlugin.previewWindow.$previewWindow.find(".slide-" + slideNumber).addClass("selected");
                }
            },
            handlers:{
                previewItemMouseOver: function(){
                    thisPlugin.previewWindow.$previewWindow.on("mouseover", ".fab-slideshow-preview-item", thisPlugin.previewWindow.callbacks.previewItemMouseOver);
                }
            },
            callbacks:{
                previewItemMouseOver: function(){
                    var $this = $(this),
                        slideNumber = $this.data("slide"),
                        $slide = $(thisPlugin.slideItems.get(slideNumber));

                    thisPlugin.slideshow.setSlideAsSelected($slide, false);
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