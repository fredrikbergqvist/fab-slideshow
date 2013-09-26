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
	    	slideInterval: 3000,
	      	previewPosition: 'right'
	    },

		init: function() {
			//Set variables
			thisPlugin = this;
			thisPlugin.config = $.extend({}, this.defaults, this.options);
      		thisPlugin.slideItems = this.$elem.find(".fab-slideshow-item");
      		thisPlugin.selectedSlideIndex = -1;

      		//Set first slide
			thisPlugin.$selectedItem = $(this.slideItems.get(0));
			thisPlugin.$selectedItem.addClass("selected");
			if(thisPlugin.config.autoRotate){
				thisPlugin.startSlideshow();
			}
			return thisPlugin;
		},
		startSlideshow: function(){
			//Start rotating the slides
			var slideRotator = setInterval(function () {
				var nextSlide = thisPlugin.getNextSlide();
				thisPlugin.setSlideAsSelected(nextSlide);
			}, thisPlugin.config.slideInterval);
		},
		setSlideAsSelected: function($slide){
			//Remove selected css class on current slide 
			thisPlugin.deselectCurrentSlide();
			//Set slide as selected
			thisPlugin.$selectedItem = $slide;
			thisPlugin.$selectedItem.addClass("selected");

		},
		deselectCurrentSlide: function(){
			thisPlugin.$selectedItem.removeClass("selected");
		},

		getNextSlide: function(){
			var nextSlideId = (thisPlugin.selectedSlideIndex + 1);
			console.log(thisPlugin.slideItems.length +' '+ nextSlideId);
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

		gui: {
		},

		events:{

		},

		handlers:{

		},

		callbacks:{

		}
	}

	fabSlideshow.defaults = fabSlideshow.prototype.defaults;

	$.fn.fabSlideshow = function(options) {
		return this.each(function() {
			new fabSlideshow(this, options).init();
		});
	};

}(jQuery, window, document));