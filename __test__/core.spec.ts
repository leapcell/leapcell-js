import { beforeEach, describe, it, expect, beforeAll, afterAll } from 'vitest';

import { Leapcell } from '../src';

import axios from 'axios';

let api: Leapcell;

beforeEach(() => {
  api = new Leapcell({
    apiKey: 'lpcl_1026202452.9511f3e1fa009cf0ae6ff70b2be47bcc',
    endpoint: 'http://localhost:3000',
  });
});

describe('table crud', () => {
  it('api has been created successfully', () => {
    expect(api).toBeTruthy();
  });

  let table: ReturnType<ReturnType<Leapcell['repo']>['table']>;
  it('get field', async () => {
    table = api.repo('salamer/myblog').table('tbl1702369503563026432', 'name');
    console.log('data', await table.meta());
  });
});

describe('core', () => {
  it('api has been created successfully', () => {
    expect(api).toBeTruthy();
  });

  let table: ReturnType<ReturnType<Leapcell['repo']>['table']>;
  beforeAll(() => {
    table = api.repo('salamer/myblog').table('tbl1702369503563026432', 'name');
  });

  it('get all', async () => {
    const records = await table.records.findMany({});
    console.log('record', records);
    const record = await table.records.findById('4b483376-04e6-463d-a83d-80e7d688943b');
    console.log('record', record);
  });

  it('find', async () => {
    const record = await table.records.findById('2bc243ee-7e77-4f5e-b5b2-2da9d70c6779');
    console.log('record', record);

    const records = await table.records.findMany({
      where: {
        name: {
          eq: 'GGG',
        },
      },
    });
    console.log('records', records);

    const records2 = await table.records.findMany({
      where: {
        name: {
          eq: 'GGG',
        },
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        offset: 0,
        limit: 10,
      },
    });
    console.log('records', records2);

    const records3 = await table.records.findMany({
      where: {
        name: {
          eq: 'GGG',
        },
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        offset: 0,
        limit: 10,
      },
    });
    console.log('records', records3);

    const count = await table.records.count();
    console.log('count', count);

    const count2 = await table.records.count({
      where: {
        name: {
          eq: 'GGG',
        },
      },
    });
    console.log('count', count2);
  });

  it('create', async () => {
    const record = await table.records.create({
      name: 'BB',
    });
    console.log('record', record);
    const records = await table.records.createMany([
      {
        name: 'BB',
      },
      {
        name: 'GGG',
      },
    ]);
    console.log('records', records);
  });

  it('update', async () => {
    const record = await table.records.updateById({
      id: '7ba4d5f1-8c85-4155-8deb-6d7ad88977f3',
      data: { name: 'BB' },
    });
    console.log('records', record);

    const records = await table.records.updateMany({
      where: {
        name: {
          eq: 'BB',
        },
      },
      data: {
        name: 'AA',
      },
    });
    console.log('records', records);
  });

  it('delete', async () => {
    const record = await table.records.deleteById('7ba4d5f1-8c85-4155-8deb-6d7ad88977f3');
    console.log('records', record);

    const records = await table.records.deleteMany({
      where: {
        name: {
          neq: '',
        },
      },
    });
    console.log('records', records);
  });

  it('upload image', async () => {
    const image = await axios.get(
      'https://leapcell-dev-bucket.s3.amazonaws.com/920417ee6a70435084fe6b40d58dad4e.jpeg',
      {
        responseType: 'arraybuffer',
      }
    );
    const imageItem = await table.file.upload(image.data);
    console.log('imageItem', imageItem);
  });
});
