import axios from 'axios';

import { ReposEndpoint } from './endpoints/repo';
import { Context } from './types';

export type { TableMetadata } from './endpoints/table';
export type { Record } from './endpoints/record';
export type { ApiVersion } from './types';

const Version = '0.0.1';

export interface ApiOptions {
  apiKey: string;
  endpoint?: string;
}

/**
 * @example
 * ```ts
 * const api = new Leapcell({
 *  token: 'xxx',
 * endpoint: 'https://api.leapcell.io',
 * });
 * ```
 * @constructor
 * @param {ApiOptions} options
 * @param {string} options.api_key - The api_key to authenticate with
 * @param {string} options.endpoint - The endpoint to connect to
 * @param {ApiVersion} options.apiVersion - The version of the API to use
 */
export class Leapcell {
  #context: Context;
  //TODO: use default?
  constructor(options: ApiOptions) {
    const optionsWithDefaults = {
      endpoint: 'https://api.leapcell.io',
    };
    const theOptions = { ...optionsWithDefaults, ...options };
    this.#context = {
      token: theOptions.apiKey,
      axios: this.#createAxios(theOptions),
    };
  }

  #createAxios(options: ApiOptions) {
    return axios.create({
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'User-Agent': `Leapcell Javascript-Client/${Version}`,
      },
      baseURL: `${options.endpoint}/api/v1`,
      validateStatus: () => true,
    });
  }

  #repos: ReposEndpoint | undefined;
  get repos() {
    return this.#repos || (this.#repos = new ReposEndpoint(this.#context));
  }

  /**
   * @example
   * ```ts
   * const repo =  api.repo('owner', 'repoName')
   * ```
   * @param {string} owner - The owner of the repo
   * @param {string} repoName - The name of the repo
   * @returns {ReposEndpoint}
   * @memberof LeapcellApi
   *
   */
  repo(resource: string) {
    return ReposEndpoint.createInst(this.#context, { resource });
  }
}
