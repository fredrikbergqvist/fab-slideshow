;(function ($, window, document, undefined) {
    "use strict";


	var fabSlideshow = function(elem, options){
      this.elem = elem;
      this.$elem = $(elem);
      this.options = options;
    };

	fabSlideshow.prototype = {
	    defaults: {
	    	autoRotate: true,
	    	slideInterval: 1000,
	      	previewPosition: 'right'
	    },

		init: function() {
			this.config = $.extend({}, this.defaults, this.options);
      		this.slideItems = this.$elem.find(".fab-slideshow-item");

			this.gui.setInitialCssClasses();
			this.startSlideshow();
			return this;
		},
		startSlideshow: function(){

		},

		gui: {
			setInitialCssClasses: function() {
				this.slideItems.first().addClass("selected");
			},
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