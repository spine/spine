# Mimics Spine.Ajax.Collection and provides ajax functions on has_many relations
class HasManyAjaxCollection extends Spine.Ajax.Base

  # sets the instance vars
  constructor: (@relation) ->

  # straight copy from Spine.Ajax.Collection
  find: (id, params, options = {}) ->
    record = new @relation.model(id: id)
    @ajaxQueue(
      params,
      type: 'GET',
      url: options.url or Spine.Ajax.getURL(record)
    ).done(@_recordsResponse)
     .fail(@_failResponse)

  # straight copy from Spine.Ajax.Collection
  all: (params, options = {}) ->
    @ajaxQueue(
      params,
      type: 'GET',
      url: options.url or Spine.Ajax.getURL(@relation)
    ).done(@_recordsResponse)
     .fail(@_failResponse)

  # straight copy from Spine.Ajax.Collection
  fetch: (params = {}, options = {}) ->
    if id = params.id
      delete params.id
      @find(id, params, options).done (record) =>
        @relation.refresh(record, options)
    else
      @all(params, options).done (records) =>
        @relation.refresh(records, options)

  # Private

  # straight copy from Spine.Ajax.Collection
  _recordsResponse: (data, status, xhr) =>
    @relation.model.trigger('ajaxSuccess', null, status, xhr)

  # straight copy from Spine.Ajax.Collection
  _failResponse: (xhr, statusText, error) =>
    @relation.model.trigger('ajaxError', null, xhr, statusText, error)

# Patch Spine.Collection (relation) to include Ajax support
Spine.Collection.include

  # give has_many collections an #ajax method for accessing remote resources
  ajax: -> new HasManyAjaxCollection(this)

  # add #fetch method to instances
  fetch: (params) -> @ajax().fetch(arguments...)

  # generate the nested resource url
  url: (args...) -> @record.url(@name, args...)
