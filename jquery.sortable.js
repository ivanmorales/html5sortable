
/*
	HTML5 Sortable jQuery Plugin
	http://farhadi.ir/projects/html5sortable

	Copyright 2012, Ali Farhadi
	Released under the MIT license.
*/


(function() {

  (function($) {
    var dragging, placeholders;
    dragging = null;
    placeholders = $();
    return $.fn.sortable = function(options) {
      var method;
      method = String(options);
      options = $.extend({
        connectWith: false,
        allowNesting: false,
        forcePlaceholderSize: true,
        tolerance: .2
      }, options);
      /* jQuery Plugin return
      */

      return this.each(function() {
        /* Handle method calls
        */

        var holder, index, isHandle, items, placeholder, placeholderTag, subholders;
        if (/^enable|disable|destroy$/.test(method)) {
          items = $(this).children($(this).data('items')).attr('draggable', method === 'enable');
          if (method === 'destroy') {
            items.add(this).removeData('connectWith items').off('dragstart.h5s dragend.h5s selectstart.h5s dragover.h5s dragenter.h5s drop.h5s');
          }
          return;
        }
        /* Initialize local variables
        */

        isHandle = false;
        index = 0;
        holder = $(this);
        items = holder.children(options.items);
        placeholderTag = /^ul|ol$/i.test(this.tagName) ? 'li' : 'div';
        placeholder = $("<" + placeholderTag + " class='sortable-placeholder'>");
        subholders = $();
        items.find(options.handle).mousedown(function() {
          return isHandle = true;
        }).mouseup(function() {
          return isHandle = false;
        });
        $(this).data('items', options.items);
        placeholders = placeholders.add(placeholder);
        if (options.connectWith) {
          $(options.connectWith).add(this).data('connectWith', options.connectWith);
        }
        return items.attr('draggable', 'true').on('dragstart.h5s', function(e) {
          var dt;
          if (options.handle && !isHandle) {
            return false;
          }
          dt = e.originalEvent.dataTransfer;
          dt.effectAllowed = 'move';
          dt.setData('Text', 'dummy');
          return index = (dragging = $(e.target || this)).addClass('sortable-dragging').index();
        }).on('dragend.h5s', function() {
          if (!dragging) {
            return;
          }
          isHandle = false;
          dragging.removeClass('sortable-dragging').show();
          placeholders.detach();
          if (index !== dragging.index()) {
            holder.trigger('sortupdate', {
              item: dragging
            });
          }
          return dragging = null;
        }).not('a[href], img').on('selectstart.h5s', function() {
          if (typeof this.dragDrop === "function") {
            this.dragDrop();
          }
          return false;
        }).end().add([this, placeholder]).on('dragover.h5s dragenter.h5s drop.h5s', function(e) {
          var position, subholder;
          if (!items.is(dragging) && options.connectWith !== $(dragging).parent().data('connectWith')) {
            return true;
          }
          if (e.type === 'drop') {
            /* Handle drops into sub holders or items
            */

            if (items.is(this) && options.allowNesting && placeholder.parent().is(':not(.sortable-sub-holder)')) {
              subholder = $(this).find('> .sortable-sub-holder');
              if (subholder.length === 0) {
                $(this).append(subholder = $("<" + holder[0].tagName + " class='sortable-sub-holder'>"));
              }
              subholders = subholders.add(subholder);
              /* Add dragged element into new/old subholder
              */

              subholder.append(dragging);
            } else {
              /* Replace placeholder with dragged element
              */

              placeholders.filter(':visible').after(dragging);
            }
            e.stopPropagation();
            dragging.trigger('dragend.h5s');
            return false;
          }
          e.preventDefault();
          e.originalEvent.dataTransfer.dropEffect = 'move';
          if (items.is(this)) {
            /* Force the size of the placeholder to the height of the dragged element
            */

            if (options.forcePlaceholderSize) {
              placeholder.height(dragging.height());
            }
            /* Hide dragged element
            */

            dragging.hide();
            /* Calculate mouse position relative to hover element
            */

            position = {
              x: e.originalEvent.pageX - $(this).offset().left,
              y: e.originalEvent.pageY - $(this).offset().top
            };
            /* Add element to nested item
            */

            if (options.allowNesting && position.y > (dragging.outerHeight() * options.tolerance) && position.y < dragging.outerHeight()) {
              $(this).append(placeholder);
            } else if (position.y > 0 && position.y < (dragging.outerHeight() * options.tolerance)) {
              $(this).before(placeholder);
            } else if (position.y > (dragging.outerHeight() * (1 - options.tolerance * .5)) && position.y < dragging.outerHeight()) {
              $(this).after(placeholder);
            }
            placeholders.not(placeholder).detach();
          } else if (!placeholders.is(this) && !$(this).children(options.items).length) {
            placeholders.detach();
            $(this).append(placeholder);
          }
          return false;
        });
      });
    };
  })(jQuery);

}).call(this);
