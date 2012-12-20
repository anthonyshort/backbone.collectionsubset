# Backbone.CollectionSubset
# https://github.com/anthonyshort/backbone.collectionsubset
#
# Copyright (c) 2012 Anthony Short
# Licensed under the MIT license.

# This allows you to create a subset of a collection based
# on a filter function. This new collection will stay in sync
# with the main collection. When a model is added to the main
# collection it will automatically be added to the child collection
# if it matches a filter.
#
# Triggers can be set that will allow the child collection to
# only update when particular attributes are changed. This should
# be set for every subset.
#
# The subset will be autoamtically disposed when either the parent
# or the child collection is disposed. If the parent collection is
# disposed of then the child collection will also be disposed of.

class Backbone.CollectionSubset

  # Borrow the extend method
  @extend: Backbone.Model.extend
  _.extend @::, Backbone.Events

  constructor: (options = {})->
    options = _.defaults options,
      refresh: true
      triggers: null
      filter: -> true
      name: null
      child: null
      parent: null
    @triggers = if options.triggers then options.triggers.split(' ') else []
    options.child = new options.parent.constructor unless options.child
    @setParent(options.parent)
    @setChild(options.child)
    @setFilter(options.filter)
    @child.model = options.model if options.model
    @refresh() if options.refresh
    @name = options.name

  # Set the parent collection. This attached a number of
  # event handlers to the collection. It also removed any
  # event handlers that this collection may have already
  # added to the parent.
  setParent: (collection) ->
    @parent?.off(null,null,@)
    @parent = collection
    @parent.on 'add', @_onParentAdd, @
    @parent.on 'remove', @_onParentRemove, @
    @parent.on 'reset', @_onParentReset, @
    @parent.on 'change', @_onParentChange, @
    @parent.on 'dispose', @dispose, @
    @parent.on 'loading', (=> @child.trigger('loading')), @
    @parent.on 'ready', (=> @child.trigger('ready')), @

  # Set the child collection. This attached a number of event
  # handlers to the child and removed any events that were
  # previously created by this subset. It is possible to access
  # the subset from the child collection via .filterer and the parent
  # collection via .parent. The child URL is automatically set
  # to the parents URL as with the model.
  setChild: (collection) ->
    @child?.off(null,null,@)
    @child = collection
    @child.on 'add', @_onChildAdd, @
    @child.on 'reset', @_onChildReset, @
    @child.on 'dispose', @dispose, @
    @child.superset = @parent
    @child.filterer = @
    @child.url = @parent.url
    @child.model = @parent.model

  # This method must be called to set the filter. It binds the method
  # to the correct context and fires off any parent filters. This allows you
  # to have subsets of subsets.
  setFilter: (fn)->
    filter = (model)->
      matchesFilter = fn.call @,model
      matchesParentFilter = if @parent.filterer then @parent.filterer.filter(model) else true
      return matchesFilter and matchesParentFilter
    @filter = _.bind(filter, @)

  # Reset the child collection completely with matching models
  # from the parent collection and trigger an event.
  refresh: (options = {})->
    models = @parent.filter(@filter)
    @child.reset(models,{subset:this})
    @child.trigger 'refresh'

  # Replaces a model object on the child with the model object
  # from the parent. This means they are always using the same
  # object for models.
  _replaceChildModel: (parentModel)->
    childModel = @_getByCid(@child, parentModel.cid)
    return if childModel is parentModel
    if _.isUndefined(childModel)
      @child.add(parentModel,subset:this)
    else
      index = @child.indexOf(childModel)
      @child.remove(childModel)
      @child.add(parentModel,{at:index,subset:this})

  # When a model is added to the parent collection
  # Add it to the child if it matches the filter.
  _onParentAdd: (model,collection,options)->
    return if options && options.subset is this
    if @filter(model)
      @_replaceChildModel(model)

  # When a model is removed from the parent
  # remove it from the child
  _onParentRemove: (model,collection,options)->
    @child.remove(model,options)

  # When the parent is reset refrehs the child
  _onParentReset: (collection,options)->
    @refresh()

  # When a model changes in the parent, check to see
  # if the attribute changed was one of the triggers.
  # if so, then add or remove from to the child
  _onParentChange: (model,changes)->
    return unless @triggerMatched(model)
    if @filter(model)
      @child.add(model)
    else
      @child.remove(model)

  # When a model is added to the child
  # If the parent has the model replace the one just added to the child
  _onChildAdd: (model,collection,options)->
    return if options && options.subset is this
    @parent.add(model)
    parentModel = @_getByCid(@parent, model.cid)
    return unless parentModel
    if @filter(parentModel)
      @_replaceChildModel(parentModel)
    else
      @child.remove(model)

  # After the child fetches we need to get all the models
  # from the child, add them to the parent, and then
  # reset the child with the models from the parent
  # so they use the same model references
  _onChildReset: (collection,options)->
    return if options && options.subset is this
    @parent.add(@child.models)
    @refresh()

  # Get a model by it's cid. Backbone 0.9.9 removes getByCid as
  # get now handles cid transparently.
  _getByCid: (model, cid) ->
    fn = model.getByCid || model.get
    fn.apply(model, [cid])

  # Determine if a trigger attribute was changed
  triggerMatched: (model)->
    return true if @triggers.length is 0
    return false unless model.hasChanged()
    changedAttrs = _.keys(model.changedAttributes())
    _.intersection(@triggers,changedAttrs).length > 0

  # Remove all event handlers for the subset from both the
  # parent and the child. Remove the child collection.
  dispose: ->
    return if @disposed
    @trigger 'dispose', this
    @parent.off null,null,@
    @child.off null,null,@
    @child.dispose?()
    @off()
    delete this[prop] for prop in ['parent','child','options']
    @disposed = true

Backbone.Collection::subcollection = (options = {}) ->
  _.defaults options,
    child: new this.constructor
    parent: this
  subset = new Backbone.CollectionSubset(options)
  subset.child

module?.exports = Backbone.CollectionSubset
