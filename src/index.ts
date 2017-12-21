/* tslint:disable */

import * as pg from 'pg'
import { users, products, prices_history } from './osm'

export default function SafeQL<Schema>(uri: string) {
	return function buildTable<Name extends keyof Schema>(name: Name) {
		return new Table<Schema[Name], Name, keyof Schema[Name]>(name, uri)
	}
}

class Table<Schema, Name extends string, Fields extends keyof Schema, DisabledKeys extends keyof Table<Schema, Name, Fields, DisabledKeys> = 'name'> {
	private client: pg.Client

	constructor(public readonly name: Name,
		        private uri: string,
		        private selector?: '*' | (keyof Schema)[],
		        private filter?: Partial<{ [Field in keyof Schema]: Schema[Field] }>
		        ) {
		this.client = new pg.Client({ connectionString: uri })
	}

	select                                  (items: '*'              ): DisableSelect<Schema, Name, keyof Schema, DisabledKeys>
	select<FieldSubset extends keyof Schema>(items: FieldSubset[]    ): DisableSelect<Schema, Name, FieldSubset, DisabledKeys>
	select<FieldSubset extends keyof Schema>(items: '*' | FieldSubset[]): DisableSelect<Schema, Name, keyof Schema, DisabledKeys> | DisableSelect<Schema, Name, FieldSubset, DisabledKeys> {
		if (items == '*') {
			const selector = '*'
			return new Table<Schema, Name, keyof Schema, DisabledKeys>(this.name, this.uri, selector) as any
		} else {
			const selector = items
			return new Table<Schema, Name, FieldSubset, DisabledKeys>(this.name, this.uri, selector) as any
		}
	}

	where(obj: Partial<{ [Field in keyof Schema]: Schema[Field] }>): DisableWhere<Schema, Name, Fields, DisabledKeys> {
		/* unimplemented */
		return new Table<Schema, Name, Fields, DisabledKeys>(this.name, this.uri, this.selector, obj) as any
	}

	exec(): Promise< Pick<Schema, Fields>[]> {
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
			.query(`SELECT ${this.selector} FROM ${this.name}`)
			.then(result => result.rows)
	}
}

type TableWithoutSelect<S,N extends string,T extends keyof S>=Pick<Table<S,N,T>, 'exec'|'where'>
