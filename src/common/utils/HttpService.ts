import axios from 'axios';
import { GenericObjectType } from '../interfaces';

export interface IAxiosHelperResponse {
  data;
  status: number;
}

export class HttpService {
  /**
   * helps send a post request with the help of axios
   * @param  {string} path
   * @param  {GenericObjectType} data
   * @param  {GenericObjectType} headers
   */
  static async sendPostRequest(
    data: GenericObjectType,
    path: string,
    headers?: GenericObjectType,
  ): Promise<IAxiosHelperResponse> {
    const response = await axios.post(path, data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    return {
      data: response.data,
      status: response.status,
    };
  }

  /**
   * helps send a post request with the help of axios
   * @param  {string} path
   * @param  {GenericObjectType} headers
   */
  static async sendGetRequest(
    path: string,
    headers?: GenericObjectType,
  ): Promise<IAxiosHelperResponse> {
    const response = await axios.get(path, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    return {
      data: response.data,
      status: response.status,
    };
  }
}
