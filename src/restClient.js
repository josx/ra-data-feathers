import {
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_LIST,
  GET_ONE,
  CREATE,
  UPDATE,
  DELETE
} from 'admin-on-rest/lib/rest/types'
import debug from 'debug'

const dbg = debug('aor-feathers-client:rest-client')

function getIdKey({resource, options}) {
  return (options[resource] && options[resource].id) || options.id || 'id'
}

export default (client, options = {}) => {
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
        Object.assign(query, params.filter)
        dbg('query=%o', query)
        return service.find({query})
      case GET_ONE:
        return service.get(params.id)
      case UPDATE:
        return service.update(params.id, params.data)
      case CREATE:
        return service.create(params.data)
      case DELETE:
        return service.remove(params.id)
      default:
        throw new Error(`Unsupported FeathersJS restClient action type ${type}`)
    }
  }

  const mapResponse = (response, type, resource, params) => {
    const idKey = getIdKey({resource, options})
    switch (type) {
      case GET_ONE:
      case UPDATE:
      case DELETE:
        return {data: {...response, id: response[idKey]}}
      case CREATE:
        return {data: {...params.data, id: response[idKey]}}
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
    client.authenticate()
        .then(() => mapRequest(type, resource, params))
        .then(response => mapResponse(response, type, resource, params)
    )
}
