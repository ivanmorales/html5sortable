###
	HTML5 Sortable jQuery Plugin
	http://farhadi.ir/projects/html5sortable

	Copyright 2012, Ali Farhadi
	Released under the MIT license.
###
(($)->
	dragging = null
	placeholders = $()

	$.fn.sortable = (options)->
		method = String(options)

		options = $.extend
			connectWith: false
			allowNesting: false
			forcePlaceholderSize: true
			tolerance: .2
		, options
				
		
		### jQuery Plugin return ###
		@each ()->

			### Handle method calls ###
			if /^enable|disable|destroy$/.test(method)
				items = $(this).children($(this).data('items')).attr('draggable', method is 'enable')
				if method is 'destroy'
					items
						.add(this)
						.removeData('connectWith items')
						.off('dragstart.h5s dragend.h5s selectstart.h5s dragover.h5s dragenter.h5s drop.h5s')

				return

			### Initialize local variables ###
			isHandle = false
			index = 0
			holder = $(@)
			items = holder.children(options.items)
			placeholderTag = if /^ul|ol$/i.test(this.tagName) then 'li' else 'div'
			placeholder = $("<#{placeholderTag} class='sortable-placeholder'>")
			subholders = $()

			
			items
				.find(options.handle)
					.mousedown( -> isHandle = true )
					.mouseup( -> isHandle = false )

			$(@).data('items', options.items)

			placeholders = placeholders.add(placeholder)

			if options.connectWith
				$(options.connectWith)
					.add(this)
					.data('connectWith', options.connectWith)
		

				
			items
				.attr('draggable', 'true')
				.on('dragstart.h5s', (e)->
					if options.handle and !isHandle
						return false

					dt = e.originalEvent.dataTransfer
					dt.effectAllowed = 'move'
					dt.setData('Text', 'dummy')
					index = (dragging = $(e.target or @)).addClass('sortable-dragging').index()
				).on('dragend.h5s', ->
					if !dragging
						return

					isHandle = false
					dragging
						.removeClass('sortable-dragging')
						.show()

					placeholders.detach()
					if index isnt dragging.index()
						holder.trigger('sortupdate', item: dragging)
					
					dragging = null
				).not('a[href], img')
				.on('selectstart.h5s', ->
					@dragDrop?()
					return false
				)
				.end()
				.add([this, placeholder])
				.on 'dragover.h5s dragenter.h5s drop.h5s', (e)->				
					if !items.is(dragging) and options.connectWith isnt $(dragging).parent().data('connectWith')
						return true

					if e.type is 'drop'
						### Handle drops into sub holders or items ###
						if items.is(this) and options.allowNesting and placeholder.parent().is(':not(.sortable-sub-holder)')
							subholder = $(this).find('> .sortable-sub-holder')
							if subholder.length is 0
								$(this).append(subholder = $("<#{holder[0].tagName} class='sortable-sub-holder'>"))

							subholders = subholders.add(subholder)

							### Add dragged element into new/old subholder ###
							subholder.append(dragging)

						else
							### Replace placeholder with dragged element ###
							placeholders
								.filter(':visible')
								.after(dragging)
									
						e.stopPropagation()
						dragging.trigger('dragend.h5s')
						return false

					e.preventDefault()
					e.originalEvent.dataTransfer.dropEffect = 'move'

					if items.is(this)

						### Force the size of the placeholder to the height of the dragged element ###
						if options.forcePlaceholderSize
							placeholder.height(dragging.height())

						### Hide dragged element ###
						dragging.hide()


						### Calculate mouse position relative to hover element ###
						position = 
							x: e.originalEvent.pageX - $(this).offset().left
							y: e.originalEvent.pageY - $(this).offset().top

						### Add element to nested item ###
						if options.allowNesting and position.y > (dragging.outerHeight() * options.tolerance) and position.y < dragging.outerHeight()
							$(this).append(placeholder)
						else if position.y > 0 and position.y < (dragging.outerHeight() * options.tolerance) 
							$(this).before(placeholder);
						else if position.y > (dragging.outerHeight() * ( 1 - options.tolerance * .5 ) ) and position.y < dragging.outerHeight()
							$(this).after(placeholder)

						placeholders
							.not(placeholder)
							.detach()

					else if !placeholders.is(this) and !$(this).children(options.items).length
						placeholders.detach()
						$(this).append(placeholder)

					return false

)(jQuery)