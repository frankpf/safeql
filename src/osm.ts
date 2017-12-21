/* tslint:disable */


/**
 * AUTO-GENERATED FILE @ 2017-12-19 16:58:18 - DO NOT EDIT!
 *
 * This file was automatically generated by schemats v.3.0.1
 * $ schemats generate -c postgresql://username:password@localhost:15432/cart -t products -t users -t prices_history -s public
 *
 */

export type sstatus = 'high' | 'low';

export namespace productsFields {
    export type name = string;
    export type available = boolean;
    export type price = number;
    export type description = string | null;
    export type stock_status = sstatus;

}

export interface products {
    name: productsFields.name;
    available: productsFields.available;
    price: productsFields.price;
    description: productsFields.description;
    stock_status: productsFields.stock_status;

}

export namespace usersFields {
    export type id = string;
    export type email = string | null;
    export type pwd_hash = string;
    export type join_date = Date;
    export type is_valid = boolean;
    export type deleted = boolean;
    export type last_active = Date | null;

}

export interface users {
    id: usersFields.id;
    email: usersFields.email;
    pwd_hash: usersFields.pwd_hash;
    join_date: usersFields.join_date;
    is_valid: usersFields.is_valid;
    deleted: usersFields.deleted;
    last_active: usersFields.last_active;

}

export namespace prices_historyFields {
    export type product_name = string;
    export type price = number;
    export type timestamp = Date;

}

export interface prices_history {
    product_name: prices_historyFields.product_name;
    price: prices_historyFields.price;
    timestamp: prices_historyFields.timestamp;

}
