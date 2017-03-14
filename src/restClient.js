import {
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_LIST,
  GET_ONE,
  CREATE,
  UPDATE,
  DELETE,
} from 'admin-on-rest';

export default client => {
  const mapRequest = (type, resource, params) => {
    const service = client.service(resource);
    let query = {};

    switch (type) {
      case GET_MANY:
      case GET_MANY_REFERENCE:
      case GET_LIST:
        const {page, perPage} = params.pagination || {};
        const {field, order} = params.sort || {};

        let sortKey = '$sort[' + field + ']';
        let sortVal = (order === 'DESC') ? -1 : 1;
        if (perPage && page) {
          query['$limit'] = perPage;
          query['$skip'] = perPage * (page - 1);
        }
        if (order) {
          query[sortKey] = JSON.stringify(sortVal);
        }
        Object.assign(query, params.filter);
        return service.find({ query });
      case GET_ONE:
        return service.get(params.id);
      case UPDATE:
        return service.update(params.id, params.data);
      case CREATE:
        return service.create(params.data);
      case DELETE:
        return service.remove(params.id);
      default:
        throw new Error(`Unsupported FeathersJS restClient action type ${type}`);
    }
  };

  const mapResponse = (response, type, resource, params) => {
    switch (type) {
      case GET_ONE:
      case UPDATE:
        return { data: response };
      case CREATE:
        return { data: {...params.data, id: response.id} };
      default:
        return response;
    }
  };

  return (type, resource, params) =>
    mapRequest(type, resource, params)
      .then(response => mapResponse(response, type, resource, params));
}
