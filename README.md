# safeql

SafeQL is an experiment in making a fully type-safe SQL query builder.

# TRIGGER WARNING

The current code is ugly.

## Example usage

Let's say you have two tables as defined in [products.sql](./tests/sql/products.sql) and [users.sql](./tests/sql/users.sql).

First, install `schemats`:

	yarn global add schemats
	# if using npm
	npm install -g schemats

Generate the type definitions from the database:

	schemats generate -c postgres://localhost:5432/mydb -s public -o osm.ts

In your project, import the type definitions and create a new SafeQL client:

```typescript

import { users, products } from './osm'
import SafeQL from './safeql'

type MyDatabase = {
	'products': products,
	'users': users,
}

async function main() {
	const client = SafeQL<MyDatabase>('postgresql://localhost:5432/mydb')
	const table = client('products')
	const products = await table
		.select(['name', 'description']))
		.exec()

	for (const product of products) {
		console.log(product.name)
		console.log(product.description)
		// console.log(product.price) // <- The compiler catches the bug for us! We didn't select the 'price' field
	}

	// table.select(['descriptio']) // <- Compiler complains here too that 'descriptio' is not a valid column :)
}
```






