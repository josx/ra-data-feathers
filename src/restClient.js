import {
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_LIST,
  GET_ONE,
  CREATE,
  UPDATE,
  DELETE,
  DELETE_MANY,
  fetchUtils
} from 'react-admin'
import debug from 'debug'
import diff from 'object-diff'

const dbg = debug('ra-data-feathers:rest-client')

function getIdKey({resource, options}) {
  return (options[resource] && options[resource].id) || options.id || 'id'
}

export default (client, options = {}) => {
  const usePatch = !!options.usePatch;
  const mapRequest = (type, resource, params) => {
    const idKey = getIdKey({resource, options})
    dbg('type=%o, resource=%o, params=%o, idKey=%o', type, resource, params, idKey)
    const service = client.service(resource)
    let query = {}

    switch (type) {
      case GET_MANY:
        let ids = params.ids || []
        query[idKey] = {$in: ids}
        query['$limit'] = ids.length
        return service.find({query})
      case GET_MANY_REFERENCE:
        if(params.target && params.id){
          query[params.target] = params.id
        }
      case GET_LIST:
        const {page, perPage} = params.pagination || {}
        const {field, order} = params.sort || {}
        const sortKey = `$sort[${field === 'id' ? idKey : field}]`
        dbg('field=%o, sort-key=%o', field, sortKey)
        let sortVal = order === 'DESC' ? -1 : 1
        if (perPage && page) {
          query['$limit'] = perPage
          query['$skip'] = perPage * (page - 1)
        }
        if (order) {
          query[sortKey] = JSON.stringify(sortVal)
        }
        Object.assign(query, fetchUtils.flattenObject(params.filter));
        dbg('query=%o', query)
        return service.find({query})
      case GET_ONE:
        return service.get(params.id)
      case UPDATE:
        if (usePatch) {
          const data = params.previousData ? diff(params.previousData, params.data) : params.data
          return service.patch(params.id, data)
        }
        return service.update(params.id, params.data)
      case CREATE:
        return service.create(params.data)
      case DELETE:
        return service.remove(params.id)
      case DELETE_MANY:
        return Promise.all(params.ids.map(id => (service.remove(id) )));
      default:
        return Promise.reject(`Unsupported FeathersJS restClient action type ${type}`);
    }
  }

  const mapResponse = (response, type, resource, params) => {
    const idKey = getIdKey({resource, options})
    switch (type) {
      case GET_ONE:
      case UPDATE:
      case DELETE:
        return {data: {...response, id: response[idKey]}}
      case DELETE_MANY:
        return {data: response.map(record => record[idKey])}
      case CREATE:
        return {data: { ...params.data, ...response, id: response[idKey]}}
      case GET_MANY_REFERENCE: // fix GET_MANY_REFERENCE missing id
      case GET_MANY: // fix GET_MANY missing id
      case GET_LIST:
        response.data = response.data.map(item => {
          if (idKey !== 'id') {
            item.id = item[idKey]
          }
          return item
        })
        return response
      default:
        return response
    }
  }

  return (type, resource, params) =>
    mapRequest(type, resource, params)
      .then(response => mapResponse(response, type, resource, params))
}
