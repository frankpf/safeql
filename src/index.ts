/* tslint:disable */

import * as pg from 'pg'
import { users, products, prices_history } from './osm'

export default function SafeQL<Schema>(uri: string) {
	return function buildTable<Name extends keyof Schema>(name: Name) {
		return new Table<Schema[Name], Name, keyof Schema[Name]>(name, uri)
	}
}


class Table<Schema, Name extends string, Fields extends keyof Schema> {
	private client: pg.Client

	constructor(private name: Name, private uri: string, private selector?: string, private filter?: string) {
		this.client = new pg.Client({ connectionString: uri })
	}
	select                                  (items: '*'                ): TableWithoutSelect<Schema, Name, keyof Schema>
	select<FieldSubset extends keyof Schema>(items: FieldSubset[]      ): TableWithoutSelect<Schema, Name, FieldSubset>
	select<FieldSubset extends keyof Schema>(items: '*' | FieldSubset[]): ( TableWithoutSelect<Schema, Name, keyof Schema> | TableWithoutSelect<Schema, Name, FieldSubset>)
	{
		if (items == '*') {
			const selector = '*'
			return new Table<Schema, Name, keyof Schema>(this.name, this.uri, selector)
		} else {
			const selector = `${items}`
			return new Table<Schema, Name, keyof Schema>(this.name, this.uri, selector)
		}
	}

	where(obj: Partial<{ [Field in Fields]: Schema[Field] }>) {
		/* unimplemented */
	}

	exec(): Promise< Pick<Schema, Fields>[] > {
		return this.client
			.query(`SELECT ${this.selector} FROM ${this.name}`)
			.then(result => result.rows)
	}
}

type TableWithoutSelect<S,N extends string,T extends keyof S>=Pick<Table<S,N,T>, 'exec'|'where'>
