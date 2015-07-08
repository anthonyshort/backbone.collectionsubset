var Collection, Model, Subset;

Subset = Backbone.CollectionSubset;

Collection = Backbone.Collection;

Model = Backbone.Model;

describe('CollectionSubset', function() {
  beforeEach(function() {
    this.collection = new Backbone.Collection;
    this.subcollection = this.collection.subcollection();
    return this.subset = new Subset({
      parent: this.collection
    });
  });
  describe('creating a new subset', function() {
    it('should take a string of triggers and split them into an array', function() {
      var options, subset;
      options = {
        parent: new Collection,
        child: new Collection,
        triggers: 'awesome foo bar'
      };
      subset = new Subset(options);
      return expect(subset.triggers).to.eql(['awesome', 'foo', 'bar']);
    });
    it('should refresh the child', function() {
      var child, spy, subset;
      child = new Collection;
      spy = sinon.spy();
      child.on('refresh', spy);
      subset = new Subset({
        child: child,
        parent: new Collection
      });
      return expect(spy.called).to.be["true"];
    });
    it('should accept a filter in the options', function() {
      var filter, options, subset;
      filter = function() {};
      options = {
        parent: new Collection,
        child: new Collection,
        filter: filter
      };
      subset = new Subset(options);
      return expect(subset.filter).to.exist;
    });
    return it('should not remove models from child if refresh false', function() {
      var child, model, options, parent, subset;
      model = new Model;
      parent = new Collection;
      child = new Collection;
      child.add(model);
      options = {
        parent: parent,
        child: child,
        refresh: false
      };
      subset = new Subset(options);
      return expect(child.length).to.equal(1);
    });
  });
  describe('setting the parent', function() {
    return it('should remove all events from the parent from the subset so setting the same parent twice does not double up events', function() {
      var options, parent, spy, subset;
      parent = new Collection;
      options = {
        parent: parent,
        child: new Collection
      };
      subset = new Subset(options);
      spy = sinon.spy();
      parent.on('foo', spy, subset);
      subset.setParent(parent);
      parent.trigger('foo');
      return expect(spy.called).to.be["false"];
    });
  });
  describe('setting the child', function() {
    return it('should remove all events from the child that the subset had previously created to prevent double events', function() {
      var child, options, spy, subset;
      child = new Collection;
      options = {
        parent: new Collection,
        child: child
      };
      subset = new Subset(options);
      spy = sinon.spy();
      child.on('foo', spy, subset);
      subset.setChild(child);
      child.trigger('foo');
      return expect(spy.called).to.be["false"];
    });
  });
  describe('refreshing the child', function() {
    it('should replace all the models in the child with models from the parent', function() {
      var model, subset;
      subset = this.subset;
      model = new Model;
      subset.parent.add(model, {
        silent: true
      });
      expect(subset.child.length).to.equal(0);
      subset.refresh();
      return expect(subset.child.length).to.equal(1);
    });
    it('should only add models to the child if they match the filter', function() {
      var filter, model1, model2, subset;
      subset = this.subset;
      filter = function(model) {
        return model.id === 1;
      };
      model1 = new Model({
        id: 1
      });
      model2 = new Model({
        id: 2
      });
      subset.setFilter(filter);
      subset.parent.add([model1, model2], {
        silent: true
      });
      subset.refresh();
      return expect(subset.child.length).to.equal(1);
    });
    it('should fire a "refresh" event on the child', function() {
      var spy, subset;
      subset = this.subset;
      spy = sinon.spy();
      subset.child.on('refresh', spy);
      subset.refresh();
      return expect(spy.called).to.equal(true);
    });
    return it('should fire a "reset" event on the child', function() {
      var spy, subset;
      subset = this.subset;
      spy = sinon.spy();
      subset.child.on('reset', spy);
      subset.refresh();
      return expect(spy.called).to.equal(true);
    });
  });
  describe('adding models to the child', function() {
    describe('when the parent has the model', function() {
      it('should not add it to the parent', function() {
        var child, model, parent, stub, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model;
        parent.add(model);
        stub = sinon.stub(parent, 'add');
        subset = new Subset({
          parent: parent,
          child: child
        });
        child.add(model);
        return expect(stub.called).to.be["false"];
      });
      it('should not fire an "add" event on the child', function() {
        var child, model, parent, spy, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model;
        parent.add(model);
        subset = new Subset({
          parent: parent,
          child: child
        });
        spy = sinon.spy();
        subset.child.on('add', spy);
        child.add(model);
        return expect(spy.called).to.be["false"];
      });
      return it('should replace the childs model with the parents model', function() {
        var child, model, model2, parent, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model({
          id: 1
        });
        model2 = new Model({
          id: 1
        });
        parent.add(model);
        subset = new Subset({
          parent: parent,
          child: child
        });
        child.add(model2);
        return expect(child.get(1)).to.equal(model);
      });
    });
    return describe('when the parent doesnt have the model', function() {
      it('should add it to the parent', function() {
        var child, model, parent, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model;
        subset = new Subset({
          parent: parent,
          child: child
        });
        child.add(model);
        return expect(parent.length).to.equal(1);
      });
      it('should fire an "add" event on the parent', function() {
        var child, model, parent, spy, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model;
        spy = sinon.spy();
        parent.on('add', spy);
        subset = new Subset({
          parent: parent,
          child: child
        });
        child.add(model);
        return expect(spy.called).to.be["true"];
      });
      return it('should not try to add the model to the child again', function() {
        var child, model, parent, spy, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model;
        subset = new Subset({
          parent: parent,
          child: child
        });
        spy = sinon.spy(child, 'add');
        child.add(model);
        return expect(spy.callCount).to.equal(1);
      });
    });
  });
  describe('adding models to the parent', function() {
    describe('when the child already contains the model', function() {
      it('should not replace the childs model if is is the same instance', function() {
        var child, model, parent, spy, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model;
        child.add(model);
        spy = sinon.spy();
        child.on('update', spy);
        subset = new Subset({
          parent: parent,
          child: child,
          refresh: false
        });
        parent.add(model);
        return expect(spy.called).to.equal(false);
      });
      return it('should not fire an event on the child', function() {
        var child, model, parent, spy, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model;
        subset = new Subset({
          parent: parent,
          child: child
        });
        child.add(model);
        spy = sinon.spy();
        child.on('all', spy);
        parent.add(model);
        return expect(spy.called).to.equal(false);
      });
    });
    describe('when the child already contains a different instance of the model', function() {
      return it('should replace the childs model with the parents model if they are different instances and fire an "add" event on the child', function() {
        var child, model, model2, parent, spy, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model({
          id: 1
        });
        model2 = new Model({
          id: 1
        });
        child.add(model);
        spy = sinon.spy();
        child.on('add', spy);
        subset = new Subset({
          parent: parent,
          child: child
        });
        parent.add(model2);
        expect(child.get(1)).to.equal(model2);
        return expect(spy.called).to.be["true"];
      });
    });
    return describe('when the child doesnt have the model', function() {
      it('should add the model to the child', function() {
        var child, model, parent, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model;
        subset = new Subset({
          parent: parent,
          child: child
        });
        parent.add(model);
        return expect(child.length).to.equal(1);
      });
      return it('should not add the model to the child if doesnt match the filter', function() {
        var child, filter, model, parent, subset;
        parent = new Collection;
        child = new Collection;
        model = new Model({
          'foo': 'bar'
        });
        filter = function(model) {
          return model.get('foo') === 'baz';
        };
        subset = new Subset({
          parent: parent,
          child: child,
          filter: filter
        });
        parent.add(model);
        return expect(child.length).to.equal(0);
      });
    });
  });
  describe('removing models from the child', function() {
    return it('should not remove the models from the parent', function() {
      var child, model, parent, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model;
      subset = new Subset({
        parent: parent,
        child: child
      });
      child.add(model);
      child.remove(model);
      expect(parent.length).to.equal(1);
      return expect(child.length).to.equal(0);
    });
  });
  describe('removing models from the parent', function() {
    return it('should remove the model from the child', function() {
      var child, model, parent, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model;
      parent.add(model);
      child.add(model);
      subset = new Subset({
        parent: parent,
        child: child
      });
      parent.remove(model);
      expect(parent.length).to.equal(0);
      return expect(child.length).to.equal(0);
    });
  });
  describe('when a model changes in the parent', function() {
    it('should not do anything if the changed attribute isnt in the triggers list', function() {
      var child, filter, model, parent, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model({
        'foo': 'baz'
      });
      filter = function(model) {
        return model.get('foo') === 'bar';
      };
      subset = new Subset({
        parent: parent,
        child: child,
        filter: filter,
        triggers: 'awesome'
      });
      parent.add(model);
      expect(child.length).to.equal(0);
      model.set('foo', 'bar');
      return expect(child.length).to.equal(0);
    });
    it('should add the model to the child if it matches the filter and there are no triggers', function() {
      var child, filter, model, parent, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model({
        'foo': 'baz'
      });
      filter = function(model) {
        return model.get('foo') === 'bar';
      };
      subset = new Subset({
        parent: parent,
        child: child,
        filter: filter
      });
      parent.add(model);
      expect(child.length).to.equal(0);
      model.set('foo', 'bar');
      return expect(child.length).to.equal(1);
    });
    it('should add the model to the child if it matches the filter and a trigger is matched', function() {
      var child, filter, model, parent, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model({
        'foo': 'baz'
      });
      filter = function(model) {
        return model.get('foo') === 'bar';
      };
      subset = new Subset({
        parent: parent,
        child: child,
        filter: filter,
        triggers: 'foo'
      });
      parent.add(model);
      expect(child.length).to.equal(0);
      model.set('foo', 'bar');
      return expect(child.length).to.equal(1);
    });
    return it('should remove the model from the child if it doesnt match the filter', function() {
      var child, filter, model, parent, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model({
        'foo': 'bar'
      });
      filter = function(model) {
        return model.get('foo') === 'bar';
      };
      subset = new Subset({
        parent: parent,
        child: child,
        filter: filter
      });
      parent.add(model);
      expect(child.length).to.equal(1);
      expect(parent.length).to.equal(1);
      model.set('foo', 'baz');
      expect(child.length).to.equal(0);
      return expect(parent.length).to.equal(1);
    });
  });
  describe('resetting the child', function() {
    it('should add all the models to the parent', function() {
      var child, model, parent, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model();
      subset = new Subset({
        parent: parent,
        child: child
      });
      child.reset([model]);
      expect(child.length).to.equal(1);
      return expect(parent.length).to.equal(1);
    });
    it('should replace any child instances with parent instances', function() {
      var child, model, model2, parent, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model({
        id: 1
      });
      model2 = new Model({
        id: 1
      });
      parent.add(model);
      subset = new Subset({
        parent: parent,
        child: child
      });
      child.reset([model2]);
      return expect(child.get(1)).to.equal(parent.get(1));
    });
    it('should refresh the child', function() {
      var child, model, parent, spy, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model;
      subset = new Subset({
        parent: parent,
        child: child
      });
      spy = sinon.spy(subset, 'refresh');
      child.reset();
      return expect(spy.called).to.equal(true);
    });
    return it('should only call the "reset" event once', function() {
      var child, model, parent, spy, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model;
      subset = new Subset({
        parent: parent,
        child: child
      });
      spy = sinon.spy();
      child.on('reset', spy);
      child.reset();
      return expect(spy.called).to.equal(true);
    });
  });
  describe('resetting the parent', function() {
    return it('should refresh the child', function() {
      var child, model, parent, spy, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model;
      subset = new Subset({
        parent: parent,
        child: child
      });
      spy = sinon.spy(subset, 'refresh');
      parent.reset();
      return expect(spy.called).to.equal(true);
    });
  });
  describe('when a model is destroyed', function() {
    return it('should remove the model from both the parent and child', function() {
      var child, model, parent, subset;
      parent = new Collection;
      child = new Collection;
      model = new Model;
      subset = new Subset({
        parent: parent,
        child: child
      });
      parent.add(model);
      expect(parent.length).to.equal(1);
      expect(child.length).to.equal(1);
      model.destroy();
      expect(parent.length).to.equal(0);
      return expect(child.length).to.equal(0);
    });
  });
  describe('setting the filter', function() {
    return it('should not refresh the child', function() {
      var spy, subset;
      subset = this.subset;
      spy = sinon.spy(subset, 'refresh');
      subset.setFilter(function() {});
      return expect(spy.called).to.be["false"];
    });
  });
  describe('when the child is disposed', function() {
    return it('should dispose the subset', function() {
      this.subset.child.trigger('dispose');
      return expect(this.subset.disposed).to.equal(true);
    });
  });
  describe('when the parent is disposed', function() {
    it('should dispose of the subset', function() {
      var parent, subset;
      subset = this.subset;
      parent = subset.parent;
      parent.trigger('dispose');
      return expect(subset.disposed).to.be["true"];
    });
    return it('should dispose all of the parents subsets', function() {
      var parent, subset1, subset2, subset3;
      parent = new Collection;
      subset1 = new Subset({
        parent: parent,
        child: new Collection
      });
      subset2 = new Subset({
        parent: parent,
        child: new Collection
      });
      subset3 = new Subset({
        parent: parent,
        child: new Collection
      });
      parent.trigger('dispose');
      expect(subset1.disposed).to.equal(true);
      expect(subset2.disposed).to.equal(true);
      return expect(subset2.disposed).to.equal(true);
    });
  });
  describe('when the subset is disposed', function() {
    return it('should dispose the child', function(done) {
      var child, subset;
      subset = this.subset;
      child = subset.child;
      child.dispose = done;
      return subset.dispose();
    });
  });
  describe('the cascading of models along the tree', function() {
    var child, grandparent, model1, model2, model3, model4, model5, parent;
    grandparent = null;
    parent = null;
    child = null;
    model1 = null;
    model2 = null;
    model3 = null;
    model4 = null;
    model5 = null;
    beforeEach(function() {
      grandparent = new Collection;
      parent = grandparent.subcollection({
        filter: function(model) {
          return model.get('number') < 10;
        }
      });
      child = parent.subcollection({
        filter: function(model) {
          return model.get('number') < 5;
        }
      });
      model1 = new Model({
        number: 20
      });
      model2 = new Model({
        number: 15
      });
      model3 = new Model({
        number: 10
      });
      model4 = new Model({
        number: 5
      });
      return model5 = new Model({
        number: 1
      });
    });
    it('should send the model to the bottom of the tree', function() {
      grandparent.add(model5);
      expect(parent.length).to.equal(1);
      expect(parent.at(0)).to.equal(model5);
      expect(child.length).to.equal(1);
      return expect(child.at(0)).to.equal(model5);
    });
    it('should send the model to the top of the tree', function() {
      child.add(model5);
      expect(parent.length).to.equal(1);
      expect(parent.at(0)).to.equal(model5);
      expect(grandparent.length).to.equal(1);
      return expect(grandparent.at(0)).to.equal(model5);
    });
    it('should not send it to the bottom of the tree if they dont match the filter', function() {
      grandparent.add(model4);
      expect(parent.length).to.equal(1);
      expect(parent.at(0)).to.equal(model4);
      return expect(child.length).to.equal(0);
    });
    it('should remove models if they dont belong when they are added', function() {
      child.add(model1);
      expect(child.length).to.equal(0);
      expect(parent.length).to.equal(0);
      expect(grandparent.length).to.equal(1);
      child.add(model4);
      expect(child.length).to.equal(0);
      expect(parent.length).to.equal(1);
      expect(grandparent.length).to.equal(2);
      child.add(model5);
      expect(child.length).to.equal(1);
      expect(parent.length).to.equal(2);
      return expect(grandparent.length).to.equal(3);
    });
    describe('adding a model to the parent', function() {
      it('should add the model to the child and grandparent', function() {
        parent.add(model5);
        expect(child.length).to.equal(1);
        expect(parent.length).to.equal(1);
        return expect(grandparent.length).to.equal(1);
      });
      it('should add the model to just the grandparent if it doesnt belong in the child', function() {
        parent.add(model4);
        expect(child.length).to.equal(0);
        expect(parent.length).to.equal(1);
        return expect(grandparent.length).to.equal(1);
      });
      return it('should remove the model but add it to the grandparent', function() {
        parent.add(model1);
        expect(child.length).to.equal(0);
        expect(parent.length).to.equal(0);
        return expect(grandparent.length).to.equal(1);
      });
    });
    return describe('using parent siblings', function() {
      var child2, parent2;
      parent2 = null;
      child2 = null;
      beforeEach(function() {
        parent2 = grandparent.subcollection({
          filter: function(model) {
            return model.get('number') < 16;
          }
        });
        return child2 = parent2.subcollection({
          filter: function(model) {
            return model.get('number') > 0;
          }
        });
      });
      it('should add models to parent siblings', function() {
        child.add(model5);
        expect(child.length).to.equal(1);
        expect(parent.length).to.equal(1);
        expect(parent2.length).to.equal(1);
        return expect(grandparent.length).to.equal(1);
      });
      it('should be able to add models to parent siblings but not the parent', function() {
        child.add(model2);
        expect(child.length).to.equal(0);
        expect(parent.length).to.equal(0);
        expect(parent2.length).to.equal(1);
        return expect(grandparent.length).to.equal(1);
      });
      it('should add models to children of siblings', function() {
        parent2.add(model5);
        expect(child.length).to.equal(1);
        expect(parent.length).to.equal(1);
        expect(parent2.length).to.equal(1);
        return expect(grandparent.length).to.equal(1);
      });
      it('should add models to children of the parents sibling', function() {
        child2.add(model5);
        expect(child.length).to.equal(1);
        expect(child2.length).to.equal(1);
        expect(parent.length).to.equal(1);
        expect(parent2.length).to.equal(1);
        return expect(grandparent.length).to.equal(1);
      });
      it('should stack filters', function() {
        child2.add(model1);
        expect(child.length).to.equal(0);
        expect(child2.length).to.equal(0);
        expect(parent.length).to.equal(0);
        expect(parent2.length).to.equal(0);
        return expect(grandparent.length).to.equal(1);
      });
      return it('should add models to the child of the parents sibling on if they match the filter', function() {
        child2.add(model4);
        expect(child.length).to.equal(0);
        expect(child2.length).to.equal(1);
        expect(parent.length).to.equal(1);
        expect(parent2.length).to.equal(1);
        expect(grandparent.length).to.equal(1);
        child2.add(model3);
        expect(child.length).to.equal(0);
        expect(child2.length).to.equal(2);
        expect(parent.length).to.equal(1);
        expect(parent2.length).to.equal(2);
        expect(grandparent.length).to.equal(2);
        child2.add(model2);
        expect(child.length).to.equal(0);
        expect(child2.length).to.equal(3);
        expect(parent.length).to.equal(1);
        expect(parent2.length).to.equal(3);
        expect(grandparent.length).to.equal(3);
        child2.add(model1);
        expect(child.length).to.equal(0);
        expect(child2.length).to.equal(3);
        expect(parent.length).to.equal(1);
        expect(parent2.length).to.equal(3);
        expect(grandparent.length).to.equal(4);
        child2.add(model5);
        expect(child.length).to.equal(1);
        expect(child2.length).to.equal(4);
        expect(parent.length).to.equal(2);
        expect(parent2.length).to.equal(4);
        return expect(grandparent.length).to.equal(5);
      });
    });
  });
  return describe('updating model', function() {
    return it('should remove model from child collection', function() {
      var child, filter, model, parent, subset;
      filter = function() {
        return model.get('prop') === 'val';
      };
      parent = new Collection;
      child = new Collection;
      model = new Model({
        id: 1
      });
      parent.add(model);
      model.on('remove', function(model, collection, options) {
        return expect(collection).to.equal(child);
      });
      subset = new Subset({
        parent: parent,
        child: child,
        filter: filter
      });
      expect(child.length).to.equal(0);
      model.set({
        prop: 'val'
      });
      expect(child.length).to.equal(1);
      return model.set({
        prop: null
      });
    });
  });
});
