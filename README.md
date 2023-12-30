# JavaScript Client

## Installation

The SDK supports both JavaScript and TypeScript, and you can install it using npm.

```bash
npm install @leapcell/leapcell-js@latest
```

## Usage

### Preparation

Leapcell uses an `API Token` to access the Leapcell API. You can learn more about the API Token [here](https://docs.leapcell.com/api/overview#authentication).

### Init Client

You can place the API Token in the environment variable or pass it directly.

`REPO_NAME` is your repository name, for example, if your repository is `leapcell.io/issac/blog`, then `REPO_NAME` is `issac/blog`.

`TABLE_ID` is your table ID, for example, if your table is `leapcell.io/issac/blog/table/12345678`, then `TABLE_ID` is `12345678`.

The table defaults to using the table name, which is the name you set in the table. If you want to use the table ID, you can set `name_type` to `id`.

```typescript
import { Leapcell } from "@leapcell/leapcell-js";

// Init client with token from env
const client = new Leapcell({
  apiKey: process.env.LEAPCELL_API_KEY!,
});

// Init table instance
const table = api.repo("{{REPO_NAME}}").table("{{TABLE_ID}}");

// Init table instance with table id
// const table = api.repo("{{REPO_NAME}}").table("{{TABLE_ID}}", "id");
```

### Get Table Meta Info

```typescript
// Get table meta info
const meta = await table.meta();
```

### Create Record

Leapcell automatically converts data based on the table's field types. If conversion fails, an exception is thrown.

```typescript
// Create record
const record = await table.records.create({
  title: "hello issac",
});
```

### Update Record

```typescript
// Update record
const record = await table.records.updateById({
  id: "7ba4d5f1-8c85-4155-8deb-6d7ad88977f3",
  data: { title: "hello issac again" },
});
console.log("records", record);
```

### Get Record By ID

```typescript
const record = await table.records.findById(
  "2bc243ee-7e77-4f5e-b5b2-2da9d70c6779"
);
console.log("record", record);
```

### Delete Record By ID

```typescript
const record = await table.records.deleteById(
  "7ba4d5f1-8c85-4155-8deb-6d7ad88977f3"
);
console.log("records", record);
```

### Get All Records

```typescript
const records = await table.records.findMany({});
```

### Get Record By Filter

Leapcell supports various query methods. If you're familiar with Prisma, you'll find the usage quite similar.

Get records if the title is "hello."

```typescript
const records = await table.records.findMany({
  where: {
    title: {
      eq: "hello",
    },
  },
});
console.log("records", records);
```

#### AND

Get records if the title is "hello" and the category is "tutorial."

```typescript
const records = await table.records.findMany({
  where: {
    AND: {
      title: {
        eq: "hello",
      },
      category: {
        eq: "tutorial",
      },
    },
  },
});
console.log("records", records);
```

#### OR

Get records if the title is "hello" or the category is "tutorial."

```typescript
const records = await table.records.findMany({
  where: {
    OR: {
      title: {
        eq: "hello",
      },
      category: {
        eq: "tutorial",
      },
    },
  },
});
console.log("records", records);
```

### Field Operators

For the supported field operators, you can refer to [Field Operators](https://docs.leapcell.com/api/field-operators).

The mapping between `op` and JS operators is as follows:

```typescript
// op: eq
{
    "title": {
        eq: 'hello',
    },
}

// op: gt
{
    "title": {
        gt: 'hello',
    },
}

// op: gte
{
    "title": {
        gte: 'hello',
    },
}

// op: lt
{
    "title": {
        lt: 'hello',
    },
}

// op: lte
{
    "title": {
        lte: 'hello',
    },
}

// op: neq
{
    "title": {
        neq: 'hello',
    },
}

// op: contain
{
    "title": {
        contain: 'hello',
    },
}

// op: in
{
    "title": {
        in: ['hello', 'world'],
    },
}

// op: not_in

{
    "title": {
        not_in: ['hello', 'world'],
    },
}

// op: is_null
{
    "title": {
        is_null: true,
    },
}

// op: is_not_null
{
    "title": {
        is_not_null: true,
    },
}
```

### Get Records and Sort

```typescript
// Get records with sorting
const records2 = await table.records.findMany({
  where: {
    name: {
      eq: "GGG",
    },
  },
  orderBy: {
    name: "asc",
  },
});
```

### Get Records and Pagination

Get records with a limit of 10 and an offset of 0.

```typescript
const records2 = await table.records.findMany({
  where: {
    name: {
      eq: "issac",
    },
  },
  orderBy: {
    name: "asc",
  },
  offset: 0,
  limit: 10,
});
```

### Update Record By Filter

```typescript
// Update records
const records = await table.records.updateMany({
  where: {
    name: {
      eq: "issac",
    },
  },
  data: {
    category: "blog",
  },
});
console.log("records", records);
```

### Delete Record By Filter

```typescript
// Delete records
const records = await table.records.deleteMany({
  where: {
    name: {
      neq: "issac",
    },
  },
});
console.log("records", records);
```

### Bulk Create

```typescript
// Bulk create
const records = await table.records.createMany([
  {
    name: "Alice",
  },
  {
    name: "Bob",
  },
]);
console.log("records", records);
```

### Search

Leapcell supports image uploads. You can upload images to Leapcell and save the image URLs to the table.

Images will be uploaded to the CDN.

```typescript
const image = await axios.get(
  "https://leapcell-dev-bucket.s3.amazonaws.com/920417ee6a70435084fe6b40d58dad4e.jpeg",
  {
    responseType: "arraybuffer",
  }
);
const imageItem = await table.file.upload(image.data);
console.log("imageItem", imageItem);
```

### Aggregate

#### Count

```typescript
// Count all records
const count = await table.records.count();
console.log("count", count);

// Count records where the name is "issac"
const count2 = await table.records.count({
  where: {
    name: {
      eq: "issac",
    },
  },
});
console.log("count", count2);
```
