Subset = Backbone.CollectionSubset
Collection = Backbone.Collection
Model = Backbone.Model

describe 'CollectionSubset', ->

  beforeEach ->
    @collection = new Backbone.Collection
    @subcollection = @collection.subcollection()
    @subset = new Subset parent: @collection

  describe 'creating a new subset', ->

    # it 'should require a child in the options', ->
    #   options = child: null, parent: new Collection
    #   expect(new Subset(options)).to.throw Error

    # it 'should require a parent in the options', ->
    #   options = parent: null, child: new Collection
    #   expect(new Subset(options)).to.throw Error

    it 'should take a string of triggers and split them into an array', ->
      options =
        parent: new Collection,
        child: new Collection
        triggers: 'awesome foo bar'

      subset = new Subset(options)
      expect(subset.triggers).to.eql ['awesome','foo','bar']

    it 'should refresh the child', ->
      child = new Collection
      spy = sinon.spy()
      child.on 'refresh', spy
      subset = new Subset(child: child, parent: new Collection)
      expect(spy.called).to.be.true

    it 'should accept a filter in the options', ->
      filter = ->
      options =
        parent: new Collection,
        child: new Collection,
        filter: filter
      subset = new Subset(options)
      expect(subset.filter).to.exist

  describe 'setting the parent', ->

    # it 'should throw an error if the parent is not a collection', ->
    #   options = parent: 12, child: new Collection
    #   expect(new Subset(options)).to.throw

    it 'should remove all events from the parent from the subset so setting the same parent twice does not double up events', ->
      parent = new Collection
      options = parent: parent, child: new Collection
      subset = new Subset(options)
      spy = sinon.spy()
      parent.on 'foo', spy, subset
      subset.setParent(parent)
      parent.trigger 'foo'
      expect(spy.called).to.be.false

  describe 'setting the child', ->

    # it 'should throw an error if the child is not a collection', ->
    #   options = child: 'foo', parent: new Collection
    #   expect(new Subset(options)).to.throw

    it 'should remove all events from the child that the subset had previously created to prevent double events', ->
      child = new Collection
      options = parent: new Collection, child: child
      subset = new Subset(options)
      spy = sinon.spy()
      child.on 'foo', spy, subset
      subset.setChild(child)
      child.trigger 'foo'
      expect(spy.called).to.be.false

  describe 'refreshing the child', ->

    it 'should replace all the models in the child with models from the parent', ->
      subset = @subset
      model = new Model
      subset.parent.add model, {silent:true}
      expect(subset.child.length).to.equal 0
      subset.refresh()
      expect(subset.child.length).to.equal 1

    it 'should only add models to the child if they match the filter', ->
      subset = @subset
      filter = (model)-> model.id is 1
      model1 = new Model({id:1})
      model2 = new Model({id:2})
      subset.setFilter(filter)
      subset.parent.add([model1,model2],{silent:true})
      subset.refresh()
      expect(subset.child.length).to.equal 1

    it 'should fire a "refresh" event on the child', ->
      subset = @subset
      spy = sinon.spy()
      subset.child.on 'refresh', spy
      subset.refresh()
      expect(spy.called).to.equal true

    it 'should fire a "reset" event on the child', ->
      subset = @subset
      spy = sinon.spy()
      subset.child.on 'reset', spy
      subset.refresh()
      expect(spy.called).to.equal true

  describe 'adding models to the child', ->

    describe 'when the parent has the model', ->

      it 'should not add it to the parent', ->
        parent = new Collection
        child = new Collection
        model = new Model
        parent.add(model)
        stub = sinon.stub parent, 'add'
        subset = new Subset(parent:parent,child:child)
        child.add(model)
        expect(stub.called).to.be.false

      it 'should not fire an "add" event on the child', ->
        parent = new Collection
        child = new Collection
        model = new Model
        parent.add(model)
        subset = new Subset(parent:parent,child:child)
        spy = sinon.spy()
        subset.child.on 'add', spy
        child.add(model)
        expect(spy.called).to.be.false

      it 'should replace the childs model with the parents model', ->
        parent = new Collection
        child = new Collection
        model = new Model({id:1})
        model2 = new Model({id:1})
        parent.add(model)
        subset = new Subset(parent:parent,child:child)
        child.add(model2)
        expect(child.get(1)).to.equal model

    describe 'when the parent doesnt have the model', ->

      it 'should add it to the parent', ->
        parent = new Collection
        child = new Collection
        model = new Model
        subset = new Subset(parent:parent,child:child)
        child.add(model)
        expect(parent.length).to.equal 1

      it 'should fire an "add" event on the parent', ->
        parent = new Collection
        child = new Collection
        model = new Model
        spy = sinon.spy()
        parent.on 'add',spy
        subset = new Subset(parent:parent,child:child)
        child.add(model)
        expect(spy.called).to.be.true

      it 'should not try to add the model to the child again', ->
        parent = new Collection
        child = new Collection
        model = new Model
        subset = new Subset(parent:parent,child:child)
        spy = sinon.spy child,'add'
        child.add(model)
        expect(spy.callCount).to.equal 1

  describe 'adding models to the parent', ->

    describe 'when the child already contains the model', ->

      it 'should not replace the childs model if is is the same instance', ->
        parent = new Collection
        child = new Collection
        model = new Model
        child.add(model)
        spy = sinon.spy()
        child.on 'update',spy
        subset = new Subset(parent:parent,child:child)
        parent.add(model)
        expect(spy.called).to.equal false

      it 'should not fire an event on the child', ->
        parent = new Collection
        child = new Collection
        model = new Model
        subset = new Subset(parent:parent,child:child)
        child.add(model)
        spy = sinon.spy()
        child.on 'all',spy
        parent.add(model)
        expect(spy.called).to.equal false

    describe 'when the child already contains a different instance of the model', ->

      it 'should replace the childs model with the parents model if they are different instances and fire an "add" event on the child', ->
        parent = new Collection
        child = new Collection
        model = new Model({id:1})
        model2 = new Model({id:1})
        child.add(model)
        spy = sinon.spy()
        child.on 'add',spy
        subset = new Subset(parent:parent,child:child)
        parent.add(model2)
        expect(child.get(1)).to.equal model2
        expect(spy.called).to.be.true

    describe 'when the child doesnt have the model', ->

      it 'should add the model to the child', ->
        parent = new Collection
        child = new Collection
        model = new Model
        subset = new Subset(parent:parent,child:child)
        parent.add(model)
        expect(child.length).to.equal 1

      it 'should not add the model to the child if doesnt match the filter', ->
        parent = new Collection
        child = new Collection
        model = new Model('foo':'bar')
        filter = (model)-> model.get('foo') is 'baz'
        subset = new Subset(parent:parent,child:child,filter:filter)
        parent.add(model)
        expect(child.length).to.equal 0

  describe 'removing models from the child', ->

    it 'should not remove the models from the parent', ->
      parent = new Collection
      child = new Collection
      model = new Model
      subset = new Subset(parent:parent,child:child)
      child.add(model)
      child.remove(model)
      expect(parent.length).to.equal 1
      expect(child.length).to.equal 0

  describe 'removing models from the parent', ->

    it 'should remove the model from the child', ->
      parent = new Collection
      child = new Collection
      model = new Model
      parent.add(model)
      child.add(model)
      subset = new Subset(parent:parent,child:child)
      parent.remove(model)
      expect(parent.length).to.equal 0
      expect(child.length).to.equal 0

  describe 'when a model changes in the parent', ->

    it 'should not do anything if the changed attribute isnt in the triggers list', ->
      parent = new Collection
      child = new Collection
      model = new Model('foo':'baz')
      filter = (model)-> model.get('foo') is 'bar'
      subset = new Subset(parent:parent,child:child,filter:filter,triggers:'awesome')
      parent.add(model)
      expect(child.length).to.equal 0
      model.set('foo','bar')
      expect(child.length).to.equal 0

    it 'should add the model to the child if it matches the filter and there are no triggers', ->
      parent = new Collection
      child = new Collection
      model = new Model('foo':'baz')
      filter = (model)-> model.get('foo') is 'bar'
      subset = new Subset(parent:parent,child:child,filter:filter)
      parent.add(model)
      expect(child.length).to.equal 0
      model.set('foo','bar')
      expect(child.length).to.equal 1

    it 'should add the model to the child if it matches the filter and a trigger is matched', ->
      parent = new Collection
      child = new Collection
      model = new Model('foo':'baz')
      filter = (model)-> model.get('foo') is 'bar'
      subset = new Subset(parent:parent,child:child,filter:filter,triggers:'foo')
      parent.add(model)
      expect(child.length).to.equal 0
      model.set('foo','bar')
      expect(child.length).to.equal 1

    it 'should remove the model from the child if it doesnt match the filter', ->
      parent = new Collection
      child = new Collection
      model = new Model('foo':'bar')
      filter = (model)-> model.get('foo') is 'bar'
      subset = new Subset(parent:parent,child:child,filter:filter)
      parent.add(model)
      expect(child.length).to.equal 1
      expect(parent.length).to.equal 1
      model.set('foo','baz')
      expect(child.length).to.equal 0
      expect(parent.length).to.equal 1

  describe 'resetting the child', ->

    it 'should add all the models to the parent', ->
      parent = new Collection
      child = new Collection
      model = new Model()
      subset = new Subset(parent:parent,child:child)
      child.reset [model]
      expect(child.length).to.equal 1
      expect(parent.length).to.equal 1

    it 'should replace any child instances with parent instances', ->
      parent = new Collection
      child = new Collection
      model = new Model({id:1})
      model2 = new Model({id:1})
      parent.add(model)
      subset = new Subset(parent:parent,child:child)
      child.reset [model2]
      expect(child.get(1)).to.equal parent.get(1)

    it 'should refresh the child', ->
      parent = new Collection
      child = new Collection
      model = new Model
      subset = new Subset(parent:parent,child:child)
      spy = sinon.spy subset,'refresh'
      child.reset()
      expect(spy.called).to.equal true

    it 'should only call the "reset" event once', ->
      parent = new Collection
      child = new Collection
      model = new Model
      subset = new Subset(parent:parent,child:child)
      spy = sinon.spy()
      child.on 'reset',spy
      child.reset()
      expect(spy.called).to.equal true

  describe 'resetting the parent', ->

    it 'should refresh the child', ->
      parent = new Collection
      child = new Collection
      model = new Model
      subset = new Subset(parent:parent,child:child)
      spy = sinon.spy subset,'refresh'
      parent.reset()
      expect(spy.called).to.equal true

  describe 'when a model is destroyed', ->

    it 'should remove the model from both the parent and child', ->
      parent = new Collection
      child = new Collection
      model = new Model
      subset = new Subset(parent:parent,child:child)
      parent.add(model)
      expect(parent.length).to.equal 1
      expect(child.length).to.equal 1
      model.destroy()
      expect(parent.length).to.equal 0
      expect(child.length).to.equal 0

  describe 'setting the filter', ->

    it 'should not refresh the child', ->
      subset = @subset
      spy = sinon.spy subset,'refresh'
      subset.setFilter(->)
      expect(spy.called).to.be.false

  describe 'when the child is disposed', ->

    it 'should dispose the subset', ->
      @subset.child.trigger('dispose')
      expect(@subset.disposed).to.equal true

  describe 'when the parent is disposed', ->

    it 'should dispose of the subset', ->
      subset = @subset
      parent = subset.parent
      parent.trigger('dispose')
      expect(subset.disposed).to.be.true

    it 'should dispose all of the parents subsets', ->
      parent = new Collection
      subset1 = new Subset(parent:parent,child:new Collection)
      subset2 = new Subset(parent:parent,child:new Collection)
      subset3 = new Subset(parent:parent,child:new Collection)
      parent.trigger('dispose')
      expect(subset1.disposed).to.equal true
      expect(subset2.disposed).to.equal true
      expect(subset2.disposed).to.equal true

  describe 'when the subset is disposed', ->

    it 'should dispose the child', (done) ->
      subset = @subset
      child = subset.child
      child.dispose = done
      subset.dispose()

  describe 'the cascading of models along the tree',->
    grandparent = null
    parent = null
    child = null
    model1 = null
    model2 = null
    model3 = null
    model4 = null
    model5 = null

    beforeEach ->
      grandparent = new Collection
      parent = grandparent.subcollection
        filter: (model)-> model.get('number') < 10
      child = parent.subcollection
        filter: (model)-> model.get('number') < 5
      model1 = new Model(number:20)
      model2 = new Model(number:15)
      model3 = new Model(number:10)
      model4 = new Model(number:5)
      model5 = new Model(number:1)

    it 'should send the model to the bottom of the tree', ->
      grandparent.add(model5)
      expect(parent.length).to.equal 1
      expect(parent.at(0)).to.equal model5
      expect(child.length).to.equal 1
      expect(child.at(0)).to.equal model5

    it 'should send the model to the top of the tree', ->
      child.add(model5)
      expect(parent.length).to.equal 1
      expect(parent.at(0)).to.equal model5
      expect(grandparent.length).to.equal 1
      expect(grandparent.at(0)).to.equal model5

    it 'should not send it to the bottom of the tree if they dont match the filter', ->
      grandparent.add(model4)
      expect(parent.length).to.equal 1
      expect(parent.at(0)).to.equal model4
      expect(child.length).to.equal 0

    it 'should remove models if they dont belong when they are added', ->
      child.add(model1)
      expect(child.length).to.equal 0
      expect(parent.length).to.equal 0
      expect(grandparent.length).to.equal 1

      child.add(model4)
      expect(child.length).to.equal 0
      expect(parent.length).to.equal 1
      expect(grandparent.length).to.equal 2

      child.add(model5)
      expect(child.length).to.equal 1
      expect(parent.length).to.equal 2
      expect(grandparent.length).to.equal 3

    describe 'adding a model to the parent', ->

      it 'should add the model to the child and grandparent',->
        parent.add(model5)
        expect(child.length).to.equal 1
        expect(parent.length).to.equal 1
        expect(grandparent.length).to.equal 1

      it 'should add the model to just the grandparent if it doesnt belong in the child', ->
        parent.add(model4)
        expect(child.length).to.equal 0
        expect(parent.length).to.equal 1
        expect(grandparent.length).to.equal 1

      it 'should remove the model but add it to the grandparent', ->
        parent.add(model1)
        expect(child.length).to.equal 0
        expect(parent.length).to.equal 0
        expect(grandparent.length).to.equal 1

    describe 'using parent siblings', ->
      parent2 = null
      child2 = null

      beforeEach ->
        parent2 = grandparent.subcollection
          filter: (model)-> model.get('number') < 16
        child2 = parent2.subcollection
          filter: (model)-> model.get('number') > 0

      it 'should add models to parent siblings', ->
        child.add(model5)
        expect(child.length).to.equal 1
        expect(parent.length).to.equal 1
        expect(parent2.length).to.equal 1
        expect(grandparent.length).to.equal 1

      it 'should be able to add models to parent siblings but not the parent', ->
        child.add(model2)
        expect(child.length).to.equal 0
        expect(parent.length).to.equal 0
        expect(parent2.length).to.equal 1
        expect(grandparent.length).to.equal 1

      it 'should add models to children of siblings', ->
        parent2.add(model5)
        expect(child.length).to.equal 1
        expect(parent.length).to.equal 1
        expect(parent2.length).to.equal 1
        expect(grandparent.length).to.equal 1

      it 'should add models to children of the parents sibling', ->
        child2.add(model5)
        expect(child.length).to.equal 1
        expect(child2.length).to.equal 1
        expect(parent.length).to.equal 1
        expect(parent2.length).to.equal 1
        expect(grandparent.length).to.equal 1

      it 'should stack filters', ->
        child2.add(model1)
        expect(child.length).to.equal 0
        expect(child2.length).to.equal 0
        expect(parent.length).to.equal 0
        expect(parent2.length).to.equal 0
        expect(grandparent.length).to.equal 1

      it 'should add models to the child of the parents sibling on if they match the filter',->
        child2.add(model4)
        expect(child.length).to.equal 0
        expect(child2.length).to.equal 1
        expect(parent.length).to.equal 1
        expect(parent2.length).to.equal 1
        expect(grandparent.length).to.equal 1

        child2.add(model3)
        expect(child.length).to.equal 0
        expect(child2.length).to.equal 2
        expect(parent.length).to.equal 1
        expect(parent2.length).to.equal 2
        expect(grandparent.length).to.equal 2

        child2.add(model2)
        expect(child.length).to.equal 0
        expect(child2.length).to.equal 3
        expect(parent.length).to.equal 1
        expect(parent2.length).to.equal 3
        expect(grandparent.length).to.equal 3

        child2.add(model1)
        expect(child.length).to.equal 0
        expect(child2.length).to.equal 3
        expect(parent.length).to.equal 1
        expect(parent2.length).to.equal 3
        expect(grandparent.length).to.equal 4

        child2.add(model5)
        expect(child.length).to.equal 1
        expect(child2.length).to.equal 4
        expect(parent.length).to.equal 2
        expect(parent2.length).to.equal 4
        expect(grandparent.length).to.equal 5


