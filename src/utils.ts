import { type AxiosResponse } from 'axios';

export const assertRespValid = (axiosResp: AxiosResponse) => {
  if (axiosResp.status !== 200) {
    const code = axiosResp.data?.code;
    const hint = axiosResp.data?.error;
    if (code && hint) {
      throw Error(
        `invalid response status: ${axiosResp.status}, error code ${code}, hint: ${hint}`
      );
    }
    throw Error(`invalid response status: ${axiosResp.status}`);
  }
  return true;
};
