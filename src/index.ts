/* tslint:disable */

import * as pg from 'pg'
import { users, products, prices_history } from './osm'
import { Omit } from 'type-zoo'
import * as GetmoreSchema from './GetmoreSchema'

type DatabaseLike<D> = {
	[K in keyof D]: SchemaLike<D[K]>
}
export default function SafeQL<Database extends DatabaseLike<Database>>(uri: string) {
	return function buildTable<Name extends keyof Database>(name: Name) {
		return new Table<Database[Name], Name, keyof Database[Name], false>(name, uri)
	}
}

class Table<Schema extends SchemaLike<Schema>, Name extends string, Columns extends keyof Schema, IsPrimary extends boolean> {
	private client: pg.Client

	constructor(
		public readonly name: Name,
		private uri: string,
		private selector?: '*' | (keyof Schema)[],
		private filter?: { [col: string]: any }
	) {
		//this.client = pgPromise()(uri)
		this.client = new pg.Client({ connectionString: uri })
	}

	/*
	select                                  (items: '*'                ): Table<Schema, Name, keyof Schema>
	select<FieldSubset extends keyof Schema>(...items: FieldSubset[]      ): Table<Schema, Name, FieldSubset>
	select<FieldSubset extends keyof Schema>(...items: '*' | FieldSubset[]): Table<Schema, Name, keyof Schema> | Table<Schema, Name, FieldSubset> {
		if (items == '*') {
			const selector = '*'
			return new Table<Schema, Name, keyof Schema>(this.name, this.uri, selector) as any
		} else {
			const selector = items
			return new Table<Schema, Name, FieldSubset>(this.name, this.uri, selector) as any
		}
	}
	*/

	select<SelectedColumns extends keyof Schema>(...items: SelectedColumns[]): Table<Schema, Name, SelectedColumns, IsPrimary> {
		const selector = items
		return new Table<Schema, Name, SelectedColumns, IsPrimary>(this.name, this.uri, selector) as any
	}

	where<
		WhereColumn extends keyof Schema,
		Primaries = { [K in WhereColumn]: Schema[K]['primaryKey'] }
	>(obj: Partial<{ [K in WhereColumn]: Schema[K]['type'] }>): Table<Schema, Name, Columns, ValuesOf<Primaries> extends false ? false : true> {
		return new Table<Schema, Name, Columns, ValuesOf<Primaries> extends false ? false : true>(this.name, this.uri, this.selector, obj) as any
	}

	execM<Prim extends boolean = IsPrimary extends false ? false : true>(x: Prim ) {}
	exec<
		Picked extends Pick<Schema, Columns> = Pick<Schema, Columns>, Out = { [K in keyof Picked]: Picked[K]['type'] }
	>(): IsPrimary extends false ? Promise<Out[]> : Promise<Out> {
		this.client.connect()
		if (!this.selector) {
			throw new Error('.select() not called')
		}

		let selectStr;
		if (this.selector == '*') {
			selectStr = '*'
		} else {
			selectStr = this.selector!.join(', ')
		}

		if (this.filter) {
			let whereStr = ''
			for (const [key, val] of Object.entries(this.filter))  {
				whereStr += `${key}='${val}' AND`
			}
			// Remove trailing AND
			whereStr = whereStr.slice(0, whereStr.length - 4)
			return this.client
				.query(`SELECT ${selectStr} FROM ${this.name} WHERE ${whereStr}`)
				.then(result => result.rows)
		}

		return this.client
			.query(`SELECT ${selectStr} FROM ${this.name}`)
			.then(result => JSON.parse( JSON.stringify(result.rows)) )
	}
}


type Tk = { id: { type: string }, x: { type: string } }


type SchemaLike<T> = {
	[K in keyof T]: { type: any, primaryKey: boolean, unique: boolean }
}
function selectOne<T extends SchemaLike<T>, Fields extends keyof T>(...columns: Fields[]): { [K in keyof Pick<T, Fields>]: T[K]['type'] }[] {
	return 1 as any
}

function where<
	T extends SchemaLike<T>,
	WhereColumn extends keyof Result =  Result,
	Column extends keyof T = keyof T,
	Result = { [ K in keyof Pick<T, Column>]: T[K]['type'] },
	WhereResult = { [ K in keyof Pick<T, WhereColumn>]: T[K]['type'] },
	Primaries = { [ K in keyof Pick<T, WhereColumn>]: T[K]['primaryKey'] },
>(items: Result[], x: Partial<WhereResult>): ValuesOf<Primaries> extends false ? Result[] : Result  {
	return 1 as any
}


type A = {
	id:			{ primaryKey: false, type: string, unique: false },
	name:		{ primaryKey: false, type: number, unique: false }
}
type B = {
	id:			{ primaryKey: true, type: string, unique: false },
	name:		{ primaryKey: false, type: number, unique: false }
}

let items = selectOne<B, 'id' | 'name'>('id')
let filteredP = where<B, 'id' >(items, { id: 'okdsa' })
let filteredNP = where<B, 'name' >(items, {name: 1, })

type ValuesOf<T> = T[keyof T]

type A1 = Assert<typeof items, {id: string}[]>
type A2 = Assert<typeof filteredP, {id: string}>
type A3 = Assert<typeof filteredNP, {id:string}[]>


type Assert<T extends Assertion, Assertion> = true

type MyDatabase = {
	'users': users
	'products': products
}

type GetmoreDatabase = {
	'Users': GetmoreSchema.Users,
	'Credits': GetmoreSchema.Credits
}

async function main() {
const client = SafeQL<GetmoreDatabase>('')

SafeQL<StaticTypes>('', RuntimeTypes)

// TODO: Refactor where into whereOne and whereMany
// Sadly, using just `where` wouldn't work. Even though
// we know at compile-time if a primary key was passed in,
// we can't know that at runtime (without resorting to something like io-ts).
// However, what we CAN do is divide where into two functions:
// - whereOne -> Errors if not given at least one UNIQUE key
// - whereMany -> Errors if given at least one UNIQUE key
let table =    client('Users')
let selected = table.select('name', 'commonId')
let filtered = selected.where({ id: 'string', commonId: 'string', phoneInfo:1 })

const items = await filtered.execM(true)

items.id
items.deleted
items.commonId
items.name

for (const item of items) {
	let a = item.id
	let b =  item.deleted
	let c = item.commonId
	let d = item.name
}

}
